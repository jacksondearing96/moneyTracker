#!/bin/bash

for filename in *.csv
do 
    mv "$filename" "${filename//str_to_remove/}"
done

