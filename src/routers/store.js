const Router = require('express').Router()
const ProductController = require('../controllers/ProductController')
const CodeController = require('../controllers/CodeController')

Router.get('/product/post', ProductController.getPost)

Router.post('/product/post', ProductController.savePost)

Router.get('/product', ProductController.getStore)

Router.get('/product/edit/:slug', ProductController.getEditProduct)

Router.post('/product/edit/:slug', ProductController.updateProduct)

module.exports = Router
