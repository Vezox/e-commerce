const Code = require('../models/Code')
const jwt = require('jsonwebtoken')

class CodeController {

    storeCode(req, res) {
        Code.find({}, (err, code) => {
            if(err) return res.sendStatus(500)
            res.render('admin/code-store', {code})
        })
    }

    getCodePost(req, res) {
        res.render('admin/code-post')
    }

    saveCode(req, res) {
        const token = req.cookies.token
        const userId = jwt.verify(token, process.env.JWT_TOKEN_SECRET)['_id']
        let code = req.body
        code['userId'] = userId
        Code.create(code, err => {
            if (err) res.sendStatus(500)
            res.redirect('/admin/code')
        })
    }

    deleteCode(req, res) {
        Code.deleteOne({_id: req.params.id}, err => {
            if(err) return res.status(500)
            res.sendStatus(200)
        })
    }

    applyCode(req, res) {
        const code = req.query.code
        Code.findOne({code}, (err, code) => {
            if(err) return res.sendStatus(500)
            if(code) return res.json({
                discount: code.discount,
                quantity: code.quantity
            })
            res.sendStatus(404)
        })
    }
}

module.exports = new CodeController
