import tabula
import os

for root, dirs, files in os.walk("statements/"):  
    for filename in files:
        if filename.find('.pdf') != -1:
            outputName = "statements/csvs/" + filename.replace('.pdf', '.csv')
            tabula.convert_into("statements/" + filename, outputName, output_format="csv", pages="all", guess=False)
            print(outputName)
    break