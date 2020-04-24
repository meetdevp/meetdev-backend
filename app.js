const mongoose=require('mongoose');
const bodyParser = require('body-parser');

var express = require('express');
var routs=require('./routes/index');

const morgan=require('morgan');

var app = express();
app.use(bodyParser.json());
const db = mongoose.connect("mongodb+srv://mukulmalviya:mukul123@cluster0-biwhb.mongodb.net/MinorProject")
.then(() => {
  console.log("Connection to MongoDB is Successfull !");
})
.catch(() =>
 {
  console.log("Connection to Database Failed !");
});
app.use(morgan('dev'))
app.use('/upload',express.static('upload'))


app.use('/', routs);
module.exports = app;