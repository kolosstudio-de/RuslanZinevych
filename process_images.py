import os
import sys
from PIL import Image

src_dir = "/Users/vasylkolos/Downloads/Ruslan Website/фото вебсайт"
dst_dir = "/Users/vasylkolos/Downloads/Ruslan Website/ruslan-zinevych-portfolio/public/gallery"

if not os.path.exists(dst_dir):
    os.makedirs(dst_dir)

valid_exts = {'.jpg', '.jpeg', '.png', '.webp', '.heic'}

files = []
for f in os.listdir(src_dir):
    if any(f.lower().endswith(ext) for ext in valid_exts):
        files.append(f)

files.sort()

gallery_data = []

count = 1
for fname in files:
    src_path = os.path.join(src_dir, fname)
    if fname.startswith("Копія") and "10624851" in fname:
        # Ignore obvious local duplicates if wanted, let's process all valid ones
        pass

    try:
        with Image.open(src_path) as img:
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Use Resampling.LANCZOS if available, else ANTIALIAS
            resample_filter = getattr(Image, 'Resampling', getattr(Image, 'ANTIALIAS', 1))
            resampl = resample_filter.LANCZOS if hasattr(resample_filter, 'LANCZOS') else getattr(Image, 'ANTIALIAS', 1)

            img.thumbnail((1600, 1600), resampl)
            
            dst_name = f"gallery-{count}.jpg"
            dst_path = os.path.join(dst_dir, dst_name)
            
            img.save(dst_path, "JPEG", quality=82, optimize=True)
            
            width, height = img.size
            gallery_data.append({
                "id": str(count),
                "src": f"gallery/{dst_name}",
                "width": width,
                "height": height,
                "alt": f"Ruslan Zinevych #{count}"
            })
            print(f"Processed {fname} -> {dst_name}")
            count += 1
    except Exception as e:
        print(f"Error processing {fname}: {e}")

import json
json_path = "/Users/vasylkolos/Downloads/Ruslan Website/ruslan-zinevych-portfolio/src/galleryData.json"
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(gallery_data, f, indent=2)

print("Done generating images and galleryData.json")
