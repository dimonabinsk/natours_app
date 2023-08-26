const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) Создать транспортёр
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  // 2) Определить параметры почты
  const emailOptions = {
    from: '"Natours app" <dimonabinsk@yandex.ru>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };
  // 3) Отправить письмо с помощью nodemailer
  await transporter.sendMail(emailOptions);
};

module.exports = sendEmail;
