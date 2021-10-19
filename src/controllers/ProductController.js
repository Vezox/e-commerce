const { response } = require('express')
const Product = require('../models/Product')

class ProductController {
    getPost(req, res) {
        res.render('product/post')
    }

    savePost(req, res) {
        Product.create(req.body, err => {
            if (err) res.status(500)
            res.redirect('/product/store')
        })
    }

    async getStore(req, res) {
        try {
            let products = await Product.find({}, {
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
        Product.updateOne({ slug: req.body.slug }, req.body, error => {
            if (error) res.status(error)
            res.json({status: 200})
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