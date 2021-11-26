const Router = require('express').Router()
const MyController = require('../controllers/MyController')
const OrderController = require('../controllers/OrderController')


Router.get('/password-change', MyController.getPasswordChange)

Router.post('/password-change', MyController.verifyPasswordChange)

Router.get('/address', MyController.myAddress)

Router.post('/address', MyController.createAddress)

Router.get('/address/delete/:id', MyController.deleteAddress)

Router.get('/ordered', MyController.ordered)

Router.post('/ordered/review/:orderId', OrderController.reviewOrder)

Router.patch('/ordered/received',OrderController.receivedOrder )


module.exports = Router