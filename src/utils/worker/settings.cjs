/* eslint-disable no-undef */

require("dotenv/config");

module.exports = () => ({
  // manual variable in OS
  clientToken: process.env.CLIENT_TOKEN,
  emailClientToken: process.env.EMAIL_CLIENT_TOKEN ?? "",
  // loaded from a .env file
  emailClientUser: process.env.EMAIL_CLIENT_USER ?? "",
  emailClientServer: process.env.EMAIL_CLIENT_SERVER ?? "",
  clientUrl: process.env.CLIENT_URL ?? "",
  listStockPath: process.env.LIST_STOCK_PATH ?? "",
  stockLoadPeriod: process.env.STOCK_LOAD_PERIOD ?? "* * * * *",
  reportPeriod: process.env.REPORT_PERIOD ?? "* * * * *",
  recipients: process.env.RECIPIENTS ?? "",
  reference: process.env.REFERENCE ?? "",
});
