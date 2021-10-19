const Router = require('express').Router()
const ProductController = require('../controllers/ProductController')

Router.get('/post', ProductController.getPost)

Router.post('/post', ProductController.savePost)

Router.get('/store', ProductController.getStore)

Router.get('/edit/:slug', ProductController.getEditProduct)

Router.patch('/edit', ProductController.updateProduct)

Router.get('/details/:slug', ProductController.getDetailsProduct)

module.exports = Router
