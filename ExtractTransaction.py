import mysql.connector as mysql

db = mysql.connect(
    host = "localhost",
    user = "root",
    password = "R%n*^WQLD#*g!8IPO4qsyP0tc&i1#PccEF7BHlvS",
    database = "moneyTracker"
)
moneyTracker = db.cursor()

class Date:
    def __init__(self, day, month, year):
        self.day   = day
        self.month = month
        self.year  = year

class Transaction_Type:
    DEBIT  = 1
    CREDIT = 2

class Transaction:
    date             = None
    info             = ''
    description      = ''
    transaction_type = None  
    amount           = None

def Clean_line(line):
    while True:
        quoteIndex = line.find('"')
        if quoteIndex != -1:
            line = line[:quoteIndex] + line[quoteIndex+1:]
            while True:
                if line[quoteIndex] == ',':
                    line = line[:quoteIndex] + line[quoteIndex+1:]
                if line[quoteIndex] == '"':
                    line = line[:quoteIndex] + line[quoteIndex+1:]
                    break
                quoteIndex = quoteIndex + 1
        else:
            break
    
    if line.find('"",') == 0:
        line = line[3:]

    if line[6] == ",":
        first_instance = 1
        line.replace(",", " ", first_instance)

    return line

def Month_string_to_num(month_string):
    months = {
        "JAN" : 1,
        "FEB" : 2,
        "MAR" : 3,
        "APR" : 4,
        "MAY" : 5,
        "JUN" : 6,
        "JUL" : 7,
        "AUG" : 8,
        "SEP" : 9,
        "OCT" : 10,
        "NOV" : 11,
        "DEC" : 12
    }
    return months[month_string]

def Extract_date(description):
    header_parts = description.split()

    day   = int(header_parts[0])
    month = Month_string_to_num(header_parts[1])
    year = 18

    return Date(day, month, year)

def Line_is_header(parts):
    if len(parts[3]) > 0 and parts[3] != '\n' and parts[0][0].isdigit() and parts[0][1].isdigit() and parts[0][2] == ' ':
        return True
    else:
        return False

def Determine_transaction_type(debit_amount, credit_amount):
    if debit_amount:
        return "DEBIT"
    if credit_amount: 
        return "CREDIT"

def Extract_amount(parts, transaction_type):
    if transaction_type == "DEBIT":
        return float(parts[1])
    if transaction_type == "CREDIT":
        return float(parts[2])
    print("ERROR (!) Trying to determine amount for transaction with no type")

def Print_transaction(transaction):
    print("\n$$$ Transaction $$$")
    print("\tDate:        " + str(transaction.date.day) + "/" +
                            str(transaction.date.month) + "/" +
                            str(transaction.date.year))
    print("\tType:        " + transaction.transaction_type)
    print("\tAmount:      $" + str(transaction.amount))
    print("\tInfo:        " + str(transaction.info))
    print("\tDescription: " + transaction.description)
    print("\n")  

def Print_transactions(transactions):
    for transaction in transactions:
        Print_transaction(transaction)  

def InsertTransactionIntoDatabase(transaction):
    sql = "INSERT INTO transactions (day, month, year, info, transactor, type, amount) VALUES (%s, %s, %s, %s, %s, %s, %s)"
    val = (transaction.date.day, transaction.date.month, transaction.date.year, transaction.info, transaction.description, transaction.transaction_type, transaction.amount)
    moneyTracker.execute(sql, val)
    db.commit()

converted_csv = open("13Mar2015.csv", "r")
statement_csv = open("temp.csv", "w+")
statement_csv.write(converted_csv.read())
statement_csv.close()
statement_csv = open("temp.csv", "r")

transaction = None
transactions = []

while True:
    line = statement_csv.readline()
    if line.find("OPENING BALANCE") != -1:
        break

while True:
    line = statement_csv.readline()

    if line.find("Transaction Details continued") != -1:
        while True:
            line = statement_csv.readline()
            if line.find("SUB TOTAL CARRIED FORWARD") != -1:
                line = statement_csv.readline()
                break

    if line.find("Transaction Type") != -1:
        break

    line = Clean_line(line)
    parts = line.split(',')

    if len(parts) < 4:
        break

    description   = parts[0]
    debit_amount  = parts[1]
    credit_amount = parts[2]
    total_balance = parts[3]

    if Line_is_header(parts):
        if transaction != None:
            transactions.append(transaction)
            #InsertTransactionIntoDatabase(transaction)
        transaction = Transaction()
        transaction.info = description
        transaction.date = Extract_date(description)
        transaction.transaction_type = Determine_transaction_type(debit_amount, credit_amount)
        transaction.amount = Extract_amount(parts, transaction.transaction_type)
    else:
        if description.find("EFFECTIVE DATE") == -1:
            transaction.description += (description + " ")

transactions.append(transaction)
#InsertTransactionIntoDatabase(transaction)

Print_transactions(transactions)
#Print_transactions(transactions)

