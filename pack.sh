#!/bin/bash
rm -r ./static 2> /dev/null
mkdir ./static 2> /dev/null
ls .
cp -r images ./static/
cp -r js ./static/
cp -r pages ./static/
cp -r posts ./static/
cp -r styles ./static/
cp index.html ./static/
cd ./static/posts
./build.sh
cat ./posts.json
rm ./build.sh
cd ../pages
./build.sh
cat ./pages.json
rm./build.sh
cd ..
cd ..
ls ./static

