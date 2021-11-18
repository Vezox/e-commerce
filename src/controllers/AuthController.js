const Account = require('../models/Account')
const createHmac = require('create-hmac')
const jwt = require('jsonwebtoken')

class AccountController {
    getLogin(req, res) {
        res.render('auth/login')
    }

    verify(req, res) {
        const username = req.body.username
        const password = req.body.password
        Account.findOne({ username }, {
            role: 1,
            password: 1,
            firstName: 1,
            lastName: 1,
            avatar: 1
        }, (err, acc) => {
            if (err) return res.status(401)
            if (!acc) return res.json({ message: 'username' })
            const hmac = createHmac('sha256', Buffer.from(process.env.HASH_KEY))
            hmac.update(password)
            let hashPass = hmac.digest("hex")
            if (acc.password != hashPass) {
                res.json({ message: 'password' })
            } else {
                const token = jwt.sign({ _id: acc._id }, process.env.JWT_TOKEN_SECRET , { expiresIn: '2h' })
                res.cookie('token', token, {httpOnly: true, maxAge: 2*60* 60 * 1000})
                res.cookie('role', acc.role, {maxAge: 2*60* 60 * 1000})
                res.status(200).send({
                    message: 'success',
                    role: acc.role,
                    firstName: acc.firstName,
                    avatar: acc.avatar,
                    token: token
                })
            }
        })
    }

    logout(req, res) {
        res.cookie('token', '', {maxAge: 1})
        res.cookie('role', '', {maxAge: 1})
        res.redirect('/auth/login')
    }

    register(req, res) {
        res.render('auth/register')
    }

    async createAccount(req, res) {
        let account = req.body
        try {
            const result = await Account.findOne({ username: account.username })
            if (result) return res.json({ message: 'username' })
            const hmac = createHmac('sha256', Buffer.from(process.env.HASH_KEY))
            hmac.update(account.password)
            account.password = hmac.digest("hex")
            account['userName'] = account.username
            await Account.create(account)
            return res.json({ message: 'success' })
        } catch (error) {
            console.log(error.message);
            res.status(500)
        }
    }

    success(req, res) {
        res.render('auth/success')
    }
}

module.exports = new AccountController
