const Cart = require('../models/Cart')
const Product = require('../models/Product')
const jwt = require('jsonwebtoken')

class CartController {

    async getCart(req, res) {
        const token = req.cookies.token
        const userId = jwt.verify(token, process.env.JWT_TOKEN_SECRET)['_id']
        try {
            const cartProducts = await Cart.find({ userId }).sort({ updatedAt: -1 })
            const productIds = cartProducts.map(product => product.productId)
            const products = await Product.find({ _id: { $in: productIds }, status: 'accept' }, {
                productName: 1,
                price: 1,
                coverImg: 1,
                discount: 1,
                slug: 1,
            })
            let newCartProducts = []
            for (let i = 0; i < cartProducts.length; i++) {
                let product = products.find(product => product._id == cartProducts[i].productId)
                if (product) {
                    product['quantity'] = cartProducts[i].quantity
                    product['productId'] = product._id
                    product._id = cartProducts[i]._id
                    newCartProducts.push(product)
                }
            }
            res.render('cart/cart', { cartProducts: newCartProducts })
        }
        catch (err) {
            res.status(500).send(err)
        }
    }


    async addToCart(req, res) {
        const token = req.cookies.token
        const userId = jwt.verify(token, process.env.JWT_TOKEN_SECRET)['_id']
        const productId = req.query.productId
        try {
            const product = await Product.findById(productId, { status: 1, userId: 1 })
            if (product.userId == userId) {
                return res.status(403).send('You can not add your own product to cart')
            } else if (product.status == 'accept') {
                const cart = await Cart.findOne({ userId, productId })
                const newCartProduct = {
                    userId,
                    productId,
                    quantity: cart ? cart.quantity + 1 : 1
                }
                await Cart.updateOne({ userId, productId }, newCartProduct, { upsert: 1 })
                return res.sendStatus(200)
            } else {
                return res.sendStatus(400)
            }
        } catch (err) {
            return res.status(500).send(err)
        }
    }

    changeItemQuantity(req, res) {
        const id = req.query.id
        const quantity = req.query.quantity
        if (quantity > 0) {
            Cart.updateOne({ _id: id }, { quantity }, err => {
                if (err) return res.sendStatus(500)
                return res.sendStatus(200)
            })
        } else {
            Cart.deleteOne({ _id: id }, { quantity: quantity }, err => {
                if (err) return res.sendStatus(500)
                return res.sendStatus(200)
            })
        }
    }

    async deleteItem(req, res) {
        const id = req.query.id
        try {
            await Cart.deleteOne({ _id: id })
            return res.sendStatus(200)
        } catch (err) {
            return res.status(500).send(err)
        }
    }

    
    checkOut(req, res) {
        const token = req.cookies.token
        const userId = jwt.verify(token, process.env.JWT_TOKEN_SECRET)['_id']
        const cartProductIds = req.query.cartProductIds.split(',')
        const code = req.query.code.trim()
        Promise.all([
            Cart.find({ _id: { $in: cartProductIds } }, { productId: 1, quantity: 1 }),
            Address.find({ userId }),
            code ? Code.findOne({ code: code }) : null
        ]).then(async ([cartProducts, address, code]) => {
            if (cartProductIds.length !== cartProducts.length) {
                return res.status(400).json({
                    message: 'Invalid cart product id'
                })
            }
            const productIds = cartProducts.map(product => product.productId)
            const products = await Product.find({ _id: { $in: productIds } }, {
                productName: 1,
                price: 1,
                coverImg: 1,
                discount: 1,
                slug: 1
            })
            const checkOutProducts = cartProducts.map(cartProduct => {
                let product = products.find(product => product._id == cartProduct.productId)
                product['quantity'] = cartProduct.quantity
                product['productId'] = product._id
                product._id = cartProduct._id
                return product
            })
            return res.render('cart/checkOut', { checkOutProducts, address, code })


        }).catch(err => {
            res.sendStatus(500)
        })
    }

    orderConfirm(req, res) {
        const token = req.cookies.token
        const userId = jwt.verify(token, process.env.JWT_TOKEN_SECRET)['_id']
        const cartProductIds = req.query.cartProductIds.split(',')
        const addressId = req.query.addressId
        const code = req.query.code.trim()
        Promise.all([
            Cart.find({ _id: { $in: cartProductIds } }, { productId: 1, quantity: 1 }),
            Address.findById(addressId),
            code ? Code.findOne({ code: code }) : null
        ]).then(async ([cartProducts, address, code]) => {
            if (!address) {
                return res.status(400).json({
                    message: 'Invalid address'
                })
            }
            if (cartProductIds.length !== cartProducts.length) {
                return res.status(400).json({
                    message: 'Invalid cart product id'
                })
            }
            const productIds = cartProducts.map(product => product.productId)
            const products = await Product.find({ _id: { $in: productIds } }, {
                price: 1,
                discount: 1,
                coverImg: 1,
                slug: 1,
                productName: 1
            })
            const orderProducts = []
            for (let cartProduct of cartProducts) {
                const product = products.find(product => product._id == cartProduct.productId)
                let orderProduct = {
                    productId: cartProduct.productId,
                    price: product.price,
                    discount: product.discount + code ? code.discount : 0,
                    coverImg: product.coverImg,
                    slug: product.slug,
                    productName: product.productName,
                    quantity: cartProduct.quantity,
                    addressId,
                    userId,
                }
                orderProducts.push(orderProduct)
            }
            await Order.insertMany(orderProducts)
            await Cart.deleteMany({ _id: { $in: cartProductIds } })
            return res.redirect('/my/ordered')
        }).catch(err => {
            res.status(500).json({ err })
        })
    }
}

module.exports = new CartController