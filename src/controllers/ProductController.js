const Product = require('../models/Product')
const jwt = require('jsonwebtoken')

class ProductController {
    getPost(req, res) {
        res.render('product/post')
    }

    savePost(req, res) {
        let product = req.body
        const token = req.cookies.token
        const userId = jwt.verify(token, process.env.JWT_TOKEN_SECRET)['_id']
        product['userId'] = userId
        Product.create(product, err => {
            if (err) res.status(500)
            res.redirect('/product/store')
        })
    }

    async getStore(req, res) {
        try {
            const token = req.cookies.token
            const userId = jwt.verify(token, process.env.JWT_TOKEN_SECRET)['_id']
            let products = await Product.find({userId}, {
                coverImg: 1,
                productName: 1,
                price: 1,
                discount: 1,
                quantity: 1,
                sold: 1,
                slug: 1,
            })
            products.reverse()
            res.render('product/store', { products })
        } catch (error) {
            res.status(500)
        }
    }

    async getEditProduct(req, res) {
        try {
            const product = await Product.findOne({ slug: req.params.slug })
            res.render('product/edit', { product })
        } catch (error) {
            res.status(500)
        }
    }

    updateProduct(req, res) {
        const token = req.headers.token
        const userId = jwt.verify(token, process.env.JWT_TOKEN_SECRET)['_id']
        Product.updateOne({ slug: req.body.slug, userId }, req.body, error => {
            if (error) res.status(error)
            res.json({ status: 200 })
        })
    }

    async getDetailsProduct(req, res) {
        try {
            const product = await Product.findOne({ slug: req.params.slug })
            res.render('product/details', { product })
        } catch (error) {
            res.status(500)
        }
    }
}

module.exports = new ProductController