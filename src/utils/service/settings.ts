import "dotenv/config";

export const getSettingsDefinition = () => ({
  // manual variable in OS
  authToken: process.env.AUTH_TOKEN,
  clientToken: process.env.CLIENT_TOKEN,
  // loaded from a .env file
  clientUrl: process.env.CLIENT_URL,
  purchaseStockPath: process.env.PURCHASE_STOCK_PATH,
});
