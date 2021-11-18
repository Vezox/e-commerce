const mongoose = require('mongoose')

async function connect() {
    try {
        await mongoose.connect('mongodb+srv://admin:vezox@cluster0.xqgwo.mongodb.net/LazaPee',
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        )
        console.log('Connect Successfully')
    } catch (error) {
        console.log(error)
    }
}

module.exports = { connect }