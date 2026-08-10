from pathlib import Path

root = Path(__file__).resolve().parents[1]
path = root / "docs/PROJECT_STATE.md"
source = path.read_text(encoding="utf-8")

replacements = [
    (
        "**C4 — Professional surfaces — NEXT IMPLEMENTATION SLICE.**",
        "**C5 — Knowledge surfaces — NEXT IMPLEMENTATION SLICE.**",
        "approved next slice",
    ),
    (
        "it is not closed or reset by C2/C3 presentation work.",
        "it is not closed or reset by C2/C3/C4 presentation work.",
        "P3.6 presentation boundary",
    ),
]

for old, new, label in replacements:
    count = source.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly one anchor, found {count}")
    source = source.replace(old, new, 1)

path.write_text(source, encoding="utf-8")
print("C5 next pointer prepared successfully")
