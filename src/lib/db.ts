/**
 * Acceso a la base de Pensamiento Libre: PostgreSQL directo.
 *
 * Conserva la forma de escribir las consultas que ya usaba el sitio
 * (`db.from('tabla').select('*').eq('id', x).maybeSingle()` y compañía, con
 * respuesta `{ data, error, count }`), pero las resuelve con SQL sobre la
 * conexión de DATABASE_URL. Solo se usa en el servidor.
 *
 * Desarrollado por Marco Antonio Posligua San Martín.
 */
import postgres from 'postgres';

type Fila = Record<string, unknown>;
export type ErrorDB = { message: string; code?: string; details?: string | null; hint?: string | null };
export type Resultado<T = any> = { data: T | null; error: ErrorDB | null; count: number | null };

let conexion: ReturnType<typeof postgres> | null = null;

function sql() {
  if (!conexion) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL no está configurada.');
    conexion = postgres(url, { max: 5, idle_timeout: 60, connect_timeout: 10, prepare: false });
  }
  return conexion;
}

const ident = (n: string) => {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(n)) throw new Error(`Identificador no válido: ${n}`);
  return `"${n}"`;
};

function columnas(texto: string, alias = '') {
  const t = (texto || '*').trim();
  const pre = alias ? `${alias}.` : '';
  if (t === '*') return `${pre}*`;
  return t.split(',').map((c) => `${pre}${ident(c.trim())}`).join(', ');
}

function aError(e: any): ErrorDB {
  return { message: String(e?.message ?? e), code: e?.code, details: e?.detail ?? null, hint: e?.hint ?? null };
}

class Consulta<T = any[]> implements PromiseLike<Resultado<T>> {
  private operacion: 'select' | 'insert' | 'update' | 'upsert' | 'delete' = 'select';
  private cols = '*';
  private devolver = false;
  private contar = false;
  private soloConteo = false;
  private filtros: { col: string; valor: unknown }[] = [];
  private ordenes: string[] = [];
  private tope: number | null = null;
  private cuerpo: Fila | Fila[] | null = null;
  private conflicto: string | null = null;
  private ignorar = false;
  private forma: 'lista' | 'uno' | 'quizas' = 'lista';

  constructor(private tabla: string) {}

  select(cols = '*', opciones?: { count?: 'exact' | 'planned' | 'estimated'; head?: boolean }) {
    this.cols = cols;
    if (this.operacion !== 'select') this.devolver = true;
    if (opciones?.count) this.contar = true;
    if (opciones?.head) this.soloConteo = true;
    return this;
  }
  insert(datos: Fila | Fila[]) { this.operacion = 'insert'; this.cuerpo = datos; return this; }
  update(datos: Fila) { this.operacion = 'update'; this.cuerpo = datos; return this; }
  delete() { this.operacion = 'delete'; return this; }
  upsert(datos: Fila | Fila[], opciones?: { onConflict?: string; ignoreDuplicates?: boolean }) {
    this.operacion = 'upsert'; this.cuerpo = datos;
    this.conflicto = opciones?.onConflict ?? null;
    this.ignorar = !!opciones?.ignoreDuplicates;
    return this;
  }
  eq(col: string, valor: unknown) { this.filtros.push({ col, valor }); return this; }
  order(col: string, opciones?: { ascending?: boolean; nullsFirst?: boolean }) {
    const asc = opciones?.ascending !== false;
    let t = `${ident(col)} ${asc ? 'ASC' : 'DESC'}`;
    if (opciones?.nullsFirst !== undefined) t += opciones.nullsFirst ? ' NULLS FIRST' : ' NULLS LAST';
    this.ordenes.push(t);
    return this;
  }
  limit(n: number) { this.tope = Math.trunc(n); return this; }
  single(): Consulta<any> { this.forma = 'uno'; return this as unknown as Consulta<any>; }
  maybeSingle(): Consulta<any> { this.forma = 'quizas'; return this as unknown as Consulta<any>; }

  private donde(params: unknown[]) {
    if (!this.filtros.length) return 'TRUE';
    return this.filtros.map(({ col, valor }) => {
      if (valor === null) return `${ident(col)} IS NULL`;
      params.push(typeof valor === 'object' ? JSON.stringify(valor) : String(valor));
      return `${ident(col)}::text = $${params.length}::text`;
    }).join(' AND ');
  }

