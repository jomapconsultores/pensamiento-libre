from pathlib import Path


SUPPORTED_EXTENSIONS = {".txt", ".md", ".docx", ".pdf"}


def read_file(file_path: str) -> str:
    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"Archivo no encontrado: {file_path}")

    ext = path.suffix.lower()

    if ext not in SUPPORTED_EXTENSIONS:
        raise ValueError(
            f"Formato no soportado: {ext}. "
            f"Use: {', '.join(SUPPORTED_EXTENSIONS)}"
        )

    if ext in (".txt", ".md"):
        return _read_text(path)
    elif ext == ".docx":
        return _read_docx(path)
    elif ext == ".pdf":
        return _read_pdf(path)


def _read_text(path: Path) -> str:
    for encoding in ("utf-8", "latin-1", "cp1252"):
        try:
            return path.read_text(encoding=encoding)
        except UnicodeDecodeError:
            continue
    raise ValueError(f"No se pudo leer el archivo: {path}")


def _read_docx(path: Path) -> str:
    try:
        from docx import Document
        doc = Document(str(path))
        return "\n".join(p.text for p in doc.paragraphs if p.text.strip())
    except ImportError:
        raise ImportError("Instala python-docx: pip install python-docx")
    except Exception as e:
        raise ValueError(f"Error leyendo .docx: {e}")


def _read_pdf(path: Path) -> str:
    try:
        from pypdf import PdfReader
        reader = PdfReader(str(path))
        pages = [page.extract_text() or "" for page in reader.pages]
        return "\n".join(pages)
    except ImportError:
        raise ImportError("Instala pypdf: pip install pypdf")
    except Exception as e:
        raise ValueError(f"Error leyendo .pdf: {e}")


def list_supported_files(directory: str = ".") -> list:
    path = Path(directory)
    return [
        str(f) for f in path.iterdir()
        if f.is_file() and f.suffix.lower() in SUPPORTED_EXTENSIONS
    ]
