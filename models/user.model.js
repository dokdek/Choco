const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const serverSchema = new Schema ({
    userId: {
        type: String,
    },
    level: {
        type: Number,
    },
    reviews:{
        type: Array,
    },
    reviewed: {
        type: Array,
    },
    learning: {
        type: Array,
    },
    toLearn: {
        type: Array,
    },
    learnt: {
        type: Array,
    },
    reminded: {
        type: Number,
    },
}, {
    timestamps: true
});


//add more later
const User = mongoose.model('User', serverSchema);

module.exports = User;