const Router = require('express').Router()
const ProductController = require('../controllers/ProductController')
const CodeController = require('../controllers/CodeController')

Router.get('/code', CodeController.storeCode)

Router.get('/code/post', CodeController.getCodePost)

Router.post('/code/save', CodeController.saveCode)

Router.delete('/code/delete/:id', CodeController.deleteCode)

Router.get('/product', ProductController.getStore)

Router.get('/product/pending', ProductController.getPendingProduct)

Router.get('/product/accept/:slug', ProductController.acceptProduct)

Router.get('/product/block/:slug', ProductController.blockProduct)


module.exports = Router
