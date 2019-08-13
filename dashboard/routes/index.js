var express   = require('express');
var router = express.Router();
var mysql = require('mysql');

router.get('/', function(req, res, next) 
{
  res.render('index', { title: 'Money Tracker' });
});

class Transaction 
{
  constructor()
  {
    this.id = "";
    this.date = "";
    this.info = "";
    this.description = "";
    this.statement = "";
    this.who = "";
    this.type = "";
    this.amount = "";
    this.category = "";
    this.tag1 = "";
    this.tag2 = "";
  }

}

function GenerateTransactioRowHTML(transaction)
{
  var transaction_row = 
  '<tr> \
      <td>' + transaction.id + '</td>\
      <td>' + transaction.date + '</td>\
      <td>' + transaction.info + '</td>\
      <td>' + transaction.description + '</td>\
      <td>' + transaction.statement + '</td>\
      <td>' + transaction.who + '</td>\
      <td>' + transaction.type + '</td>\
      <td>' + transaction.amount + '</td>\
      <td>' + transaction.category + '</td>\
      <td>' + transaction.tag1 + '</td>\
      <td>' + transaction.tag2 + '</td>\
  </tr>';
  return transaction_row;
}

router.post('/GetTransactions', function(req,res) 
{
  var databaseQuery = req.body["query"];
  console.log("QUERY>> ", databaseQuery);

  console.log("Attempting to connect to database");

  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Albymysql1",
    database: "moneyTracker"
  });

  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");

    con.query(databaseQuery, function (err, transactions, fields) {
      if (err) throw err;
      
      transactionRowsHTML = "";
      for (var i = 0; i < transactions.length; i++)
      {
        var transaction = new Transaction;
        transaction.id = transactions[i].id;
        transaction.date = transactions[i].day + "/" + transactions[i].month + "/" + transactions[i].year;
        transaction.info = transactions[i].info;
        transaction.description = transactions[i].transactor;
        transaction.statement = transactions[i].statement;
        transaction.type = transactions[i].type;
        transaction.amount = transactions[i].amount;
        transactionRowsHTML += GenerateTransactioRowHTML(transaction);
      }
      
      res.send(transactionRowsHTML);
    });
  });
});

module.exports = router;