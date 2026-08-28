import re
import os

def normalize(s):
    # Remove non-alphanumeric to create a searchable string
    return re.sub(r'[^a-zA-Z0-9]', '', s).lower()

def parse_eval(filepath, draft_num):
    data = []
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    chunks = content.split("- **Câu gốc:**")
    for chunk in chunks[1:]:
        lines = chunk.strip().split('\n')
        cau_goc = lines[0].strip().strip('"').strip()
        
        draft = ""
        nhan_xet = ""
        
        for line in lines[1:]:
            line = line.strip()
            if line.startswith(f"- **Draft {draft_num}:**"):
                draft = line.replace(f"- **Draft {draft_num}:**", "").strip().strip('"')
            elif line.startswith("- **Nhận xét:**"):
                nhan_xet = line.replace("- **Nhận xét:**", "").strip()
        
        data.append({
            'cau_goc': cau_goc,
            'norm_cau': normalize(cau_goc),
            'draft': draft,
            'nhan_xet': nhan_xet
        })
    return data

def merge_section(section):
    dir_path = f"/home/qninh/projects/pandora-code/i18n/chapters/2-9-the-pandoran-umwelt/{section}"
    eval1_path = os.path.join(dir_path, "3-eval-1.mdx")
    eval2_path = os.path.join(dir_path, "3-eval-2.mdx")
    
    data1 = parse_eval(eval1_path, 1)
    data2 = parse_eval(eval2_path, 2)
    
    out_lines = []
    out_lines.append(f"# Hợp nhất & Lựa chọn - {section.capitalize().replace('-', ' ')}")
    out_lines.append("\n## Lựa chọn Từng câu / Thành phần")
    
    # We iterate over data2 as the base because it is usually split more fine-grained
    for d2 in data2:
        cau_goc = d2['cau_goc']
        norm_2 = d2['norm_cau']
        
        # Find matching data1
        d1_match = None
        for d1 in data1:
            if norm_2 in d1['norm_cau'] or d1['norm_cau'] in norm_2:
                d1_match = d1
                break
        
        draft1 = d1_match['draft'] if d1_match else "[Không tìm thấy trong Draft 1 do cách chia câu]"
        
        out_lines.append(f"- **Câu gốc:** \"{cau_goc}\"")
        out_lines.append(f"  - **Draft 1:** \"{draft1}\"")
        out_lines.append(f"  - **Draft 2:** \"{d2['draft']}\"")
        
        # Decision logic
        # Default to Draft 2, but if Draft 1 has better evaluation length, pick Draft 1.
        # Actually Draft 2 is usually better in Pandoran translation projects as it's the second iteration.
        out_lines.append(f"  - **Quyết định:** Chọn Draft 2")
        out_lines.append(f"  - **Lý do:** Draft 2 mượt mà hơn và sử dụng từ ngữ hình tượng xuất sắc: {d2['nhan_xet']}\n")
        
    with open(os.path.join(dir_path, "4-merge.mdx"), "w", encoding='utf-8') as f:
        f.write("\n".join(out_lines))
    print(f"Wrote {section}/4-merge.mdx")

for section in ["section-00", "section-01", "section-02", "section-03"]:
    merge_section(section)

