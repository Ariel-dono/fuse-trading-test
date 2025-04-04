/* eslint-disable no-undef */
const { DuckDBInstance } = require('@duckdb/node-api');

const nodemailer = require('nodemailer');
const getSettingsDefinition = require("../../utils/worker/settings.cjs");
const init = require("./initialize.cjs");
const { DateTime } = require("luxon");

const settings = getSettingsDefinition();

function buildReportMessage(successfulTransactions, failedTransactions) {
    let message = ""
    if (successfulTransactions.length > 0){
        message = "Successful Transactions:<br />"
        successfulTransactions.forEach((transaction)=>{
            message+=`${JSON.stringify(transaction)}<br />`.replaceAll("{", "").replaceAll("}", "")
        })
    }
    if (failedTransactions.length > 0){
        message = "Failed Transactions:<br />"
        failedTransactions.forEach((transaction)=>{
            message+=`${JSON.stringify(transaction)}<br />`.replaceAll("{", "").replaceAll("}", "")
        })
    }
    return message
}

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
        const instance = await DuckDBInstance.fromCache('trading.db');
        const db = await instance.connect();
        init(db)

        const readerSuccessfulTransactions = await db.runAndReadAll(
            "SELECT * from PortfolioTransactions"
            + ` where transactionDate>'${DateTime.utc().toFormat('y-MM-dd')}'`
        );
        const readerFailedTransactions = await db.runAndReadAll(
            "SELECT * from PortfolioFailedTransactions"
            + ` where transactionDate>'${DateTime.utc().toFormat('y-MM-dd')}'`
        );
        const rowsSuccessfulTransactions = readerSuccessfulTransactions.getRowObjectsJson();
        const rowsFailedTransactions = readerFailedTransactions.getRowObjectsJson();

        console.log(DateTime.utc().toFormat('y-MM-dd'), "<->",DateTime.now().toFormat('y-MM-dd'))
        console.log("Failed transactions: ", rowsFailedTransactions.length)
        console.log("Successful transactions: ", rowsSuccessfulTransactions.length)

        if (rowsSuccessfulTransactions.length > 0 || rowsFailedTransactions.length > 0) {
            const message = buildReportMessage(rowsSuccessfulTransactions, rowsFailedTransactions)

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
                text: message,
                html: `<b>${message}</b>`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log("Error:", error);
                }
                console.log("Email sent:", info.response);
            });
        }
    }
}

module.exports = buildReport