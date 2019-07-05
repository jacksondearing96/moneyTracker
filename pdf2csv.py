import tabula
import os

for root, dirs, files in os.walk("statements/"):  
    for filename in files:
        if filename.find('.pdf') != -1:
            outputName = "statements/csvs/" + filename.replace('.pdf', '.csv')
            filename = "statements/" + filename
            tabula.convert_into(filename, outputName, output_format="csv", pages="all")
            print(outputName)