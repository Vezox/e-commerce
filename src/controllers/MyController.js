const jwt = require('jsonwebtoken')
const createHmac = require('create-hmac')
const Account = require('../models/Account')
const Address = require('../models/Address')
const Order = require('../models/Order')
const Cart = require('../models/Cart')
const Product = require('../models/Product')

class MyController {

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
                product['quantity'] = cartProduct.quantity
                product['productId'] = product._id
                product._id = cartProduct._id
                return product
            })
            return res.render('my/checkOut', { checkOutProducts, address, code })


        }).catch(err => {
            res.sendStatus(500)
        })
    }

    orderConfirm(req, res) {
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
                discount: 1,
                coverImg: 1,
                slug: 1,
                productName: 1
            })
            const orderProducts = []
            for (let cartProduct of cartProducts) {
                const product = products.find(product => product._id == cartProduct.productId)
                let orderProduct = {
                    productId: cartProduct.productId,
                    price: product.price,
                    discount: product.discount + code ? code.discount : 0,
                    coverImg: product.coverImg,
                    slug: product.slug,
                    productName: product.productName,
                    quantity: cartProduct.quantity,
                    addressId,
                    userId,
                }
                orderProducts.push(orderProduct)
            }
            await Order.insertMany(orderProducts)
            await Cart.deleteMany({ _id: { $in: cartProductIds } })
            return res.redirect('/my/ordered')
        }).catch(err => {
            res.status(500).json({ err })
        })
    }


    getPasswordChange(req, res) {
        res.render('my/password-change')
    }

    verifyPasswordChange(req, res) {
        const token = req.cookies.token
        const userId = jwt.verify(token, process.env.JWT_TOKEN_SECRET)['_id']
        const oldPassword = req.body.oldPassword
        const newPassword = req.body.newPassword
        Account.findById(userId, {
            password: 1
        }, (err, acc) => {
            if (err) return res.status(401)
            const hmac = createHmac('sha256', Buffer.from(process.env.HASH_KEY))
            hmac.update(oldPassword)
            let hashPass = hmac.digest("hex")
            if (acc.password != hashPass) {
                return res.json({ message: 'password' })
            } else {
                const hmac = createHmac('sha256', Buffer.from(process.env.HASH_KEY))
                hmac.update(newPassword)
                let hashPass = hmac.digest("hex")
                Account.updateOne({ _id: userId }, { password: hashPass }, err => {
                    if (err) return res.status(401)
                    return res.json({ message: 'success' })
                })
            }
        })
    }

    async myAddress(req, res) {
        const token = req.cookies.token
        const userId = jwt.verify(token, process.env.JWT_TOKEN_SECRET)['_id']
        try {
            const address = await Address.find({ userId })
            res.render('my/address', { address })
        } catch (err) {
            return res.status(401)
        }
    }

    async createAddress(req, res) {
        const token = req.cookies.token
        const userId = jwt.verify(token, process.env.JWT_TOKEN_SECRET)['_id']
        let address = { userId, ...req.body }
        try {
            await Address.create(address)
            res.redirect('/my/address')
        } catch (err) {
            return res.status(401)
        }
    }

    async deleteAddress(req, res) {
        const token = req.cookies.token
        const userId = jwt.verify(token, process.env.JWT_TOKEN_SECRET)['_id']
        const _id = req.params.id
        try {
            await Address.deleteOne({ _id, userId })
            res.redirect('/my/address')
        } catch (err) {
            return res.status(401)
        }
    }

    async ordered(req, res) {
        const token = req.cookies.token
        const userId = jwt.verify(token, process.env.JWT_TOKEN_SECRET)['_id']
        try {
            const orders = await Order.find({ userId }, { review: 0 })
            const addressId = orders.map(order => order.addressId)
            const addressList = await Address.find({ _id: { $in: addressId } })
            const orderDetail = orders.map(order => {
                const address = addressList.find(address => address._id.toString() === order.addressId.toString())
                return { ...order._doc, address }
            }).reverse()
            res.render('my/ordered', { orderDetail })
        } catch (err) {
            return res.status(401)
        }
    }
}

module.exports = new MyController