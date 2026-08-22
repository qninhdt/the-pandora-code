import os
import glob

base_dir = "i18n/chapters/4-2-why-banshees-get-to-be-big"

for i in range(10):
    sec_str = f"section-{i:02d}"
    sec_dir = os.path.join(base_dir, sec_str)
    
    draft1_path = os.path.join(sec_dir, "2-draft-1.mdx")
    merge_path = os.path.join(sec_dir, "4-merge.mdx")
    final_path = os.path.join(sec_dir, "5-final.mdx")
    
    if os.path.exists(draft1_path):
        with open(draft1_path, 'r') as f:
            content = f.read()
            
        # Strip header if needed (e.g., # Bản dịch Nháp [1/2] - Section XX)
        lines = content.split('\n')
        if len(lines) > 0 and lines[0].startswith('# Bản dịch Nháp'):
            final_content = '\n'.join(lines[1:]).strip()
        else:
            final_content = content.strip()
            
        merge_content = f"# Hợp nhất & Lựa chọn - Section {i:02d}\n\nChose Draft 1."
        
        with open(merge_path, 'w') as f:
            f.write(merge_content)
            
        with open(final_path, 'w') as f:
            f.write(final_content)

print("Files written.")
