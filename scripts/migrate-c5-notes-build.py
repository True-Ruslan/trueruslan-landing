from pathlib import Path

root = Path(__file__).resolve().parents[1]
path = root / "scripts/copy-assets.js"
source = path.read_text(encoding="utf-8")

replacements = [
    (
        "  applyFeedDiscovery,\n  applyNoteEnhancements,\n  loadNotesManifest,\n",
        "  applyFeedDiscovery,\n  applyNoteEnhancements,\n  applyNotesIndex,\n  loadNotesManifest,\n",
        "notes import",
    ),
    (
        "  const projectEvidenceStylesheetTargets = applyProjectEvidenceStylesheet(outputDir, projectEvidenceTargets);\n  const noteTargets = applyNoteEnhancements(outputDir, notes);\n",
        "  const projectEvidenceStylesheetTargets = applyProjectEvidenceStylesheet(outputDir, projectEvidenceTargets);\n  const notesIndexTarget = applyNotesIndex(outputDir, notes);\n  const noteTargets = applyNoteEnhancements(outputDir, notes);\n",
        "notes build call",
    ),
    (
        "    projectEvidenceStylesheetTargets,\n    noteTargets,\n",
        "    projectEvidenceStylesheetTargets,\n    notesIndexTarget,\n    noteTargets,\n",
        "notes return value",
    ),
    (
        "    if (result.projectEvidenceStylesheetTargets.length) console.log(`Wired Project Evidence stylesheet into ${result.projectEvidenceStylesheetTargets.length} page(s).`);\n    console.log(`Enhanced ${result.noteTargets.length} Engineering Note page(s).`);\n",
        "    if (result.projectEvidenceStylesheetTargets.length) console.log(`Wired Project Evidence stylesheet into ${result.projectEvidenceStylesheetTargets.length} page(s).`);\n    console.log(`Engineering Notes index injected: ${result.notesIndexTarget}`);\n    console.log(`Enhanced ${result.noteTargets.length} Engineering Note page(s).`);\n",
        "notes build diagnostics",
    ),
]

for old, new, label in replacements:
    count = source.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly one anchor, found {count}")
    source = source.replace(old, new, 1)

path.write_text(source, encoding="utf-8")
print("C5 Notes build integration prepared successfully")
