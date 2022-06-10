const express = require("express");
const router = express.Router();

const createUser = require("../controllers/index.js").createUser;
const getAllUsers = require("../controllers/index.js").getAllUsers;
const createExercise = require("../controllers/index.js").createExercise;
const findUserById = require("../controllers/index.js").findUserById;
const findExercisesByUserAndDate = require("../controllers/index.js").findExercisesByUserAndDate;

router.get('/', (req, res) => {
    res.sendFile(__dirname + '../views/index.html');
  });

/*
    POST /api/users
    {
    username: "test",
    _id: "5fb5853f734231456ccb3b05"
    }
*/

router.post('/api/users', (req, res) => {
    try {
        const username = req.body.username;
        if (username == '' || username == null) {
            throw('username cannot be empty');
        }
        createUser(username, (err, document) => {
            if (err) throw(err);
            else res.json({username: document.username, _id: document._id});
        });
    }
    catch (err) {
        console.log(err);
        res.status(400).json({error: "username cannot be empty"});
    }
});


router.get('/api/users', (req, res) => {
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


router.post("/api/users/:_id/exercises", (req, res) => {
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

router.get("/api/users/:_id/logs", (req, res) => {
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

module.exports = router;