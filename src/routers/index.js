const siteRouter = require('./site')
const storeRouter = require('./store')
const authRouter = require('./auth')
const cartRouter = require('./cart')
const checkAuth = require('../middleware/checkAuth')


module.exports = app => {

    app.use('/', siteRouter)

    app.use('/auth', authRouter)

    app.use('/store',checkAuth.checkUser, storeRouter)

    app.use('/cart',checkAuth.checkUser, cartRouter)
}