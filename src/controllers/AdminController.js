const Product = require('../models/Product')


class AdminController {

    async getAllProduct(req, res) {
        try {
            let products = await Product.find({}, {
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
            return res.render('admin/product', { products })
        } catch (error) {
            res.status(500)
        }
    }


    getPendingProduct(req, res) {
        Product.find({ status: 'pending' },{
            coverImg: 1,
            productName: 1,
            price: 1,
            discount: 1,
            quantity: 1,
            slug: 1,
            description: 1,
        }, (error, products) => {
            if (error) return res.sendStatus(error)
            res.render('admin/product-pending', { products })
        })
    }


    acceptProduct(req, res) {
        const slug = req.params.slug
        Product.updateOne({ slug }, { status: 'accept' }, error => {
            if (error) return res.sendStatus(error)
            return res.sendStatus(200)
        })
    }

    blockProduct(req, res) {
        const slug = req.params.slug
        Product.updateOne({ slug }, { status: 'block' }, error => {
            if (error) return res.sendStatus(error)
            return res.sendStatus(200)
        })
    }
}

module.exports = new AdminController