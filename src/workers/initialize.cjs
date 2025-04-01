module.exports = (conn) => {
    conn.run(`CREATE TABLE IF NOT EXISTS PortfolioTransactions (userId TEXT, symbol TEXT, quantity INT, price FLOAT, total FLOAT)`);
    conn.run(`CREATE TABLE IF NOT EXISTS PortfolioFailedTransactions (userId TEXT, symbol TEXT, quantity INT, price FLOAT, total FLOAT)`);
    conn.run(`CREATE TABLE IF NOT EXISTS AvailableStock (code TEXT PRIMARY KEY, lastUpdated DATE, change INT, price FLOAT, name TEXT, sector TEXT, symbol TEXT)`);
}
