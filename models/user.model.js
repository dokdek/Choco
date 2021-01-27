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
    learning: {
        type: Array,
    },
    apprentice1: {
        type: Array,
    },
    apprentice2: {
        type: Array
    },
    apprentice3: {
        type: Array,
    },
    apprentice4: {
        type: Array,
    },
    guru1: {
        type: Array,
    },
    guru2: {
        type: Array,
    },
    master: {
        type: Array,
    },
    englightened: {
        type: Array,
    }
}, {
    timestamps: true
});


//add more later
const User = mongoose.model('User', serverSchema);

module.exports = User;