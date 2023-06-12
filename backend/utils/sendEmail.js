const nodeMailer = require('nodemailer');

/**
 * Send an email using Nodemailer.
 *
 * @param {Object} options - The options for sending the email.
 * @param {string} options.email - The recipient's email address.
 * @param {string} options.subject - The subject of the email.
 * @param {string} options.message - The plain text message of the email.
 * @param {string} options.html - The HTML content of the email.
 * @returns {Promise<void>} - A Promise that resolves after the email is sent.
 */
const sendEmail = async (options)=>{

    const transporter = nodeMailer.createTransport({
        host:process.env.SMPT_HOST,
        port:465,
        service:process.env.SMPT_SERVICE,
        auth:{
            user:process.env.SMPT_MAIL,
            pass:process.env.SMPT_PASSWORD,
        }
    })

const mailOptions =  {
    from:"",
    to:options.email,
    subject:options.subject,
    text:options.message,
    html:options.html
}

await transporter.sendMail(mailOptions)

}

module.exports = sendEmail;