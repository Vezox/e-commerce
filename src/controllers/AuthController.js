const Account = require('../models/Account')
const SampleAccount = require('../models/SampleAccount')
const mailer = require('../utils/mailer')
const createHmac = require('create-hmac')
const jwt = require('jsonwebtoken')

class AccountController {
    getLogin(req, res) {
        res.render('auth/login')
    }

    verify(req, res) {
        const email = req.body.email
        const password = req.body.password
        Account.findOne({ email }, {
            role: 1,
            password: 1,
            firstName: 1,
            lastName: 1,
            avatar: 1
        }, (err, acc) => {
            if (err) return res.status(401)
            if (!acc) return res.json({ message: 'email' })
            const hmac = createHmac('sha256', Buffer.from(process.env.HASH_KEY))
            hmac.update(password)
            let hashPass = hmac.digest("hex")
            if (acc.password != hashPass) {
                res.json({ message: 'password' })
            } else {
                const token = jwt.sign({ _id: acc._id }, process.env.JWT_TOKEN_SECRET, { expiresIn: '2h' })
                res.cookie('token', token, { httpOnly: true, maxAge: 2 * 60 * 60 * 1000 })
                res.cookie('role', acc.role, { maxAge: 2 * 60 * 60 * 1000 })
                res.status(200).send({
                    message: 'success',
                    firstName: acc.firstName,
                    avatar: acc.avatar,
                })
            }
        })
    }

    logout(req, res) {
        res.cookie('token', '', { maxAge: 1 })
        res.cookie('role', '', { maxAge: 1 })
        res.redirect('/auth/login')
    }

    register(req, res) {
        res.render('auth/register')
    }

    async createAccount(req, res) {
        let account = req.body
        try {
            const result = await Account.findOne({ email: account.email })
            if (result) return res.json({ message: 'email' })
            const hmac = createHmac('sha256', Buffer.from(process.env.HASH_KEY))
            hmac.update(account.password)
            account.password = hmac.digest("hex")
            const subject = 'X??c nh???n ????ng k?? t??i kho???n'
            const code = Math.floor(Math.random() * 89999) + 10000
            const html = `<h1>M?? x??c nh???n ????ng k?? t??i kho???n</h1>
            <p>M?? x??c nh???n c???a b???n l??: <b>${code}</b>, m?? c?? hi???u l???c trong v??ng 15 ph??t k??? t??? th???i ??i???m tin nh???n n??y ???????c g???i</p>
            <p>N???u b???n kh??ng y??u c???u ????ng k?? t??i kho???n, vui l??ng b??? qua email n??y</p>`
            account.verifyCode = code
            await Promise.all([
                mailer.sendMail(account.email, subject, html),
                SampleAccount.replaceOne({ email: account.email }, account, { upsert: true })
            ])
            return res.json({ message: 'success' })
        } catch (error) {
            console.log(error.message)
            res.status(500).json({ message: error.message })
        }
    }

    async getVerifyAccount(req, res) {
        res.render('auth/verify-account')
    }

    async verifyAccount(req, res) {
        const { email, code } = req.body
        const find = {
            email,
            verifyCode: code,
        }
        try {
            let sampleAccount = await SampleAccount.findOne(find)
            if (!sampleAccount) {
                return res.json({ status: 'error', message: 'M?? x??c nh???n kh??ng h???p l???' })
            }
            sampleAccount = JSON.parse(JSON.stringify(sampleAccount))
            delete sampleAccount.verifyCode
            sampleAccount.createdAt = Date.now()
            await Promise.all([
                SampleAccount.deleteOne(find),
                Account.replaceOne({ email }, sampleAccount, { upsert: true })
            ])
            const token = jwt.sign({ _id: sampleAccount._id }, process.env.JWT_TOKEN_SECRET, { expiresIn: '2h' })
            res.cookie('token', token, { httpOnly: true, maxAge: 2 * 60 * 60 * 1000 })
            res.cookie('role', sampleAccount.role, { maxAge: 2 * 60 * 60 * 1000 })
            res.json({
                status: 'success',
                firstName: sampleAccount.firstName,
                avatar: sampleAccount.avatar,
            })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }

    getPasswordChange(req, res) {
        res.render('auth/password-change')
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
}

module.exports = new AccountController
