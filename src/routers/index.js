const siteRouter = require('./site')
const storeRouter = require('./store')
const authRouter = require('./auth')
const cartRouter = require('./cart')
const orderRouter = require('./order')
const checkAuth = require('../middleware/checkAuth')
const adminRouter = require('./admin')
const myRouter = require('./my')


module.exports = app => {

    app.use('/', siteRouter)

    app.use('/auth', authRouter)

    app.use('/store',checkAuth.checkUser, storeRouter)

    app.use('/cart',checkAuth.checkUser, cartRouter)

    app.use('/ordered',checkAuth.checkUser, orderRouter)

    app.use('/admin', checkAuth.checkAdmin, adminRouter)

    app.use('/my',checkAuth.checkUser, myRouter)

    app.use((req, res) => {
        res.status(404).render('404')
    })
}