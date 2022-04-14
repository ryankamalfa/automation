const nodemailer = require("nodemailer");
const arango = require('../config/database');


const sendAutomationStatusEmail = async (body) => {
  let smtp_config = await arango.query(`
      For x in script_settings
      Filter x.type == 'config'
      return x.smtp
    `);
  let smtp_config_data = await smtp_config.all();

  const transporter = nodemailer.createTransport({
    host: smtp_config_data[0].host,
    service: smtp_config_data[0].service,
    port: smtp_config_data[0].port,
    secure: true,
    auth: {
      user: smtp_config_data[0].username,
      pass: smtp_config_data[0].password,
    },
  });

  transporter.verify(function (err, success) {
    if (err) {
      console.log(err.message);
    } else {
      console.log('Server is ready to take our messages');
    }
  });

  transporter.sendMail(body, (err, data) => {
    if (err) {
      console.log(`Error happen when sending automation status email ${err.message}`);
    } else {
      console.log('Automation status email is sent :)');
    }
  });
};

module.exports = sendAutomationStatusEmail;