const nodeMailer = require('nodemailer')


 const sendMail = (to, subject, htmlContent) => {
   // Khởi tạo một thằng transporter object sử dụng chuẩn giao thức truyền tải SMTP với các thông tin cấu hình ở trên.
   const transporter = nodeMailer.createTransport({
     host: process.env.MAIL_HOST,
     port: process.env.MAIL_PORT,
     secure: true, // nếu các bạn dùng port 465 (smtps) thì để true, còn lại hãy để false cho tất cả các port khác
     auth: {
       user: process.env.ADMIN_MAIL,
       pass: process.env.ADMIN_PASS
     }
   })
 
   const options = {
     from: process.env.ADMIN_MAIL,
     to: to,
     subject: subject, 
     html: htmlContent 
   }
 
   // hàm transporter.sendMail() này sẽ trả về cho chúng ta một Promise
   return transporter.sendMail(options)
 }
 
 module.exports = {
   sendMail: sendMail
 }