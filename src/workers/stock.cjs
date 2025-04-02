/* eslint-disable no-undef */

const { Worker } = require('worker_threads');
const getSettingsDefinition = require("../utils/worker/settings.cjs");
const setUpWorker = require('./behaviors/handler.cjs');
const gatherAvailableStock = require('./behaviors/stock.cjs')

const settings = getSettingsDefinition();

setUpWorker(new Worker('./src/workers/behaviors/scheduler.cjs'), "stockGathering", gatherAvailableStock, settings.stockLoadPeriod);
