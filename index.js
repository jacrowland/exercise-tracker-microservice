const express = require("express");
const app = express()
const cors = require('cors')
const bodyParser = require("body-parser");
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));



const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('Your app is listening on port ' + listener.address().port)
  })


// API Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
  });
/*
    POST /api/users
    {
    username: "test",
    _id: "5fb5853f734231456ccb3b05"
    }
*/
const createUser = require("./controllers/index.js").createUser;
app.post('/api/users', (req, res) => {
    try {
        const username = req.body.username;
        if (username == '' || username == null) {throw('username cannot be empty');}
        createUser(username, (err, document) => {
            if (err) throw(err);
            else res.json({username: document.username, _id: document._id});
        });
    }
    catch (err) {
        console.log(err);
        res.status(400).json({error: 'An error occured'})
    }
});

// POST /api/users/:_id/exercises
/*
    {
    username: "fcc_test",
    description: "test",
    duration: 60,
    date: "Mon Jan 01 1990",
    _id: "5fb5853f734231456ccb3b05"
    }
*/
// GET /api/users/:_id/logs?[from][&to][&limit] ([] = optional; from, to = dates (yyyy-mm-dd); limit = number)
/*
    {
    username: "fcc_test",
    count: 1,
    _id: "5fb5853f734231456ccb3b05",
    log: [{
        description: "test",
        duration: 60,
        date: "Mon Jan 01 1990",
    }]
    }
*/