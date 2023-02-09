#!/bin/bash
rm posts.json 2> /dev/null
echo "[" > posts.json
for file in $(ls *.md); do 
    name="  \"/posts/${file}\",";
    echo $name >> posts.json
done
infile="posts.json"
outfile="posts2.json"
bs=$((`cat $infile | wc -c` - 2))
dd if=$infile of=$outfile bs=$bs count=1
echo "" >> posts2.json
echo "]" >> posts2.json
rm posts.json
mv posts2.json posts.json