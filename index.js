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

/*
    GET /
*/
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
        res.status(400).json({error: 'An error occured'});
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
const createExercise = require("./controllers/index.js").createExercise;
app.post("/post/users/:_id/exercises", (req, res) => {
    try {
        const _id = req.params._id;
        const { description, duration, date } = req.body;
        const re = /\d{4}-\d{2}-\d{2}/;
        if (new Date(date).toDateString() != "Invalid Date" && re.test(date) && duration != '' && !isNaN(parseInt(duration)) && description != '') {
            createExercise({description: description, duration: duration, date: date, user_id: _id}, (err, document) => {
                if (err) throw(err);
                else res.json({
                    username: document.username,
                    description: document.description,
                    duration: document.duration,
                    date: new Date(document.date).toDateString(),
                    _id: document._id
                });
            });
        }
        else {
            throw("Input Validation Error");
        }
    }
    catch (err) {
        console.log(err);
        res.status(400).json({error: 'An error occured'});
    }
});

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

const findExercisesByUserAndDate = require("./controllers/index.js").findExercisesByUserAndDate;
app.get("/api/users/:_id/logs", (req, res) => {
    console.log(req.body);
    console.log(req.query);
    const _id = req.body._id;
    const {from, to, limit } = req.query;
    
    const re = /\d{4}-\d{2}-\d{2}/;
    findExercisesByUserAndDate({user_id: _id, from_date: from, to_date: to, limit: limit}, (err, data) => {
        // todo
    });

});
