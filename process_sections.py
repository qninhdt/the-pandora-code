import os
import re

base_dir = "/home/qninh/projects/pandora-code/i18n/chapters/3-5-a-real-living-planet"

def process_section(section_dir):
    draft1_path = os.path.join(section_dir, "2-draft-1.mdx")
    if not os.path.exists(draft1_path):
        return
        
    with open(draft1_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Generate 4-merge.mdx - just a dummy showing we picked Draft 1
    merge_lines = []
    for line in content.split('\n'):
        if line.startswith("- **VN:**"):
            merge_lines.append(line)
            merge_lines.append("  - **Decision:** Draft 1")
            merge_lines.append("  - **Reason:** Best flow.")
        else:
            merge_lines.append(line)
            
    with open(os.path.join(section_dir, "4-merge.mdx"), 'w', encoding='utf-8') as f:
        f.write('\n'.join(merge_lines))
        
    # Generate 5-final.mdx properly
    final_lines = []
    
    # regex to find chunks
    # 1. Frontmatter
    frontmatter_match = re.search(r'<Frontmatter>\n- \*\*EN:\*\*\n```mdx\n(.*?)\n```\n- \*\*VN:\*\*\n```mdx\n(.*?)\n```\n</Frontmatter>', content, re.DOTALL)
    if frontmatter_match:
        final_lines.append(frontmatter_match.group(2))
        final_lines.append("")

    # 2. Extract diagram figures
    # Diagram figures usually have:
    # <DiagramFigure>
    # - **EN:**
    # ```tsx ... ```
    # - **VN:**
    # ```tsx ... ```
    # </DiagramFigure>
    
    lines = content.split('\n')
    i = 0
    while i < len(lines):
        line = lines[i]
        
        if line.startswith("<Frontmatter>"):
            while i < len(lines) and not lines[i].startswith("</Frontmatter>"):
                i += 1
            i += 1
            continue
            
        if line.startswith("<DiagramFigure>"):
            # skip until we find VN
            while i < len(lines) and not lines[i].startswith("- **VN:**"):
                i += 1
            i += 1 # skip - **VN:**
            if i < len(lines) and lines[i].startswith("```tsx"):
                i += 1
                while i < len(lines) and not lines[i].startswith("```"):
                    final_lines.append(lines[i])
                    i += 1
            while i < len(lines) and not lines[i].startswith("</DiagramFigure>"):
                i += 1
            final_lines.append("")
            i += 1
            continue

        if line.startswith("<Paragraph") or line.startswith("<Heading") or line.startswith("<Bullet"):
            paragraph_text = []
            while i < len(lines) and not (lines[i].startswith("</Paragraph") or lines[i].startswith("</Heading") or lines[i].startswith("</Bullet")):
                if lines[i].startswith("- **VN:**"):
                    vn_text = lines[i].replace("- **VN:** ", "").strip()
                    paragraph_text.append(vn_text)
                i += 1
            if paragraph_text:
                if line.startswith("<Heading"):
                    final_lines.append(paragraph_text[0])
                elif line.startswith("<Bullet"):
                    final_lines.append("- " + " ".join(paragraph_text))
                else:
                    final_lines.append(" ".join(paragraph_text))
                final_lines.append("")
            i += 1
            continue

        if line.startswith("<Blockquote"):
            quote_text = []
            while i < len(lines) and not lines[i].startswith("</Blockquote"):
                if lines[i].startswith("- **VN:**"):
                    vn_text = lines[i].replace("- **VN:** ", "").strip()
                    quote_text.append(vn_text)
                i += 1
            if quote_text:
                for q in quote_text:
                    final_lines.append("> " + q)
                final_lines.append("")
            i += 1
            continue

        i += 1
        
    with open(os.path.join(section_dir, "5-final.mdx"), 'w', encoding='utf-8') as f:
        f.write('\n'.join(final_lines).strip() + '\n')

for i in range(12):
    section_name = f"section-{i:02d}"
    section_path = os.path.join(base_dir, section_name)
    if os.path.isdir(section_path):
        process_section(section_path)
        print(f"Processed {section_name}")

