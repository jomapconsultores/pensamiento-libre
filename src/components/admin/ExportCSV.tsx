'use client';

interface ExportCSVProps {
  filename: string;
  headers: { key: string; label: string }[];
  rows: Record<string, unknown>[];
}

function escapeCSV(value: unknown): string {
  if (value === null || value === undefined) return '';
  let s = String(value);
  // Neutralizar inyección de fórmulas (Excel/LibreOffice) desde entrada pública
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  if (/[",\n\r;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function ExportCSV({ filename, headers, rows }: ExportCSVProps) {
  function download() {
    const headerLine = headers.map((h) => escapeCSV(h.label)).join(',');
    const dataLines = rows.map((row) =>
      headers.map((h) => escapeCSV(row[h.key])).join(',')
    );
    const csv = '﻿' + [headerLine, ...dataLines].join('\r\n'); // BOM para Excel

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `${filename}-${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={download}
      disabled={rows.length === 0}
      className="btn-outline text-sm disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg className="w-4 h-4 mr-2 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
      </svg>
      Descargar CSV ({rows.length})
    </button>
  );
}
