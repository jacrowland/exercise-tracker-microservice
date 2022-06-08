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
    duration: {type: String, required: true},
    date: {type: Date, required: true, default: Date.now}
});

const ExerciseLogSchema = new Schema({
    username: {type: String, required: true},
    count: {type: Number, required: true},
    log: [ExerciseSchema]
})

// Controllers
function createUser(name, done) {
    console.log("Creating user...")
    const User = mongoose.model('User', UserSchema);
    const newUser = new User({username: name});
    newUser.save((err, data) => {
        if (err) console.log(err);
        err ? done(err, null) : done(null, data);
    })
}

function createExercise(params, date) {
    const {userId, description, duration} = params;
    return;
}

exports.createUser = createUser;