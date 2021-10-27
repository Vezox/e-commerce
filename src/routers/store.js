const Router = require('express').Router()
const ProductController = require('../controllers/ProductController')

Router.get('/product/post', ProductController.getPost)

Router.post('/product/post', ProductController.savePost)

Router.get('/product', ProductController.getStore)

Router.get('/product/edit/:slug', ProductController.getEditProduct)

Router.patch('/product/edit', ProductController.updateProduct)



module.exports = Router
