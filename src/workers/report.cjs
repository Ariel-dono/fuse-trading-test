/* eslint-disable no-undef */

const { Worker } = require('worker_threads');
const getSettingsDefinition = require("../utils/worker/settings.cjs");
const setUpWorker = require('./behaviors/handler.cjs');
const buildReport = require('./behaviors/report.cjs')

const settings = getSettingsDefinition();

setUpWorker(new Worker('./src/workers/behaviors/scheduler.cjs'), "report", buildReport, settings.reportPeriod);
