const Product = require('../models/Product')
const Order = require('../models/Order')
const jwt = require('jsonwebtoken')
const cloudinary = require('cloudinary').v2

cloudinary.config({
    cloud_name: 'lazapee',
    api_key: '934919176775488',
    api_secret: 'Fy30k9Qpk1bWiE889ZdeLnelkro'
})

class ProductController {
    getPost(req, res) {
        res.render('product/post')
    }

    savePost(req, res) {
        let product = req.body
        const token = req.cookies.token
        const userId = jwt.verify(token, process.env.JWT_TOKEN_SECRET)['_id']
        product['userId'] = userId
        const { coverImg, img1, img2 } = { ...req.files }
        Promise.all([
            cloudinary.uploader.upload(coverImg.tempFilePath),
            cloudinary.uploader.upload(img1.tempFilePath),
            cloudinary.uploader.upload(img2.tempFilePath)
        ]).then(results => {
            product['coverImg'] = results[0].url
            product['img1'] = results[1].url
            product['img2'] = results[2].url
            Product.create(product, error => {
                if (error) return res.sendStatus(error)
                res.redirect('/store/product/pending')
            })
        }).catch(err => {
            res.send(err)
        })
    }

    async getStore(req, res) {
        try {
            const token = req.cookies.token
            const userId = jwt.verify(token, process.env.JWT_TOKEN_SECRET)['_id']
            let products = await Product.find({ userId, status: 'accept' }, {
                coverImg: 1,
                productName: 1,
                price: 1,
                discount: 1,
                quantity: 1,
                sold: 1,
                slug: 1,
                status: 1,
            })
            products.reverse()
            res.render('product/store', { products })
        } catch (error) {
            res.status(500)
        }
    }

    async getProductBlock(req, res) {
        try {
            const token = req.cookies.token
            const userId = jwt.verify(token, process.env.JWT_TOKEN_SECRET)['_id']
            let products = await Product.find({ status: 'block' }, {
                coverImg: 1,
                productName: 1,
                price: 1,
                discount: 1,
                quantity: 1,
                sold: 1,
                slug: 1,
            })
            products.reverse()
            res.render('product/product-block', { products })
        } catch (error) {
            res.status(500)
        }
    }

    async getProductPending(req, res) {
        try {
            const token = req.cookies.token
            const userId = jwt.verify(token, process.env.JWT_TOKEN_SECRET)['_id']
            let products = await Product.find({ status: 'pending' }, {
                coverImg: 1,
                productName: 1,
                price: 1,
                discount: 1,
                quantity: 1,
                slug: 1,
            })
            products.reverse()
            res.render('product/product-pending', { products })
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
        const token = req.cookies.token
        const userId = jwt.verify(token, process.env.JWT_TOKEN_SECRET)['_id']
        const slug = req.params.slug
        let product = req.body
        const { coverImg, img1, img2 } = { ...req.files }
        Promise.all([
            coverImg ? cloudinary.uploader.upload(coverImg.tempFilePath) : null,
            img1 ? cloudinary.uploader.upload(img1.tempFilePath) : null,
            img2 ? cloudinary.uploader.upload(img2.tempFilePath) : null
        ]).then(results => {
            coverImg ? (product['coverImg'] = results[0].url) : null
            img1 ? (product['img1'] = results[1].url) : null
            img2 ? (product['img2'] = results[2].url) : null
            Product.updateOne({ slug, userId }, product, error => {
                if (error) return res.sendStatus(error)
                res.redirect('/store/product')
            })
        }).catch(err => {
            res.send(err)
        })
    }

    deleteProduct(req, res) {
        const token = req.cookies.token
        const userId = jwt.verify(token, process.env.JWT_TOKEN_SECRET)['_id']
        const id = req.params.id
        Product.deleteOne({ _id: id, userId }, error => {
            if (error) return res.sendStatus(error)
            res.sendStatus(200)
        })
    }

    async getDetailsProduct(req, res) {
        const slug = req.params.slug.split('.')
        const name = slug[0]
        const id = slug[1]
        Promise.all([
            Product.findById(id),
            Order.find({ productId: id, isReviewed: true }, { review: 1 })
        ]).then(([product, reviews]) => {
            res.render('product/details', { product, reviews })
        }).catch(err => {
            res.status(500)
        })
    }

}

module.exports = new ProductController