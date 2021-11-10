const Code = require('../models/Code')
const jwt = require('jsonwebtoken')

class CodeController {

    storeCode(req, res) {
        const token = req.cookies.token
        const userId = jwt.verify(token, process.env.JWT_TOKEN_SECRET)['_id']
        Code.find({userId}, (err, code) => {
            if(err) return res.sendStatus(500)
            res.render('product/code-store', {code})
        })
    }

    getCodePost(req, res) {
        res.render('product/code-post')
    }

    saveCode(req, res) {
        const token = req.cookies.token
        const userId = jwt.verify(token, process.env.JWT_TOKEN_SECRET)['_id']
        let code = req.body
        code['userId'] = userId
        Code.create(code, err => {
            if (err) res.sendStatus(500)
            res.redirect('/store/code')
        })
    }

    deleteCode(req, res) {
        const token = req.cookies.token
        const userId = jwt.verify(token, process.env.JWT_TOKEN_SECRET)['_id']
        Code.deleteOne({_id: req.query.id, userId}, err => {
            if(err) res.status(500)
            res.sendStatus(200)
        })
    }
}

module.exports = new CodeController
