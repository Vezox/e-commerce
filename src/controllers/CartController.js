const Cart = require('../models/Cart')
const Product = require('../models/Product')
const jwt = require('jsonwebtoken')

class CartController {
    getCart(req, res) {
        const token = req.cookies.token
        const userId = jwt.verify(token, process.env.JWT_TOKEN_SECRET)['_id']
        Cart.find({ userId }, (err, cartProducts) => {
            if (err) res.status(500).send(err)
            const productIds = cartProducts.map(product => product.productId)
            Product.find({ _id: { $in: productIds } },
                {
                    productName: 1,
                    price: 1,
                    coverImg: 1,
                    discount: 1,
                    slug: 1,
                },
                (err, products) => {
                    if (err) res.status(500).send(err)
                    const newCartProducts = cartProducts.map(cartProduct => {
                        let product = products.find(product => product._id == cartProduct.productId)
                        product['quantity'] = cartProduct.quantity
                        return product
                    })
                    res.render('cart/cart', { cartProducts: newCartProducts })
                }
            )
        })
    }


    async addToCart(req, res) {
        const token = req.cookies.token
        const userId = jwt.verify(token, process.env.JWT_TOKEN_SECRET)['_id']
        const productId = req.body.productId
        try {
            const cart = await Cart.findOne({ userId, productId })
            const product = {
                userId,
                productId,
                quantity: cart ? cart.quantity + 1 : 1
            }
            Cart.updateOne({ userId, productId }, product, { upsert: 1 }, err => {
                if (err) res.status(500)
                res.sendStatus(200)
            })
        } catch (err) {
            res.status(500).send(err)
        }
    }
}

module.exports = new CartController