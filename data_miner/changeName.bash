#!/bin/bash

# for filename in *.pdf
# do 
#     mv "$filename" "${filename//IncentiveSaver-0090113926140-/}"
# done

for filename in *.pdf
do 
    mv "$filename" "${filename//.pdf/}"
done

for filename in *
do 
    mv "$filename" "${filename}_bankSA_IS.pdf"
done