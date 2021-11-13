const Cart = require('../models/Cart')
const Product = require('../models/Product')
const jwt = require('jsonwebtoken')

class CartController {

    async getCart(req, res) {
        const token = req.cookies.token
        const userId = jwt.verify(token, process.env.JWT_TOKEN_SECRET)['_id']
        try {
            const cartProducts = await Cart.find({ userId }).sort({ updatedAt: -1 })
            const productIds = cartProducts.map(product => product.productId)
            const products = await Product.find({ _id: { $in: productIds } }, {
                productName: 1,
                price: 1,
                coverImg: 1,
                discount: 1,
                slug: 1,
            })
            const newCartProducts = cartProducts.map(cartProduct => {
                let product = products.find(product => product._id == cartProduct.productId)
                product['quantity'] = cartProduct.quantity
                product._id = cartProduct._id
                return product
            })
            res.render('cart/cart', { cartProducts: newCartProducts })
        }
        catch (err) {
            res.status(500).send(err)
        }
    }


    async addToCart(req, res) {
        console.log("hi")
        const token = req.cookies.token
        const userId = jwt.verify(token, process.env.JWT_TOKEN_SECRET)['_id']
        const productId = req.query.productId
        try {
            const cart = await Cart.findOne({ userId, productId })
            const product = {
                userId,
                productId,
                quantity: cart ? cart.quantity + 1 : 1
            }
            await Cart.updateOne({ userId, productId }, product, { upsert: 1 })
            res.sendStatus(200)
        } catch (err) {
            res.status(500).send(err)
        }
    }

    changeItemQuantity(req, res) {
        const id = req.query.id
        const quantity = req.query.quantity
        if (quantity > 0) {
            Cart.updateOne({ _id: id }, { quantity }, err => {
                if (err) return res.sendStatus(500)
                return res.sendStatus(200)
            })
        } else {
            Cart.deleteOne({ _id: id }, { quantity: quantity }, err => {
                if (err) return res.sendStatus(500)
                return res.sendStatus(200)
            })
        }
    }
}

module.exports = new CartController