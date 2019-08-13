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
    this.day = "";
    this.month = "";
    this.year = "";
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
      
      transactionRows = [];
      for (var i = 0; i < transactions.length; i++)
      {
        transactionRows[transactionRows.length] = {
          "id" : transactions[i].id,
          "day" : transactions[i].day,
          "month" : transactions[i].month,
          "year" : transactions[i].year,
          "info" : transactions[i].info,
          "description" : transactions[i].transactor,
          "statement" : transactions[i].statement,
          "who" : transactions[i].who,
          "type" : transactions[i].type,
          "amount" : transactions[i].amount,
          "category" : transactions[i].category,
          "tag1" : transactions[i].tag1,
          "tag2" : transactions[i].tag2
        };
      }
      res.send(transactionRows);
    });
  });
});

module.exports = router;