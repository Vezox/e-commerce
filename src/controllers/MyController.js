const jwt = require('jsonwebtoken')
const cloudinary = require('cloudinary').v2
const Account = require('../models/Account')
const Address = require('../models/Address')
const Order = require('../models/Order')

cloudinary.config({
    cloud_name: 'lazapee',
    api_key: '934919176775488',
    api_secret: 'Fy30k9Qpk1bWiE889ZdeLnelkro'
})

class MyController {

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
}

module.exports = new MyController