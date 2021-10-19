const mongoose = require('mongoose')
const Schema = mongoose.Schema
const slug = require('mongoose-slug-generator')
mongoose.plugin(slug)

const Product = new Schema({
    productName: { type: String, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    brand: { type: String, required: true },
    type: { type: String, required: true },
    quantity: { type: Number, required: true },
    sold: { type: Number, default: 0 },
    coverImg: { type: String, required: true },
    img1: { type: String, required: true },
    img2: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, default: 'pending' },
    slug: { type: String, slug: 'productName', unique: true },
}, {
    timestamps: true,
    versionKey: false
})

module.exports = mongoose.model('Product', Product, 'Product')