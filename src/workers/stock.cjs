const setUpWorker = require('./handler.cjs');
const { Worker } = require('worker_threads');
const getSettingsDefinition = require("../utils/worker/settings.cjs");
const init = require("./initialize.cjs");

const { DuckDBInstance } = require('@duckdb/node-api');

const settings = getSettingsDefinition();

const gatherAvailableStock = async (workerName, message) => {
    const instance = await DuckDBInstance.create('trading.db');
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
            data = new URLSearchParams({
                'nextToken': currentToken
            }).toString();
            url = `${url}?${data}`
        }
        console.log(url)
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
            data.items.forEach(priceDefinition => {
                db.run(
                    `INSERT INTO AvailableStock VALUES `
                    + `('${priceDefinition.lastUpdated}:${priceDefinition.symbol}', '${priceDefinition.lastUpdated}', '${priceDefinition.change}', ${priceDefinition.price}, '${priceDefinition.name}', '${priceDefinition.sector}', '${priceDefinition.symbol}')`
                    + ' ON CONFLICT DO UPDATE SET change = EXCLUDED.change, price  = EXCLUDED.price'
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

setUpWorker(new Worker('./src/workers/scheduler.cjs'), "stockGathering", gatherAvailableStock, settings.stockLoadPeriod);
