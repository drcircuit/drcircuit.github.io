find images -type f -name "*.png" -size +512k -print0 |
while IFS= read -r -d '' img; do
  echo "Optimizing $img"
  magick "$img" \
    -strip \
    -resize 512x512\> \
    -define png:compression-level=7 \
    "$img"
done
