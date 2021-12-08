const Router = require('express').Router()
const MyController = require('../controllers/MyController')

Router.get('/address', MyController.myAddress)

Router.post('/address', MyController.createAddress)

Router.get('/address/delete/:id', MyController.deleteAddress)

Router.get('/ordered/:option', MyController.ordered)

Router.patch('/ordered/received',MyController.receivedOrder )

Router.post('/ordered/review/:orderId', MyController.reviewOrder)


module.exports = Router