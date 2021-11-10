const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Code = new Schema({
    code: { type: String, required: true },
    userId: { type: String, required: true },
    discount: { type: Number, required: true },
    quantity: { type: Number, required: true },
}, {
    versionKey: false,
    timestamps: true
})

module.exports = mongoose.model('Code', Code, 'Code')