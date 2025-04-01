const setUpWorker = require('./handler.cjs');
const { Worker } = require('worker_threads');
const getSettingsDefinition = require("../utils/worker/settings.cjs");

const settings = getSettingsDefinition();


const buildReport = async (workerName, message) => {
    console.log(
        `Received from worker ${workerName}: ${message}`,
        '-- Building a new Stock Operations Report. --'
    );
    // Building report message
}

setUpWorker(new Worker('./src/workers/scheduler.cjs'), "report", buildReport, settings.reportPeriod);
