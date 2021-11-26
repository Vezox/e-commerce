const jwt = require('jsonwebtoken')
const cloudinary = require('cloudinary').v2
const Order = require('../models/Order')
const Product = require('../models/Product')
const Account = require('../models/Account')
const Cart = require('../models/Cart')
const Address = require('../models/Address')

cloudinary.config({
    cloud_name: 'lazapee',
    api_key: '934919176775488',
    api_secret: 'Fy30k9Qpk1bWiE889ZdeLnelkro'
})

class OrderController {

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
            return res.render('order/checkOut', { checkOutProducts, address, code })


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

    async getOrder(req, res) {
        try {
            const token = req.cookies.token
            const userId = jwt.verify(token, process.env.JWT_TOKEN_SECRET)['_id']
            const product = await Product.find({ userId }, { _id: 1 })
            const productIds = product.map(item => item._id)
            const options = req.params.options
            let status = 'Đang chờ'
            let url = 'order/order-pending'
            switch (options) {
                case 'reject':
                    status = 'Đã hủy'
                    url = 'order/order-reject'
                    break
                case 'accept':
                    status = 'Đang giao'
                    url = 'order/order-accept'
                    break
                case 'received':
                    status = 'Đã nhận'
                    url = 'order/order-received'
                    break
            }
            const orders = await Order.find({
                productId: { $in: productIds },
                status
            }, {
                review: 0,
                isReviewed: 0,
                addressId: 0,
                userId: 0,
                status: 0,
            })
            res.render(url, { orders })
        } catch (error) {
            res.status(500)
        }
    }

    async acceptOrder(req, res) {
        const token = req.cookies.token
        const userId = jwt.verify(token, process.env.JWT_TOKEN_SECRET)['_id']
        const id = req.query.id
        const productId = req.query.productId
        Promise.all([
            Product.find({ userId, productId }),
            Order.find({ id, status: 'Đang chờ', productId })
        ]).then(async ([product, order]) => {
            if (!product || !order) {
                return res.status(404).json({ message: 'Không tìm thấy đơn hàng' })
            } else {
                try {
                    await Order.updateOne({ _id: id, status: 'Đang chờ' }, { status: 'Đang giao' })
                    return res.sendStatus(200)
                } catch (error) {
                    return res.status(500).json({ error: error.message })
                }
            }
        }).catch(err => {
            return res.status(500).json({ error: err.message })
        })
    }

    async rejectOrder(req, res) {
        const token = req.cookies.token
        const userId = jwt.verify(token, process.env.JWT_TOKEN_SECRET)['_id']
        const id = req.query.id
        const productId = req.query.productId
        Promise.all([
            Product.find({ userId, productId }),
            Order.find({ id, status: 'Đang chờ', productId })
        ]).then(async ([product, order]) => {
            if (!product || !order) {
                return res.status(404).json({ message: 'Không tìm thấy đơn hàng' })
            } else {
                try {
                    await Order.updateOne({ _id: id, status: 'Đang chờ' }, { status: 'Đã hủy' })
                    return res.sendStatus(200)
                } catch (error) {
                    return res.status(500).json({ error: error.message })
                }
            }
        }).catch(err => {
            return res.status(500).json({ error: err.message })
        })
    }

    async receivedOrder(req, res) {
        try {
            const token = req.cookies.token
            const userId = jwt.verify(token, process.env.JWT_TOKEN_SECRET)['_id']
            const orderId = req.query.orderId
            await Order.updateOne({
                _id: orderId,
                userId,
                status: 'Đang giao'
            }, {
                status: 'Đã nhận',
                isReviewed: false
            })
            res.sendStatus(200)
        } catch (error) {
            res.status(500)
        }
    }

    async reviewOrder(req, res) {
        try {
            const token = req.cookies.token
            const userId = jwt.verify(token, process.env.JWT_TOKEN_SECRET)['_id']
            const account = await Account.findById(userId, { firstName: 1 })
            const orderId = req.params.orderId
            const content = req.body
            const file = req.files?.image
            let image = null
            if (file) {
                const imageUrl = await cloudinary.uploader.upload(file.tempFilePath)
                image = imageUrl.url
            }
            await Order.updateOne({
                _id: orderId,
                userId,
                status: 'Đã nhận',
                isReviewed: false
            }, {
                review: {
                    userName: account.firstName,
                    content: content.content,
                    image
                },
                isReviewed: true
            })
            res.redirect('/my/ordered')
        } catch (error) {
            res.status(500)
        }
    }

    getStatistical(req, res) {
        res.render('product/statistical')
    }

    async getDataStatistical(req, res) {
        const token = req.cookies.token
        const userId = jwt.verify(token, process.env.JWT_TOKEN_SECRET)['_id']
        const product = await Product.find({ userId }, { _id: 1 })
        const productIds = product.map(item => item._id)
        const orders = await Order.find({
            productId: { $in: productIds },
            createdAt: {
                $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toString(),
                $lt: new Date(Date.now()).toString()
            },
            status: 'Đã nhận'
        }, {
            productName: 1,
            quantity: 1,
            price: 1,
            createdAt: 1,
        })
        res.json({ orders })
    }
}

module.exports = new OrderController