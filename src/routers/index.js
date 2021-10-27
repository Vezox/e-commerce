const siteRouter = require('./site')
const storeRouter = require('./store')
const authRouter = require('./auth')

module.exports = app => {
    app.use('/', siteRouter)

    app.use('/auth', authRouter)

    app.use('/my/store', storeRouter)

}