const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Account = new Schema({
    role: { type: Number, default: 1},
    accountType: { type: String, default: 'local'},
    username: { type: String },
    password: { type: String },
    firstName: { type: String, required: true},
    lastName: { type: String, required: true },
    avatar: { type: String, default: null },
    createdAt: { type: Date, default: Date.now}
}, {
    versionKey: false
})

module.exports = mongoose.model('Account', Account, 'Account')