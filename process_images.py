import os
import json
from PIL import Image, ImageOps

src_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "фото вебсайт"))
dst_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "public", "gallery"))
json_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "src", "galleryData.json"))

if not os.path.exists(dst_dir):
    os.makedirs(dst_dir)

valid_exts = {'.jpg', '.jpeg', '.png', '.webp', '.heic'}

# Files that must not appear in the gallery (used elsewhere on the site)
EXCLUDE = {
    "фото на главную страницу.jpg",  # hero image on the home page
    "DSC00657.jpg",  # near-duplicate of DSC00636.jpg (same pose, different expression)
}

# Source EXIF orientation is wrong for these — use the raw pixels as-is
# instead of applying exif_transpose.
IGNORE_EXIF_ORIENTATION = {
    "image0.jpeg",
}

# Curated order: strongest stage/concert shots lead the gallery.
# Anything not listed keeps alphabetical order after the featured block.
FEATURED = [
    "Копия Mozart2.jpg",
    "10624851_10203875587822481_5541303316917862207_n.jpg",
    "IMG_0514.JPG",
    "DSC_4607.jpg",
    "DSC06279.JPG",
    "P1080742.JPG",
    "12314142_919219784822800_3481495633748902373_n (1).jpg",
    "IMG_0553.JPG",
    "_k8w3493.jpg",
    "DSC01577.jpg",
    "12360126_919220154822763_4054891076061656416_n.jpg",
    "с паваротти cut.jpg",
    "s garanchej1.jpg",
    "IMG_5089_1.jpg",
    "11062816_821018104645792_3387156166098048727_o.jpg",
]

files = []
for f in os.listdir(src_dir):
    if f.startswith("._") or f in EXCLUDE:
        continue
    if any(f.lower().endswith(ext) for ext in valid_exts):
        files.append(f)

files.sort()
ordered = [f for f in FEATURED if f in files] + [f for f in files if f not in FEATURED]

gallery_data = []

count = 1
for fname in ordered:
    src_path = os.path.join(src_dir, fname)
    try:
        with Image.open(src_path) as img:
            # Respect EXIF orientation (phone photos are otherwise rotated),
            # except for known-bad tags that rotate the image the wrong way.
            if fname not in IGNORE_EXIF_ORIENTATION:
                img = ImageOps.exif_transpose(img)
            if img.mode != 'RGB':
                img = img.convert('RGB')

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

with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(gallery_data, f, indent=2, ensure_ascii=False)

print("Done generating images and galleryData.json")
