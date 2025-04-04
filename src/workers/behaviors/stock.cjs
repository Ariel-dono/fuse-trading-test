/* eslint-disable no-undef */
const { DuckDBInstance } = require('@duckdb/node-api');
const getSettingsDefinition = require("../../utils/worker/settings.cjs");
const init = require("./initialize.cjs");

const settings = getSettingsDefinition();

const gatherAvailableStock = async (workerName, message) => {
    const instance = await DuckDBInstance.fromCache('trading.db');
    const db = await instance.connect();
    init(db)

    console.log(
        `Received from worker ${workerName}: ${message}`,
        '-- Gathering stock information to avoid availability issues. --'
    )

    const requestConfig = {
        headers: {
            'x-api-key': settings.clientToken,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
    }
    let currentToken = ''
    let pageNumber = 0
    while (currentToken !== undefined) {
        let url = `${settings.clientUrl}${settings.listStockPath}`
        if (currentToken) {
            const queryString = new URLSearchParams({
                'nextToken': currentToken
            }).toString();
            url = `${url}?${queryString}`
        }
        console.log("Request url: ", url)
        const response = await fetch(
            url,
            requestConfig
        );

        if (response.status == 200) {
            const res = await response.json();
            const data = res.data
            pageNumber += 1
            console.log('printing page: ', pageNumber)
            currentToken = data.nextToken
            data.items.forEach(async(priceDefinition) => {
                await db.run(
                    `INSERT INTO AvailableStock VALUES `
                    + `('${priceDefinition.symbol}', '${priceDefinition.lastUpdated}', '${priceDefinition.change}', ${priceDefinition.price}, '${priceDefinition.name}', '${priceDefinition.sector}', '${priceDefinition.symbol}')`
                    + ' ON CONFLICT DO UPDATE SET change = EXCLUDED.change, price = EXCLUDED.price, lastUpdated = EXCLUDED.lastUpdated'
                );
            });
        }
        else {
            currentToken = undefined
            console.log(
                response.status,
                {
                    message: await response.text()
                }
            )
        }
    }
};

module.exports = gatherAvailableStock