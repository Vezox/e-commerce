const Order = require('../models/Order')
const Cart = require('../models/Cart')
const Code = require('../models/Code')
const Product = require('../models/Product')

class CheckOutController {
    async checkOut(req, res) {
        const cartProductIds = req.query.cartProductIds.split(',')
        const code = req.query.code.trim()
        Promise.all([
            Cart.find({ _id: { $in: cartProductIds } }, { _id: 1, productId: 1, quantity: 1 }),
            code ? Code.findOne({ code: code }) : null
        ]).then(([cartProducts, code]) => {
            if (cartProductIds.length !== cartProducts.length) {
                return res.status(400).json({
                    message: 'Invalid cart product id'
                })
            }
            const productIds = cartProducts.map(product => product.productId)
            Product.find({ _id: { $in: productIds } }, {
                productName: 1,
                price: 1,
                coverImg: 1,
                discount: 1,
                slug: 1
            }).then(products => {
                const checkOutProducts = cartProducts.map(cartProduct => {
                    let product = products.find(product => product._id == cartProduct.productId)
                    product['quantity'] = cartProduct.quantity
                    product._id = cartProduct._id
                    return product
                })
                return res.render('order/checkOut',{ checkOutProducts, code })
            })

        }).catch(err => {
            res.sendStatus(500)
        })
    }
}

module.exports = new CheckOutController