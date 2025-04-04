/* eslint-disable no-undef */

module.exports = (worker, workerName, gatherData, frequency) => {
    worker.on('message', async (message) => {
        await gatherData(workerName, message)
    });

    worker.on('error', (error) => {
        console.error('Worker error:', error);
    });

    worker.on('exit', (code) => {
        if (code !== 0) {
            console.error(`Worker stopped with exit code ${code}`);
        }
    });

    console.log('Set the schedule for worker:', workerName)
    worker.postMessage(frequency)
}