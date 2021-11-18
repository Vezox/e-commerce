const Order = require('../models/Order')
const Cart = require('../models/Cart')
const Code = require('../models/Code')
const Product = require('../models/Product')
const Address = require('../models/Address')
const jwt = require('jsonwebtoken')

class CheckOutController {
    checkOut(req, res) {
        const token = req.cookies.token
        const userId = jwt.verify(token, process.env.JWT_TOKEN_SECRET)['_id']
        const cartProductIds = req.query.cartProductIds.split(',')
        const code = req.query.code.trim()
        Promise.all([
            Cart.find({ _id: { $in: cartProductIds } }, { productId: 1, quantity: 1 }),
            Address.find({ userId }),
            code ? Code.findOne({ code: code }) : null
        ]).then(async ([cartProducts, address, code]) => {
            if (cartProductIds.length !== cartProducts.length) {
                return res.status(400).json({
                    message: 'Invalid cart product id'
                })
            }
            const productIds = cartProducts.map(product => product.productId)
            const products = await Product.find({ _id: { $in: productIds } }, {
                productName: 1,
                price: 1,
                coverImg: 1,
                discount: 1,
                slug: 1
            })
            const checkOutProducts = cartProducts.map(cartProduct => {
                let product = products.find(product => product._id == cartProduct.productId)
                product.quantity = cartProduct.quantity
                product._id = cartProduct._id
                return product
            })
            return res.render('order/checkOut', { checkOutProducts, address, code })


        }).catch(err => {
            res.sendStatus(500)
        })
    }

    order(req, res) {
        const token = req.cookies.token
        const userId = jwt.verify(token, process.env.JWT_TOKEN_SECRET)['_id']
        const cartProductIds = req.query.cartProductIds.split(',')
        const addressId = req.query.addressId
        const code = req.query.code.trim()
        Promise.all([
            Cart.find({ _id: { $in: cartProductIds } }, { productId: 1, quantity: 1 }),
            Address.findById(addressId),
            code ? Code.findOne({ code: code }) : null
        ]).then(async ([cartProducts, address, code]) => {
            if (!address) {
                return res.status(400).json({
                    message: 'Invalid address'
                })
            }
            if (cartProductIds.length !== cartProducts.length) {
                return res.status(400).json({
                    message: 'Invalid cart product id'
                })
            }
            const productIds = cartProducts.map(product => product.productId)
            const products = await Product.find({ _id: { $in: productIds } }, {
                price: 1,
                discount: 1
            })
            const addressId = address._id.toString()
            const orderProducts = []
            for (let cartProduct of cartProducts) {
                const product = products.find(product => product._id == cartProduct.productId)
                let orderProduct = {
                    productId: cartProduct.productId,
                    price: product.price,
                    discount: product.discount + code ? code.discount : 0,
                    quantity: cartProduct.quantity,
                    addressId,
                    userId,
                }
                orderProducts.push(orderProduct)
            }
            await Order.insertMany(orderProducts)
            await Cart.deleteMany({ _id: { $in: cartProductIds } })
            return res.status(200).json({orderProducts})
        }).catch(err => {
            res.status(500).json({err})
        })
    }
}

module.exports = new CheckOutController