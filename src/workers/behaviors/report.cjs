/* eslint-disable no-undef */

const nodemailer = require('nodemailer');
const getSettingsDefinition = require("../../utils/worker/settings.cjs");

const settings = getSettingsDefinition();

const buildReport = async (workerName, message) => {
    console.log(
        `Received from worker ${workerName}: ${message}`,
        '-- Building a new Stock Operations Report. --'
    );
    // Building report message
    let recipientsList = []
    if (settings.recipients !== "") {
        recipientsList = settings.recipients.split(",")
    }

    if (recipientsList.length > 0) {
        const transporter = nodemailer.createTransport({
            host: settings.emailClientServer, 
            port: 465, 
            auth: {
                user: settings.emailClientUser, 
                pass: settings.emailClientToken
            }
        });

        // Email options
        const mailOptions = {
            from: settings.reference,
            to: recipientsList,
            subject: 'Daily Transactions Report', 
            text: "Hello, this is a test email!", 
            html: "<b>Hello, this is a test email!</b>" 
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log("Error:", error);
            }
            console.log("Email sent:", info.response);
        });
    }
}

module.exports = buildReport