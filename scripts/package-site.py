#!/usr/bin/env python3
"""Package actual site files, including new/untracked assets; never use git archive."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import argparse

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument("--output", type=Path, default=root.parent / "shared/downloads/yusuke-ikeda-website.zip")
args = parser.parse_args()
output = args.output.resolve()
output.parent.mkdir(parents=True, exist_ok=True)
excluded = {".git", "node_modules", "__pycache__", ".pytest_cache", ".venv", "test-results"}
files = [f for f in root.rglob("*") if f.is_file() and not set(f.relative_to(root).parts).intersection(excluded) and f.resolve() != output]
for relative in ["index.html", "css/style.css", "css/fonts.css", "js/main.js", "data/profile.json", "images/ogp.png"]:
    if not (root / relative).is_file():
        raise SystemExit("Required file missing: " + relative)
with ZipFile(output, "w", ZIP_DEFLATED) as archive:
    for f in sorted(files):
        if f.is_symlink():
            raise SystemExit("Do not package symlinks: " + str(f))
        archive.write(f, "yusuke-ikeda-website/" + f.relative_to(root).as_posix())
with ZipFile(output) as archive:
    assert archive.testzip() is None
    names = archive.namelist()
    assert "yusuke-ikeda-website/css/style.css" in names
    assert not any(".git" in Path(n).parts for n in names)
print(f"Created {output} ({len(files)} files, {output.stat().st_size:,} bytes)")
