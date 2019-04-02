const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let formatTime = require('../util/time');
let userSchema = new Schema({
    // _id: Number,
    name: {type: String},
    age: {type: Number},
    phone: {type: String},
    password: {
        type: String
    },
    create_date: {
        type: Date,
        default: Date.now()
    }
}, {
    versionKey: false
})
let User = mongoose.model('user', userSchema);
module.exports = User;