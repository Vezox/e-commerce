const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Order = new Schema({
    userId: { type: String, required: true },
    productId: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    slug: { type: String, required: true },
    productName: { type: String, required: true },
    coverImg: { type: String, required: true },
    discount: { type: Number, required: true },
    addressId: { type: String, required: true },
    status: { type: String, default: 'Đang chờ' },
    isReviewed: { type: Boolean, default: null },
    review: {
        userName: { type: String },
        content: { type: String },
        image: { type: String },
    },
}, {
    versionKey: false,
    timestamps: true
})

module.exports = mongoose.model('Order', Order, 'Order')