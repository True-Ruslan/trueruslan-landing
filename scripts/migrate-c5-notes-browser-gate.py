from pathlib import Path

root = Path(__file__).resolve().parents[1]
path = root / ".github/workflows/build.yml"
source = path.read_text(encoding="utf-8")

replacements = [
    (
        "      - name: Sources Knowledge Base browser smoke\n        shell: bash\n        run: |\n          set -o pipefail\n          node scripts/sources-knowledge-base-smoke.cjs 2>&1 | tee sources-knowledge-base-smoke.log\n      - name: Project Evidence browser smoke\n",
        "      - name: Sources Knowledge Base browser smoke\n        shell: bash\n        run: |\n          set -o pipefail\n          node scripts/sources-knowledge-base-smoke.cjs 2>&1 | tee sources-knowledge-base-smoke.log\n      - name: Engineering Notes index browser smoke\n        shell: bash\n        run: |\n          set -o pipefail\n          node scripts/notes-index-browser-smoke.cjs 2>&1 | tee notes-index-browser-smoke.log\n      - name: Project Evidence browser smoke\n",
        "Notes browser step",
    ),
    (
        "          cp sources-knowledge-base-smoke.log quality-artifacts/sources-knowledge-base-smoke.log 2>/dev/null || true\n          cp project-evidence-smoke.log quality-artifacts/project-evidence-smoke.log 2>/dev/null || true\n",
        "          cp sources-knowledge-base-smoke.log quality-artifacts/sources-knowledge-base-smoke.log 2>/dev/null || true\n          cp notes-index-browser-smoke.log quality-artifacts/notes-index-browser-smoke.log 2>/dev/null || true\n          cp project-evidence-smoke.log quality-artifacts/project-evidence-smoke.log 2>/dev/null || true\n",
        "Notes browser log artifact",
    ),
    (
        "          cp docs-html/bibliography/index.html quality-artifacts/sources-knowledge-base-generated.html 2>/dev/null || true\n          cp docs-html/projects/vlezet/index.html quality-artifacts/vlezet-generated.html 2>/dev/null || true\n",
        "          cp docs-html/bibliography/index.html quality-artifacts/sources-knowledge-base-generated.html 2>/dev/null || true\n          cp docs-html/notes/index.html quality-artifacts/notes-index-generated.html 2>/dev/null || true\n          cp docs-html/projects/vlezet/index.html quality-artifacts/vlezet-generated.html 2>/dev/null || true\n",
        "Notes generated artifact",
    ),
    (
        "          cp artifacts/work-with-me-summary.json quality-artifacts/work-with-me-summary.json 2>/dev/null || true\n",
        "          cp artifacts/work-with-me-summary.json quality-artifacts/work-with-me-summary.json 2>/dev/null || true\n          cp artifacts/notes-index-summary.json quality-artifacts/notes-index-summary.json 2>/dev/null || true\n          cp artifacts/notes-index-mobile.png quality-artifacts/notes-index-mobile.png 2>/dev/null || true\n          cp artifacts/notes-index-no-js-desktop.png quality-artifacts/notes-index-no-js-desktop.png 2>/dev/null || true\n",
        "Notes browser evidence artifacts",
    ),
]

for old, new, label in replacements:
    count = source.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly one anchor, found {count}")
    source = source.replace(old, new, 1)

path.write_text(source, encoding="utf-8")
print("C5 Notes browser gate prepared successfully")
