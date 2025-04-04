/* eslint-disable no-undef */

module.exports = (conn) => {
    conn.run(`CREATE TABLE IF NOT EXISTS PortfolioTransactions (userId TEXT, symbol TEXT, quantity INT, price FLOAT, total FLOAT, transactionDate DATETIME)`);
    conn.run(`CREATE TABLE IF NOT EXISTS PortfolioFailedTransactions (userId TEXT, symbol TEXT, quantity INT, price FLOAT, total FLOAT, transactionDate DATETIME)`);
    conn.run(`CREATE TABLE IF NOT EXISTS AvailableStock (code TEXT PRIMARY KEY, lastUpdated DATETIME, change INT, price FLOAT, name TEXT, sector TEXT, symbol TEXT)`);
}
