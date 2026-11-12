#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/strip-image-metadata.sh path/to/photo.jpg [more files...]
# Requires ExifTool. Keeps image pixels while removing EXIF/IPTC/XMP metadata.
if ! command -v exiftool >/dev/null 2>&1; then
  echo "ExifTool belum terpasang. Install: sudo apt install libimage-exiftool-perl" >&2
  exit 1
fi
if [[ "$#" -eq 0 ]]; then
  echo "Usage: $0 image1.jpg [image2.webp ...]" >&2
  exit 2
fi
for file in "$@"; do
  [[ -f "$file" ]] || { echo "File tidak ditemukan: $file" >&2; exit 2; }
  exiftool -all= -overwrite_original "$file"
  echo "Metadata dibersihkan: $file"
done
