require('dotenv').config();
const mongoose = require("mongoose");
const { Schema } = mongoose;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.on('error', err => {
    console.log(err);
});
mongoose.connection.on('disconnected', () => console.log("Disconnected from MongoDB"));

// Schemas
const UserSchema = new Schema({
    username: {type: String, required: true}
});

const ExerciseSchema = new Schema({
    username: {type: String, required: false},
    description: {type: String, required: true},
    duration: {type: Number, required: true},
    date: {type: String, required: true, default: Date.toDateString}
});

const ExerciseLogSchema = new Schema({
    username: {type: String, required: true},
    count: {type: Number, required: true},
    log: [ExerciseSchema]
})

// Controllers
function createUser(name, done) {
    console.log("Creating user...");
    const User = mongoose.model('User', UserSchema);
    const newUser = new User({username: name});
    newUser.save((err, data) => {
        if (err) console.log(err);
        err ? done(err, null) : done(null, data);
    })
}

function createExercise(params, done) {
    console.log("Creating user exercise...");
    const {user_id, description, duration, date} = params;
    const Exercise = mongoose.model("Exercise", ExerciseSchema);
    // check if the user exists
    findUserById(user_id, (err, user) => {
        if (err) {
            done(err, null);
        }
        else {
            // if so...create and save a new exercise
            const newExercise = new Exercise({
                username: user.username,
                description: description,
                duration: parseInt(duration),
                date: date
            });
            newExercise.save((err, data) => {
                if (err) {
                    done(err, null)
                }
                else {
                    done(null, data);
                }
            })
        }
    });
}

function findUserById(_id, done) {
    const User = mongoose.model('User', UserSchema);
    User.findById(_id, (err, document) => {
        err ? done(err, null) : done(null, document);
      });
}

exports.createUser = createUser;
exports.findUserById = findUserById;
exports.createExercise = createExercise;