  private async ejecutar(): Promise<Resultado<T>> {
    const db = sql();
    const t = ident(this.tabla);
    const params: unknown[] = [];
    try {
      let consulta: string;
      if (this.operacion === 'select') {
        const where = this.donde(params);
        let conteo: number | null = null;
        if (this.contar) {
          const r = await db.unsafe(`SELECT count(*)::int AS n FROM public.${t} WHERE ${where}`, params as any[]);
          conteo = r[0].n as number;
          if (this.soloConteo) return { data: null, error: null, count: conteo };
        }
        consulta = `SELECT ${columnas(this.cols)} FROM public.${t} WHERE ${where}`;
        if (this.ordenes.length) consulta += ` ORDER BY ${this.ordenes.join(', ')}`;
        if (this.tope !== null) consulta += ` LIMIT ${this.tope}`;
        const filas = await this.leer(db, consulta, params);
        return this.formar(filas, conteo);
      }

      if (this.operacion === 'insert' || this.operacion === 'upsert') {
        const filas = Array.isArray(this.cuerpo) ? this.cuerpo : [this.cuerpo ?? {}];
        const cols = Object.keys(filas[0] ?? {});
        params.push(JSON.stringify(filas));
        const lista = cols.map(ident).join(', ');
        consulta = `INSERT INTO public.${t} (${lista}) SELECT ${cols.map((c) => `_j.${ident(c)}`).join(', ')} ` +
          `FROM json_populate_recordset(NULL::public.${t}, $1::text::json) _j`;
        if (this.operacion === 'upsert') {
          const objetivo = this.conflicto ? this.conflicto.split(',').map((c) => ident(c.trim())).join(', ') : null;
          const clave = objetivo ? `(${objetivo})` : '';
          const actualizar = cols.filter((c) => !(this.conflicto ?? '').split(',').map((x) => x.trim()).includes(c));
          consulta += this.ignorar || !actualizar.length
            ? ` ON CONFLICT ${clave} DO NOTHING`
            : ` ON CONFLICT ${clave} DO UPDATE SET ${actualizar.map((c) => `${ident(c)} = EXCLUDED.${ident(c)}`).join(', ')}`;
        }
      } else if (this.operacion === 'update') {
        const datos = (this.cuerpo ?? {}) as Fila;
        params.push(JSON.stringify(datos));
        const asignar = Object.keys(datos).map((c) => `${ident(c)} = _j.${ident(c)}`).join(', ');
        const where = this.donde(params).replace(/"([A-Za-z_][A-Za-z0-9_]*)"::text/g, '_b."$1"::text')
          .replace(/"([A-Za-z_][A-Za-z0-9_]*)" IS NULL/g, '_b."$1" IS NULL');
        consulta = `UPDATE public.${t} AS _b SET ${asignar} FROM json_populate_record(NULL::public.${t}, $1::text::json) _j WHERE ${where}`;
      } else {
        consulta = `DELETE FROM public.${t} WHERE ${this.donde(params)}`;
      }

      if (this.devolver) {
        consulta += ` RETURNING ${columnas(this.cols, this.operacion === 'update' ? '_b' : '')}`;
        const filas = await this.leer(db, consulta, params, true);
        return this.formar(filas, null);
      }
      await db.unsafe(consulta, params as any[]);
      return { data: null, error: null, count: null };
    } catch (e) {
      return { data: null, error: aError(e), count: null };
    }
  }

  /** El JSON lo arma PostgreSQL, igual que antes: fechas ISO, números y uuid como texto. */
  private async leer(db: ReturnType<typeof postgres>, consulta: string, params: unknown[], esEscritura = false) {
    const envuelta = esEscritura
      ? `WITH _m AS (${consulta}) SELECT coalesce(json_agg(_m), '[]'::json) AS filas FROM _m`
      : `SELECT coalesce(json_agg(_s), '[]'::json) AS filas FROM (${consulta}) _s`;
    const r = await db.unsafe(envuelta, params as any[]);
    const filas = r[0].filas;
    return (typeof filas === 'string' ? JSON.parse(filas) : filas) as Fila[];
  }

  private formar(filas: Fila[], conteo: number | null): Resultado<T> {
    if (this.forma === 'lista') return { data: filas as unknown as T, error: null, count: conteo };
    if (filas.length === 1) return { data: filas[0] as unknown as T, error: null, count: conteo };
    if (this.forma === 'quizas' && filas.length === 0) return { data: null, error: null, count: conteo };
    return { data: null, count: conteo,
      error: { code: 'PGRST116', message: 'JSON object requested, multiple (or no) rows returned',
               details: `The result contains ${filas.length} rows`, hint: null } };
  }

  then<R1 = Resultado<T>, R2 = never>(ok?: ((v: Resultado<T>) => R1 | PromiseLike<R1>) | null,
                                      mal?: ((e: unknown) => R2 | PromiseLike<R2>) | null): PromiseLike<R1 | R2> {
    return this.ejecutar().then(ok, mal);
  }
}

export type BaseDatos = { from: <T = any[]>(tabla: string) => Consulta<T> };

const cliente: BaseDatos = { from: (tabla) => new Consulta(tabla) };

/** Cliente de base de datos del servidor. */
export function baseDatos(): BaseDatos {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL no está configurada. Necesaria para leer y escribir en la base.');
  }
  return cliente;
}

export type ContactMessageRow = {
  id?: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  created_at?: string;
};

export type DonationRow = {
  id?: string;
  stripe_session_id: string;
  stripe_customer_id?: string | null;
  amount_cents: number;
  currency: string;
  donor_email?: string | null;
  recurring: boolean;
  status: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
};

export type MembershipRow = {
  id?: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  tier: 'basic' | 'premium' | string;
  status: string;
  member_email?: string | null;
  current_period_end?: string | null;
  created_at?: string;
};

export type NewsletterSubscriberRow = {
  id?: string;
  email: string;
  source?: string | null;
  created_at?: string;
};
