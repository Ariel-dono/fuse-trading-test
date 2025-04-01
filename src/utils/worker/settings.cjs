require("dotenv/config");

module.exports = () => ({
  // manual variable in OS
  clientToken: process.env.CLIENT_TOKEN,
  // loaded from a .env file
  clientUrl: process.env.CLIENT_URL,
  listStockPath: process.env.LIST_STOCK_PATH,
  stockLoadPeriod: process.env.STOCK_LOAD_PERIOD,
  reportPeriod: process.env.REPORT_PERIOD,
});
