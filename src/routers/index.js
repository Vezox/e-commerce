const siteRouter = require('./site')
const storeRouter = require('./store')
const authRouter = require('./auth')
const cartRouter = require('./cart')
const checkAuth = require('../middleware/checkAuth')


module.exports = app => {

    app.use('/', siteRouter)

    app.use('/auth', authRouter)

    app.use('/my/store',checkAuth.checkUser, storeRouter)

    app.use('/my/cart',checkAuth.checkUser, cartRouter)
}