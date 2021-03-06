const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Account = new Schema({
    role: { type: Number, default: 1},
    accountType: { type: String, default: 'local'},
    email: { type: String, unique: true },
    password: { type: String },
    firstName: { type: String, required: true},
    lastName: { type: String, required: true },
    avatar: { type: String, default: null },
    createdAt: { type: Date, default: Date.now},
    resetCode: { type: String, default: null },
    resetCodeStatus: { type: Boolean, default: null },
    resetCodeExpire: { type: Date, default: null }
    
}, {
    versionKey: false
})

module.exports = mongoose.model('Account', Account, 'Account')