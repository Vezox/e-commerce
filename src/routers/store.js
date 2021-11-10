const Router = require('express').Router()
const ProductController = require('../controllers/ProductController')
const CodeController = require('../controllers/CodeController')

Router.get('/product/post', ProductController.getPost)

Router.post('/product/post', ProductController.savePost)

Router.get('/product', ProductController.getStore)

Router.get('/product/edit/:slug', ProductController.getEditProduct)

Router.post('/product/edit/:slug', ProductController.updateProduct)

Router.get('/code', CodeController.storeCode)

Router.get('/code/post', CodeController.getCodePost)

Router.post('/code/save', CodeController.saveCode)

Router.delete('/code/delete', CodeController.deleteCode)

module.exports = Router
