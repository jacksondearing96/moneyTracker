var express   = require('express');
var router = express.Router();
var mysql = require('mysql');
const { exec } = require('child_process');
const fs = require('fs');

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
    this.description = "";
    this.who = "";
    this.type = "";
    this.amount = "";
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
      if (err)
      {
        console.log("ERROR in query !!!");
        res.send("ERROR");
        return;
      } 
      
      transactionRows = [];
      for (var i = 0; i < transactions.length; i++)
      {
        transactionRows[transactionRows.length] = {
          "id" : transactions[i].id,
          "day" : transactions[i].day,
          "month" : transactions[i].month,
          "year" : transactions[i].year,
          "description" : transactions[i].description,
          "who" : transactions[i].who,
          "type" : transactions[i].type,
          "amount" : transactions[i].amount,
        };
      }
      res.send(transactionRows);
    });
  });
});

router.get('/CommitDatabase', function(req, res) 
{
  var commands = ["mysqldump -p -u root moneyTracker > ../moneyTracker.sql"];
  for (let i = 0; i < commands.length; i++)
  {
    if (Execute(commands[i]) == false)
    {
      res.send("ERROR");
    }
  }
  res.send("SUCCESS");
});

function Execute(command)
{
  exec(command, (err, stdout, stderr) => {
    if (err) 
    {
      //some err occurred
      console.error(err);
      return false;
    } 
    else 
    {
      // the *entire* stdout and stderr (buffered)
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
      return true;
    }
  });
}

router.post('/LogQuery', function(req, res) 
{
  var databaseQuery = req.body['query'];
  fs.appendFile('db_changes.txt', databaseQuery, function (err) {
    if (err) res.send("ERROR");
    res.send("SUCCESS");
  });
});

router.get('/GetTotalSpending', function(req, res) 
{
  var query = "SELECT SUM(amount) FROM transactions WHERE type = 'DEBIT'";

  res.send("SUCCESS");
});

router.post('/GetValueFromDatabase', function(req,res) 
{
  var databaseQuery = req.body["query"];

  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Albymysql1",
    database: "moneyTracker"
  });

  con.connect(function(err) {
    if (err) throw err;

    con.query(databaseQuery, function (err, value) {
      if (err)
      {
        console.log("ERROR in query !!!");
        res.send("ERROR");
        return;
      } 
      if (value.length != 0) {
        res.send(Object.values(value[0])[0].toFixed(2));
      }
    });
  });
});

module.exports = router;