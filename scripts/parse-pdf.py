import fitz
import json
import os

PDF_PATH = "e:/Web_IELTS/app/grammar/giai-thich-ngu-phap.pdf"
OUTPUT_PATH = "e:/Web_IELTS/scripts/output/raw-text.json"

# Ensure output directory exists
os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

doc = fitz.open(PDF_PATH)
pages = []

for i, page in enumerate(doc):
    text = page.get_text().strip()
    if text:
        pages.append({"page": i + 1, "text": text})

with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
    json.dump(pages, f, ensure_ascii=False, indent=2)

print(f"Đã parse {len(pages)} trang → {OUTPUT_PATH}")
