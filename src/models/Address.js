const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Address = new Schema({
    userId: { type: String, required: true },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    village: { type: String, required: true, },
    district: { type: String, required: true },
    province: { type: String, required: true },
}, {
    versionKey: false
})

module.exports = mongoose.model('Address', Address, 'Address')