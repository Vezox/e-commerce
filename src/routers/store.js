const Router = require('express').Router()
const ProductController = require('../controllers/ProductController')
const OrderController = require('../controllers/OrderController')

Router.get('/product/post', ProductController.getPost)

Router.post('/product/post', ProductController.savePost)

Router.get('/product', ProductController.getStore)

Router.get('/product/pending', ProductController.getProductPending)

Router.get('/product/block', ProductController.getProductBlock)

Router.get('/product/edit/:slug', ProductController.getEditProduct)

Router.post('/product/edit/:slug', ProductController.updateProduct)

Router.get('/ordered', OrderController.getOrder)

module.exports = Router
