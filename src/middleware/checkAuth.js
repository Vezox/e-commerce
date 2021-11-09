const Account = require('../models/Account')
const jwt = require('jsonwebtoken')

module.exports = {
    checkAdmin: (req, res, next) => {
        const token = req.headers.cookie.split(';')[1].split('=')[1]
        if (token == undefined) return res.redirect('/auth/login')
        const id = jwt.verify(token, process.env.JWT_TOKEN_SECRET)['_id']
        Account.findOne({
            _id: id,
            role: 2
        }, (err, acc) => {
            if (err) res.status(500)
            if (acc) return next()
            res.render('auth/login')
        })

    },
    checkUser: (req, res, next) => {
        const token = req.cookies.token
        if (token) {
            const id = jwt.verify(token, process.env.JWT_TOKEN_SECRET)['_id']
            Account.findOne({
                _id: id,
                role: 1
            }, (err, acc) => {
                if (err) return res.status(500)
                if (acc) return next()
            })
        } else {
            res.status(400).redirect('/auth/login')
        }

    }
}