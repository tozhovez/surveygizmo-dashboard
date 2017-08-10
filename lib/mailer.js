const nodemailer = require('nodemailer');
const config = require('../config/main');

const transporter = nodemailer.createTransport(config.mail);

module.exports = class Mailer {
  static send(options) {
    return new Promise((resolve, reject) => {
      const mailOptions = {
        from: '"FastTrac" <info@fasttrac.org>',
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          reject(error);
        } else {
          resolve(info);
        }
      });
    });
  }
};
