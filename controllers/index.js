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
    date: {type: Date, required: true, default: Date.now, max: Date.now} // TODO: change to using Date object
});

const ExerciseLogSchema = new Schema({
    username: {type: String, required: true},
    count: {type: Number, required: true},
    log: [ExerciseSchema]
})

// Controllers
function createUser(name, done) {
    const User = mongoose.model('User', UserSchema);
    const newUser = new User({username: name});
    newUser.save((err, data) => {
        if (err) console.log(err);
        err ? done(err, null) : done(null, data);
    })
}

function createExercise(params, done) {
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

function findExercisesByUserAndDate(params, done) {
    let {user_id, from_date, to_date, limit} = params;

    limit = limit === undefined ? 100 : limit;
    from_date = from_date === undefined ? new Date('1900-01-01') : new Date(from_date);
    to_date = to_date === undefined ? new Date('2500-01-01') : new Date(to_date);

    findUserById(user_id, (err, user) => {
        const Exercise = mongoose.model("Exercise", ExerciseSchema);
        var query = Exercise.find({username: user.username, date: {"$gte": from_date, "$lt": to_date}}).limit(limit).select("description date duration -_id");
        query.exec((err, documents) => {
            err ? done (err, null) : done(null, documents);
        });
    });
}

exports.createUser = createUser;
exports.findUserById = findUserById;
exports.createExercise = createExercise;
exports.findExercisesByUserAndDate = findExercisesByUserAndDate;