const mailer = require('../utils/mailer')
const Account = require('../models/Account')
const createHmac = require('create-hmac')
const jwt = require('jsonwebtoken')

class EmailController {
    forgotPassword(req, res) {
        res.render('mail/forgot-password')
    }
    async sendMail(req, res) {
        try {
            const to = req.body.email
            const account = await Account.findOne({ email: to })
            if (!account) {
                return res.json({ message: 'Email không tồn tại' })
            }
            const subject = 'Xác nhận khôi phục mật khẩu'
            const code = Math.floor(Math.random() * 89999) + 10000
            const html = `<h1>Mã xác nhận khôi phục mật khẩu</h1>
            <p>Mã xác nhận của bạn là: <b>${code}</b>, mã có hiệu lực trong vòng 15 phút kể từ thời điểm tin nhắn này được gửi</p>
            <p>Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này</p>`
            const update = {
                resetCode: code,
                resetCodeExpire: Date.now() + 15 * 60 * 1000,
                resetCodeStatus: false
            }
            await Promise.all([
                mailer.sendMail(to, subject, html),
                Account.updateOne({ email: to }, update)
            ])
            res.json({ status: 'success' })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }

    }

    getVerifyEmail(req, res) {
        res.render('mail/verify-email')
    }

    async verifyEmail(req, res) {
        const { email, code, password } = req.body
        const find = {
            email,
            resetCode: code,
            resetCodeExpire: { $gt: new Date(Date.now()) }, // $gt: lớn hơn
            resetCodeStatus: false
        }
        const hmac = createHmac('sha256', Buffer.from(process.env.HASH_KEY))
        hmac.update(password)
        const newPassword = hmac.digest("hex")
        try {
            const acc = await Account.findOneAndUpdate(find,
                {
                    password: newPassword,
                    resetCode: null,
                    resetCodeExpire: null,
                    resetCodeStatus: true
                }
            )
            if (!acc) {
                return res.json({ status: 'error', message: 'Mã xác nhận không hợp lệ' })
            }
            const token = jwt.sign({ _id: acc._id }, process.env.JWT_TOKEN_SECRET, { expiresIn: '2h' })
            res.cookie('token', token, { httpOnly: true, maxAge: 2 * 60 * 60 * 1000 })
            res.cookie('role', acc.role, { maxAge: 2 * 60 * 60 * 1000 })
            res.json({
                status: 'success',
                firstName: acc.firstName,
                avatar: acc.avatar,
            })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }
}

module.exports = new EmailController