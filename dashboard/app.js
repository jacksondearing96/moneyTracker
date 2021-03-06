var express = require('express');
var path = require('path');

var indexRouter = require('./routes/index');
var app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use('/', indexRouter);

app.listen(8088);

module.exports = app;
