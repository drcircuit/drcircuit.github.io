#!/bin/bash

# Build printer/crawler-friendly static HTML page from all markdown files
# Simple conversion with no JavaScript, minimal CSS

set -e

OUTPUT_FILE="single-page.html"

echo "Building printer-friendly single-page HTML..."

# Create a Python script for markdown conversion
cat > /tmp/md_to_html.py << 'PYSCRIPT'
import sys
import re
import html

file_path = sys.argv[1]
in_code = False

with open(file_path, 'r') as f:
    for line in f:
        line = line.rstrip('\n')
        
        # Skip custom template tags
        if line.strip().startswith('$'):
            continue
        
        # Check for code block markers
        if line.strip().startswith('```'):
            if not in_code:
                print('<pre><code>')
                in_code = True
            else:
                print('</code></pre>')
                in_code = False
            continue
        
        if in_code:
            # Inside code block - escape HTML
            print(html.escape(line))
        else:
            # Skip empty lines but preserve them
            if not line.strip():
                print('')
                continue
            
            line = line.strip()
            
            # Process headings
            if line.startswith('### '):
                print(f'<h3>{line[4:]}</h3>')
                continue
            elif line.startswith('## '):
                print(f'<h2>{line[3:]}</h2>')
                continue
            elif line.startswith('# '):
                print(f'<h1>{line[2:]}</h1>')
                continue
            
            # Process images: ![alt](url "attributes") or ![alt](url)
            line = re.sub(r'!\[([^\]]*)\]\(([^ "]+)[^)]*\)', r'<img src="\2" alt="\1" />', line)
            
            # Process links: [text](url)
            line = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', line)
            
            # Process bold: **text** or __text__
            line = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', line)
            line = re.sub(r'__([^_]+)__', r'<strong>\1</strong>', line)
            
            # Process italic: *text* or _text_
            line = re.sub(r'\*([^*]+)\*', r'<em>\1</em>', line)
            
            # Process inline code: `text`
            line = re.sub(r'`([^`]+)`', r'<code>\1</code>', line)
            
            # Process list items: - item or * item
            if line.startswith('- '):
                print(f'<li>{line[2:]}</li>')
            else:
                print(line)
PYSCRIPT

# Wrapper function to call Python script
md_to_html() {
    python3 /tmp/md_to_html.py "$1"
}

# Create the HTML header
cat > "$OUTPUT_FILE" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WorkingClassHacker - Complete Blog</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        h1, h2, h3 {
            margin-top: 2em;
            margin-bottom: 0.5em;
        }
        h1 {
            font-size: 2em;
            border-bottom: 3px solid #333;
            padding-bottom: 0.3em;
        }
        h2 {
            font-size: 1.5em;
            border-bottom: 2px solid #ccc;
            padding-bottom: 0.2em;
        }
        h3 {
            font-size: 1.2em;
        }
        p {
            margin: 0.5em 0;
        }
        section {
            page-break-after: auto;
            break-after: auto;
            margin-bottom: 3em;
        }
        code {
            background-color: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: "Courier New", monospace;
        }
        pre {
            background-color: #f4f4f4;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            border-left: 4px solid #333;
        }
        pre code {
            background-color: transparent;
            padding: 0;
            border-radius: 0;
        }
        blockquote {
            border-left: 4px solid #ccc;
            margin-left: 0;
            padding-left: 20px;
            color: #666;
        }
        img {
            max-width: 100%;
            height: auto;
            margin: 1em 0;
        }
        ul, ol {
            margin: 0.5em 0;
            padding-left: 2em;
        }
        li {
            margin: 0.25em 0;
        }
        a {
            color: #0066cc;
            text-decoration: none;
        }
        a:visited {
            color: #663399;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 1em 0;
        }
        table th,
        table td {
            border: 1px solid #ddd;
            padding: 8px 12px;
            text-align: left;
        }
        table th {
            background-color: #f9f9f9;
            font-weight: bold;
        }
        footer {
            margin-top: 4em;
            padding-top: 2em;
            border-top: 2px solid #ccc;
            font-size: 0.9em;
            color: #666;
            text-align: center;
        }
        @media print {
            body {
                padding: 0;
            }
            section {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>

EOF

# Process pages (in order)
echo "Combining pages..."
for page in pages/main/0{1..9}-*.md pages/main/[1-9][0-9]-*.md; do
    [ -f "$page" ] || continue
    
    filename=$(basename "$page" .md)
    section_id="${filename#[0-9]*-}"
    
    echo "  Processing: $page"
    
    # Extract title (first # heading)
    title=$(grep -m1 "^#" "$page" | sed 's/^# //')
    
    # Add content section
    cat >> "$OUTPUT_FILE" << EOF
<section id="page-$section_id">
EOF
    
    # Convert markdown to HTML and append
    md_to_html "$page" >> "$OUTPUT_FILE"
    
    cat >> "$OUTPUT_FILE" << 'EOF'
</section>

EOF
done

# Add posts section
cat >> "$OUTPUT_FILE" << 'EOF'
<section id="posts-section">
<h1>Blog Posts</h1>
</section>

EOF

# Process posts (sorted by filename)
echo "Combining posts..."
for post in posts/*.md; do
    [ -f "$post" ] || continue
    
    filename=$(basename "$post" .md)
    post_id="${filename//-/_}"
    
    echo "  Processing: $post"
    
    # Add content section
    cat >> "$OUTPUT_FILE" << EOF
<section id="post-$post_id">
EOF
    
    # Convert markdown to HTML and append
    md_to_html "$post" >> "$OUTPUT_FILE"
    
    cat >> "$OUTPUT_FILE" << 'EOF'
</section>

EOF
done

# Close the HTML
cat >> "$OUTPUT_FILE" << 'EOF'
    <footer>
        <p>Copyright © 2023-2026 by SunnyTownRoad Productions</p>
    </footer>

</body>
</html>
EOF

echo "✓ Single-page HTML generated: $OUTPUT_FILE"
echo "✓ File is printer-friendly and crawler-ready"
echo ""
echo "To use the generated file:"
echo "  1. Open $OUTPUT_FILE in a browser"
echo "  2. Print to PDF: Press Ctrl+P (or Cmd+P on Mac)"
echo "  3. Serve it with: python3 -m http.server 8000"
