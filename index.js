const express = require("express");
const app = express();
const cors = require('cors');
const bodyParser = require("body-parser");

require('dotenv').config()

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/public', express.static(__dirname + '/public'));

const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('Your app is listening on port ' + listener.address().port);
  })

// API Routes

/*
    GET /
*/
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
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
        res.status(400).end();
    }
});

const getAllUsers = require("./controllers/index.js").getAllUsers;
app.get('/api/users', (req, res) => {
    try{
        getAllUsers((err, array)=>{
            if (err) throw(err);
            else res.json(array);
        })
    }
    catch (err) {
        console.log(err);
        res.status(400).end();
    }
})

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
app.post("/api/users/:_id/exercises", (req, res) => {
    try {
        const _id = req.params._id;
        let { description, duration, date } = req.body;

        if (date === undefined) {
            date = new Date().toISOString().slice(0, 10); // get current date as YYYY-MM-DD
        }

        const re = /\d{4}-\d{2}-\d{2}/;
        if (new Date(date).toDateString() != "Invalid Date" && re.test(date) && duration != '' && !isNaN(parseInt(duration)) && description != '') {
            createExercise({description: description, duration: duration, date: date, user_id: _id}, (err, document) => {
                if (err) throw(err);
                else res.json({
                    username: document.username,
                    description: document.description,
                    duration: document.duration,
                    date: new Date(document.date).toDateString(),
                    _id: _id
                });
            });
        }
        else {
            throw("Input Validation Error");
        }
    }
    catch (err) {
        console.log(err);
        res.status(400).end();
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
const { findUserById } = require("./controllers/index.js");

const findExercisesByUserAndDate = require("./controllers/index.js").findExercisesByUserAndDate;
app.get("/api/users/:_id/logs", (req, res) => {
    const _id = req.params._id;
    const {from, to, limit } = req.query;

    findUserById(_id, (err, user) => {
        if (err) {
            return console.log(err);
        }
        else {
            findExercisesByUserAndDate({user_id: user._id, from_date: from, to_date: to, limit: limit}, (err, exercises) => {
                let log = exercises.map((exercise) => ({
                    description: exercise.description,
                    duration: exercise.duration,
                    date: exercise.date.toDateString(),
                    }));
                res.json({
                    username: user.username,
                    _id: user._id,
                    count: exercises.length,
                    log: log
                }); 
            });
        }
    });
});