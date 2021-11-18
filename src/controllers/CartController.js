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
            const products = await Product.find({ _id: { $in: productIds }, status: 'accept'}, {
                productName: 1,
                price: 1,
                coverImg: 1,
                discount: 1,
                slug: 1,
            })
            let newCartProducts = []
            for(let i = 0; i < cartProducts.length; i++) {
                let product = products.find(product => product._id == cartProducts[i].productId)
                if(product) {
                    product['quantity'] = cartProducts[i].quantity
                    product._id = cartProducts[i]._id
                    newCartProducts.push(product)
                }
            }
            res.render('cart/cart', { cartProducts: newCartProducts })
        }
        catch (err) {
            res.status(500).send(err)
        }
    }


    async addToCart(req, res) {
        const token = req.cookies.token
        const userId = jwt.verify(token, process.env.JWT_TOKEN_SECRET)['_id']
        const productId = req.query.productId
        try {
            const isProduct = await Product.findById(productId, {status: 1})
                if (isProduct.status == 'accept') {
                const cart = await Cart.findOne({ userId, productId })
                const product = {
                    userId,
                    productId,
                    quantity: cart ? cart.quantity + 1 : 1
                }
                await Cart.updateOne({ userId, productId }, product, { upsert: 1 })
                return res.sendStatus(200)
            } else {
                return res.sendStatus(400)
            }
        } catch (err) {
            return res.status(500).send(err)
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