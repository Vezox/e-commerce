const jwt = require('jsonwebtoken')
const createHmac = require('create-hmac')
const Account = require('../models/Account')
const Address = require('../models/Address')
const Order = require('../models/Order')

class MyController {

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