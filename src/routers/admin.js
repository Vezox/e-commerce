const Router = require('express').Router()
const AdminController = require('../controllers/AdminController')
const CodeController = require('../controllers/CodeController')

Router.get('/code', CodeController.storeCode)

Router.get('/code/post', CodeController.getCodePost)

Router.post('/code/save', CodeController.saveCode)

Router.delete('/code/delete/:id', CodeController.deleteCode)

Router.get('/product', AdminController.getAllProduct)

Router.get('/product/pending', AdminController.getPendingProduct)

Router.get('/product/accept/:slug', AdminController.acceptProduct)

Router.get('/product/block/:slug', AdminController.blockProduct)


module.exports = Router
