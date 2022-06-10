const express = require("express");
const app = express();
const cors = require('cors');
const bodyParser = require("body-parser");
const router = require("./routes/index.js");
require('dotenv').config()

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/public', express.static(__dirname + '/public'));

const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('Your app is listening on port ' + listener.address().port);
  })

app.use('/', router);