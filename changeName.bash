#!/bin/bash

for filename in *.pdf
do 
    mv "$filename" "${filename//CompleteFreedomStudent-1090018170140-/}"
done