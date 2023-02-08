#!/bin/bash
rm pages.json 2> /dev/null
echo "[" > pages.json
for file in $(ls -R ./**/*.md); do 
    name="  \"/pages/${file}\",";
    echo $name
    echo $name >> pages.json
done
infile="pages.json"
outfile="pages2.json"
bs=$((`cat $infile | wc -c` - 2))
dd if=$infile of=$outfile bs=$bs count=1
echo "" >> pages2.json
echo "]" >> pages2.json
rm pages.json
mv pages2.json pages.json
sed -i 's/\/.\//\//g' pages.json
