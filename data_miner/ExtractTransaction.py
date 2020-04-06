import mysql.connector as mysql
import os

db = mysql.connect(
    host = "localhost",
    user = "root",
    password = "Albymysql1",
    database = "moneyTracker"
)
moneyTracker = db.cursor()

def CreateTableWithNameQuery(table_name):
    create_table_query = """
    USE moneyTracker;
    CREATE TABLE IF NOT EXISTS """ + table_name + """
    ( 
        id INT AUTO_INCREMENT,
        day TINYINT NOT NULL CHECK (day > 0 AND day < 32),
        month TINYINT NOT NULL CHECK (month > 0 AND month < 13),
        year YEAR(4) NOT NULL,
        description VARCHAR(100),
        who VARCHAR(50),
        type ENUM ('DEBIT','CREDIT') NOT NULL,
        amount FLOAT NOT NULL CHECK (amount > 0),
        PRIMARY KEY (id) 
    );

    CREATE TABLE IF NOT EXISTS tags
    (
        id INT,
        tag VARCHAR(50),
        PRIMARY (id, tag)
    );
    """
    return create_table_query

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
    description      = ''
    transaction_type = None  
    amount           = None

def Clean_line(line):
    line = line.replace('\t', ' ')
    line = line.replace(' ,', ',')
    return line.replace('  ', ' ')

def Extract_date(date_str):
    date_parts = date_str.split('/')
    day   = int(date_parts[0])
    month = int(date_parts[1])
    year = int(date_parts[2])
    return Date(day, month, year)

def Extract_date_american(date_str):
    date_parts = date_str.split('/')
    day   = int(date_parts[1])
    month = int(date_parts[0])
    year = int(date_parts[2])
    return Date(day, month, year)

def Determine_transaction_type(debit_amount, credit_amount):
    if debit_amount == 0:
        return "CREDIT"
    else: 
        return "DEBIT"

def Print_transaction(transaction):
    print("\n$$$ Transaction $$$")
    print("\tDate:        " + str(transaction.date.day) + "/" +
                            str(transaction.date.month) + "/" +
                            str(transaction.date.year))
    print("\tType:        " + transaction.transaction_type)
    print("\tAmount:      $" + str(transaction.amount))
    print("\tDescription: " + transaction.description)
    print("\n")  

def Print_transactions(transactions):
    for transaction in transactions:
        Print_transaction(transaction)  

def InsertTransactionIntoDatabase(transaction, table_name):
    sql = "INSERT INTO " + table_name + " (day, month, year, description, type, amount) VALUES (%s, %s, %s, %s, %s, %s);"
    val = (transaction.date.day, transaction.date.month, transaction.date.year, transaction.description, transaction.transaction_type, transaction.amount)
    moneyTracker.execute(sql, val)
    db.commit()

def GetTransactionPeoplesChoice(parts):
    amount = parts[3]
    if amount >= 0:
        credit_amount = amount
        debit_amount = 0
    else:
        credit_amount = 0
        debit_amount = abs(float(amount))

    transaction = Transaction()
    transaction.description = parts[2]
    transaction.date = Extract_date(parts[1])
    transaction.transaction_type = Determine_transaction_type(debit_amount, credit_amount)
    transaction.amount = abs(float(amount))
    transaction.who = '_PC'
    return transaction

def GetTransactionChase(parts):
    amount = parts[3]
    if amount >= 0:
        credit_amount = amount
        debit_amount = 0
    else:
        credit_amount = 0
        debit_amount = abs(float(amount))

    transaction = Transaction()
    transaction.description = parts[2]
    transaction.date = Extract_date_american(parts[1])
    transaction.transaction_type = Determine_transaction_type(debit_amount, credit_amount)
    transaction.amount = abs(float(amount))
    transaction.who = '_Chase'
    return transaction

def GetTransactionDefault(parts):
    debit_amount = parts[2]
    credit_amount = parts[3]
    if debit_amount == '':
        debit_amount = 0
    if credit_amount == '':
        credit_amount = 0
    transaction = Transaction()
    transaction.description = parts[1]
    transaction.date = Extract_date(parts[0])
    transaction.transaction_type = Determine_transaction_type(debit_amount, credit_amount)
    transaction.amount = float(credit_amount) + float(debit_amount) # add these because one will always be zero
    transaction.who = '_default'
    return transaction

def ExtractTransactionsFromFile(filename, table_name):
    transactions_list = open(filename, "r")
    transactions_list.readline() # ignore headers
    line = transactions_list.readline()
    transaction_read_count = 0
    while line:
        transaction_read_count = transaction_read_count + 1
        line = Clean_line(line)
        parts = line.split(',')

        if filename.find('peoplesChoice') != -1:
            transaction = GetTransactionPeoplesChoice(parts)
        elif filename.find('chase') != -1:
            transaction = GetTransactionChase(parts)
        else:
            transaction = GetTransactionDefault(parts)
        InsertTransactionIntoDatabase(transaction, table_name)
        line = transactions_list.readline()
    return transaction_read_count

def PrintExtractionSummary(transactions_read_count, table_name):
    print('')
    print('Read ' + str(transactions_read_count) + ' transactions')
    query = 'SELECT * FROM ' + table_name + ';'
    moneyTracker.execute(query)
    print('Database contains ' + str(len(moneyTracker.fetchall())) + ' ' + table_name)
    
def ExtractTransactionsFromAllFiles(directory_name, table_name, logResults):
    transactions_read_count = 0
    for root, dirs, files in os.walk(directory_name):
        for filename in files:
            if filename.find('.csv') == -1:
                continue
            transactions_read_count += ExtractTransactionsFromFile(directory_name + '/' + filename, table_name)
            if logResults:
                print(filename)
    if logResults:
        PrintExtractionSummary(transactions_read_count, table_name)

def CheckExists(query):
    moneyTracker.execute(query)
    result = moneyTracker.fetchall()
    if len(result) == 0:
        print('FAIL, ', query)
        return False
    return True


def test():
    test_table = 'test_table'
    moneyTracker.execute('TRUNCATE TABLE test_table;')
    dontLogResults = False
    ExtractTransactionsFromAllFiles('test_data', test_table, dontLogResults)
    moneyTracker.execute('SELECT * FROM test_table')
    result = moneyTracker.fetchall()
    if len(result) != 9:
        print('FAIL, ', query)
        return False
    queries = ("SELECT * FROM test_table;", "SELECT * FROM test_table WHERE description LIKE '%JETBLUE%' AND amount LIKE 235.2;","SELECT * FROM test_table WHERE day = 27;", "SELECT * FROM test_table WHERE amount LIKE 433.09;")
    for query in queries:
        if not CheckExists(query):
            return False
    return True

if test():
    moneyTracker.execute('TRUNCATE TABLE transactions;')
    logResults = True
    ExtractTransactionsFromAllFiles('transaction_history', 'transactions', logResults)

