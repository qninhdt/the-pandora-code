import os
import re

for i in range(9):
    idx_str = f"{i:02d}"
    merge_file = f"i18n/chapters/4-1-the-forest-as-a-cathedral/section-{idx_str}/4-merge.mdx"
    final_file = f"i18n/chapters/4-1-the-forest-as-a-cathedral/section-{idx_str}/5-final.mdx"
    
    if not os.path.exists(merge_file):
        print(f"Missing {merge_file}")
        continue
        
    with open(merge_file, "r", encoding="utf-8") as f:
        content = f.read()
        
    match = re.search(r'## Kết quả Hợp nhất\s*(.*)', content, re.DOTALL)
    if match:
        final_text = match.group(1).strip() + "\n"
        with open(final_file, "w", encoding="utf-8") as f:
            f.write(final_text)
        print(f"Wrote {final_file}")
    else:
        print(f"Could not find 'Kết quả Hợp nhất' in {merge_file}")
