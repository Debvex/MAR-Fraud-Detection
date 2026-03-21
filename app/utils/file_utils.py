"""File helpers used across the project."""

from __future__ import annotations

from pathlib import Path


def ensure_file_exists(file_path: str) -> None:
    """Raise a clear error when the input file is missing."""
    if not Path(file_path).exists():
        raise FileNotFoundError(f"File not found: {file_path}")


def ensure_parent_dir(file_path: str | Path) -> None:
    """Create the parent directory for a file when needed."""
    Path(file_path).parent.mkdir(parents=True, exist_ok=True)


def read_text_if_possible(file_path: str) -> str | None:
    """Read text files safely and return None for binary-like content."""
    path = Path(file_path)
    try:
        return path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError):
        return None


def read_bytes(file_path: str) -> bytes:
    """Read a file as bytes."""
    return Path(file_path).read_bytes()
