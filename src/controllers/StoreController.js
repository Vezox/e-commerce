const jwt = require('jsonwebtoken')
const cloudinary = require('cloudinary').v2
const Order = require('../models/Order')
const Product = require('../models/Product')

cloudinary.config({
    cloud_name: 'lazapee',
    api_key: '934919176775488',
    api_secret: 'Fy30k9Qpk1bWiE889ZdeLnelkro'
})

class StoreController {
    getPost(req, res) {
        res.render('store/post')
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
            res.render('store/store', { products })
        } catch (error) {
            res.status(500)
        }
    }

    async getProductBlock(req, res) {
        try {
            const token = req.cookies.token
            const userId = jwt.verify(token, process.env.JWT_TOKEN_SECRET)['_id']
            let products = await Product.find({userId, status: 'block' }, {
                coverImg: 1,
                productName: 1,
                price: 1,
                discount: 1,
                quantity: 1,
                sold: 1,
                slug: 1,
            })
            products.reverse()
            res.render('store/product-block', { products })
        } catch (error) {
            res.status(500)
        }
    }

    async getProductPending(req, res) {
        try {
            const token = req.cookies.token
            const userId = jwt.verify(token, process.env.JWT_TOKEN_SECRET)['_id']
            let products = await Product.find({ userId, status: 'pending' }, {
                coverImg: 1,
                productName: 1,
                price: 1,
                discount: 1,
                quantity: 1,
                slug: 1,
            })
            products.reverse()
            res.render('store/product-pending', { products })
        } catch (error) {
            res.status(500)
        }
    }

    async getEditProduct(req, res) {
        try {
            const product = await Product.findOne({ slug: req.params.slug })
            res.render('store/edit', { product })
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

    
    async getOrder(req, res) {
        try {
            const token = req.cookies.token
            const userId = jwt.verify(token, process.env.JWT_TOKEN_SECRET)['_id']
            const product = await Product.find({ userId }, { _id: 1 })
            const productIds = product.map(item => item._id)
            const options = req.params.options
            let status = 'Đang chờ'
            let url = 'store/order-pending'
            switch (options) {
                case 'reject':
                    status = 'Đã hủy'
                    url = 'store/order-reject'
                    break
                case 'accept':
                    status = 'Đang giao'
                    url = 'store/order-accept'
                    break
                case 'received':
                    status = 'Đã nhận'
                    url = 'store/order-received'
                    break
            }
            const orders = await Order.find({
                productId: { $in: productIds },
                status
            }, {
                review: 0,
                isReviewed: 0,
                addressId: 0,
                userId: 0,
                status: 0,
            })
            orders.reverse()
            res.render(url, { orders })
        } catch (error) {
            res.status(500)
        }
    }

    
    async acceptOrder(req, res) {
        const token = req.cookies.token
        const userId = jwt.verify(token, process.env.JWT_TOKEN_SECRET)['_id']
        const id = req.query.id
        const productId = req.query.productId
        Promise.all([
            Product.find({ userId, productId }),
            Order.find({ id, status: 'Đang chờ', productId })
        ]).then(async ([product, order]) => {
            if (!product || !order) {
                return res.status(404).json({ message: 'Không tìm thấy đơn hàng' })
            } else {
                try {
                    await Order.updateOne({ _id: id, status: 'Đang chờ' }, { status: 'Đang giao' })
                    return res.sendStatus(200)
                } catch (error) {
                    return res.status(500).json({ error: error.message })
                }
            }
        }).catch(err => {
            return res.status(500).json({ error: err.message })
        })
    }

    async rejectOrder(req, res) {
        const token = req.cookies.token
        const userId = jwt.verify(token, process.env.JWT_TOKEN_SECRET)['_id']
        const id = req.query.id
        const productId = req.query.productId
        Promise.all([
            Product.find({ userId, productId }),
            Order.find({ id, status: 'Đang chờ', productId })
        ]).then(async ([product, order]) => {
            if (!product || !order) {
                return res.status(404).json({ message: 'Không tìm thấy đơn hàng' })
            } else {
                try {
                    await Order.updateOne({ _id: id, status: 'Đang chờ' }, { status: 'Đã hủy' })
                    return res.sendStatus(200)
                } catch (error) {
                    return res.status(500).json({ error: error.message })
                }
            }
        }).catch(err => {
            return res.status(500).json({ error: err.message })
        })
    }

    
    getStatistical(req, res) {
        res.render('store/statistical')
    }

    async getDataStatistical(req, res) {
        const token = req.cookies.token
        const userId = jwt.verify(token, process.env.JWT_TOKEN_SECRET)['_id']
        const product = await Product.find({ userId }, { _id: 1 })
        const productIds = product.map(item => item._id)
        const orders = await Order.find({
            productId: { $in: productIds },
            createdAt: {
                $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toString(),
                $lt: new Date(Date.now()).toString()
            },
            status: 'Đã nhận'
        }, {
            productName: 1,
            quantity: 1,
            price: 1,
            createdAt: 1,
        })
        res.json({ orders })
    }
}

module.exports = new StoreController