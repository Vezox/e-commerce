const Router = require('express').Router()
const StoreController = require('../controllers/StoreController')

Router.get('/product/post', StoreController.getPost)

Router.post('/product/post', StoreController.savePost)

Router.get('/product', StoreController.getStore)

Router.get('/product/pending', StoreController.getProductPending)

Router.get('/product/block', StoreController.getProductBlock)

Router.get('/product/edit/:slug', StoreController.getEditProduct)

Router.post('/product/edit/:slug', StoreController.updateProduct)

Router.delete('/product/delete/:id', StoreController.deleteProduct)

Router.get('/statistical', StoreController.getStatistical)

Router.get('/data-statistical', StoreController.getDataStatistical)

Router.get('/ordered/:options', StoreController.getOrder)

Router.patch('/ordered/accept', StoreController.acceptOrder)

Router.patch('/ordered/reject', StoreController.rejectOrder)

module.exports = Router
