const siteRouter = require('./site')
const storeRouter = require('./store')
const authRouter = require('./auth')
const cartRouter = require('./cart')
const checkAuth = require('../middleware/checkAuth')
const adminRouter = require('./admin')
const myRouter = require('./my')
const mailRouter = require('./mail')


module.exports = app => {

    app.use('/', siteRouter)

    app.use('/auth', authRouter)

    app.use('/store',checkAuth.checkUser, storeRouter)

    app.use('/cart',checkAuth.checkUser, cartRouter)

    app.use('/admin', checkAuth.checkAdmin, adminRouter)

    app.use('/my',checkAuth.checkUser, myRouter)

    app.use('/mail', mailRouter)

    app.use((req, res) => {
        res.status(404).render('404')
    })
}