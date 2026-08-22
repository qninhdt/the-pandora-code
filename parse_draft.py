import os
import re

base_dir = "/home/qninh/projects/pandora-code/i18n/chapters/3-5-a-real-living-planet"

def process_section(section_dir):
    draft1_path = os.path.join(section_dir, "2-draft-1.mdx")
    if not os.path.exists(draft1_path):
        return
        
    with open(draft1_path, 'r', encoding='utf-8') as f:
        lines = [line.rstrip('\n') for line in f.readlines()]
        
    final_lines = []
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        if line.startswith("<Draft") or line.startswith("</Draft"):
            i += 1
            continue
            
        if line.startswith("<Paragraph") or line.startswith("<Heading"):
            texts = []
            i += 1
            while i < len(lines) and not (lines[i].startswith("</Paragraph") or lines[i].startswith("</Heading")):
                if lines[i].startswith("- **VN:**"):
                    vn_text = lines[i].replace("- **VN:**", "").strip()
                    if vn_text:
                        texts.append(vn_text)
                i += 1
            if texts:
                final_lines.append(" ".join(texts))
                final_lines.append("")
            i += 1
            continue
            
        if line.startswith("<") and not line.startswith("</") and line.endswith("/>"):
            final_lines.append(line)
            final_lines.append("")
            i += 1
            continue
            
        if line.startswith("<") and not line.startswith("</"):
            # It's a complex component
            tag_match = re.match(r'<([A-Za-z0-9]+)>', line)
            if tag_match:
                tag = tag_match.group(1)
                
                # find - **VN:**
                while i < len(lines) and lines[i] != "- **VN:**":
                    i += 1
                
                i += 1
                if i < len(lines) and lines[i].startswith("```"):
                    i += 1 # skip ```tsx
                    while i < len(lines) and not lines[i].startswith("```"):
                        final_lines.append(lines[i])
                        i += 1
                    i += 1 # skip ```
                    
                # advance to closing tag
                while i < len(lines) and not lines[i].startswith(f"</{tag}>"):
                    i += 1
                final_lines.append("")
                i += 1
                continue
                
        # any other line just add if not empty
        if line.strip():
            final_lines.append(line)
        i += 1
        
    with open(os.path.join(section_dir, "5-final.mdx"), 'w', encoding='utf-8') as f:
        f.write('\n'.join(final_lines).strip() + '\n')

for i in range(12):
    section_name = f"section-{i:02d}"
    section_path = os.path.join(base_dir, section_name)
    if os.path.isdir(section_path):
        process_section(section_path)
        print(f"Processed {section_name}")

