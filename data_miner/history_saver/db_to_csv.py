import mysql.connector as mysql
import os

db = mysql.connect(
    host = "localhost",
    user = "root",
    password = "Albymysql1",
    database = "moneyTracker"
)
moneyTracker = db.cursor()

def ascii_string(string):
    string = string.encode('ascii', 'ignore')
    string = string.replace('\t', ' ')
    string = string.replace('  ', ' ')
    string = string.replace(' ,', ',')
    return string.replace('\n', '')

file = open('pre_2017_transactions.csv', 'w')
query = 'SELECT * FROM transactions WHERE year < 2017;'
moneyTracker.execute(query)
transactions = moneyTracker.fetchall()
moneyTracker.nextset()
print(len(transactions))
for transaction in transactions:
    row = str(transaction[1]) + '/' + str(transaction[2]) + '/' + str(transaction[3])
    row += ',' + ascii_string(transaction[4] + ' ' + transaction[5])
    if transaction[8] == 'CREDIT':
        row += ',,' + str(transaction[9])
    else:
        row += ',' + str(transaction[9]) + ','
    row += ','
    file.write(row + '\n')