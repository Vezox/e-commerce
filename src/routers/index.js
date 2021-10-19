const siteRouter = require('./site')
const productRouter = require('./product')

module.exports = app => {
    app.use('/', siteRouter)

    app.use('/product', productRouter)
}