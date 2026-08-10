from pathlib import Path

path = Path(__file__).resolve().parent / "copy-assets.js"
source = path.read_text(encoding="utf-8")

replacements = [
    (
        "  const content = `User-agent: *\\nAllow: /\\n\\nSitemap: ${siteUrl}/sitemap.xml\\n`;",
        """  const content = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;""",
        "robots.txt formatting",
    ),
    (
        "  const content = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>\\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\\n${urls}\\n</urlset>\\n`;",
        """  const content = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">
${urls}
</urlset>
`;""",
        "sitemap formatting",
    ),
]

for old, new, label in replacements:
    count = source.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly one anchor, found {count}")
    source = source.replace(old, new, 1)

path.write_text(source, encoding="utf-8")
print("C5 copy-assets formatting cleanup prepared")
