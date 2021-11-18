const siteRouter = require('./site')
const storeRouter = require('./store')
const authRouter = require('./auth')
const cartRouter = require('./cart')
const checkOutRouter = require('./checkout')
const checkAuth = require('../middleware/checkAuth')
const adminRouter = require('./admin')
const myRouter = require('./my')


module.exports = app => {

    app.use('/', siteRouter)

    app.use('/auth', authRouter)

    app.use('/store',checkAuth.checkUser, storeRouter)

    app.use('/cart',checkAuth.checkUser, cartRouter)

    app.use('/checkout',checkAuth.checkUser, checkOutRouter)

    app.use('/admin', checkAuth.checkAdmin, adminRouter)

    app.use('/my',checkAuth.checkUser, myRouter)
}