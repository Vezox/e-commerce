const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Cart = new Schema({
    userId: { type: String, required: true },
    productId: { type: String, required: true },
    quantity: { type: Number, default: 1 },
}, {versionKey: false})

module.exports = mongoose.model('Cart', Cart, 'Cart')

