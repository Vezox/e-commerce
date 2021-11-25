const jwt = require('jsonwebtoken')
const cloudinary = require('cloudinary').v2
const Order = require('../models/Order')
const Product = require('../models/Product')
const Account = require('../models/Account')

cloudinary.config({
    cloud_name: 'lazapee',
    api_key: '934919176775488',
    api_secret: 'Fy30k9Qpk1bWiE889ZdeLnelkro'
})

class OrderController {

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
            await Order.updateOne({ _id: orderId, userId, status: 'Đang giao' }, { status: 'Đã nhận', isReviewed: false })
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
            const image = req.files.image
            const imageUrl = await cloudinary.uploader.upload(image.tempFilePath)
            await Order.updateOne({
                _id: orderId,
                userId,
                status: 'Đã nhận',
                isReviewed: false
            }, {
                review: {
                    userName: account.firstName,
                    content: content.content,
                    image: imageUrl.url
                },
                isReviewed: true
            })
            res.redirect('/my/ordered')
        } catch (error) {
            res.status(500)
        }
    }
}

module.exports = new OrderController