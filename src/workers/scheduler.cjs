const { parentPort } = require('worker_threads');
const cron = require('node-cron');

function runCronJob() {
    const timestamp = new Date().toISOString();
    parentPort.postMessage(`Cron job executed at ${timestamp}`);
}

parentPort.on('message', (frequency)=>{
    console.log('Scheduled each:', frequency)
    cron.schedule(frequency, runCronJob);
})