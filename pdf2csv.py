import tabula
import os

# for root, dirs, files in os.walk("statements/"):  
#     for filename in files:
#        if filename.find('.pdf') != -1:

            #outputName = "statements/csvs/" + filename.replace('.pdf', '.csv')
outputName = "12Sep2016_missed.csv"
filename = "12Sep2016-pages-5.pdf"
tabula.convert_into(filename, outputName, output_format="csv", pages="all", guess=True)
print(outputName)