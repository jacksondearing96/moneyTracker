var express   = require('express');
var router = express.Router();
var mysql = require('mysql');
const { exec } = require('child_process');

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

module.exports = router;