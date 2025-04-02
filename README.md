```
Fuse trading test API guideline:
```
lint: npm run lint
format: npm run format
test (run unit tests): npm run test
coverage (run unit tests coverage): npm run coverage
run locally: 
1. set environment variable for to set the authentication token
Note: this should be stored in a Vault Secret Service
export AUTH_TOKEN=<new-token>
export CLIENT_TOKEN=<api-key>
export EMAIL_CLIENT_TOKEN=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
2. edit the .env file as you need.
    includes:
        - CLIENT_URL: remote stock broker service url
        - LIST_STOCK_PATH
        - PURCHASE_STOCK_PATH
        - STOCK_LOAD_PERIOD: stock data refresh schedule
        - REPORT_PERIOD: report schedule
        - RECIPIENTS (works better with gmail or custom domains)
        - REFERENCE (from and reply-to)
        - EMAIL_CLIENT_USER
        - EMAIL_CLIENT_SERVER
2. run the service:
npm run dev
After initialize the service wait until the startup process is finished, it looks like:
mandelbrot@pop-os:~/workspace/tests/fuse-trading-test$ npm run dev

> dev
> tsx watch src/index.ts

Set the schedule for worker: report
Set the schedule for worker: stockGathering
Received from worker stockGathering: start-up -- Gathering stock information to avoid availability issues. --
https://api.challenge.fusefinance.com/stocks
Scheduled each: * * * * *
Scheduled each: */5 * * * *
printing page:  1
https://api.challenge.fusefinance.com/stocks?nextToken=eyJzeW1ib2wiOiJDU0NPIn0%3D
printing page:  2
https://api.challenge.fusefinance.com/stocks?nextToken=eyJzeW1ib2wiOiJIRCJ9
printing page:  3
https://api.challenge.fusefinance.com/stocks?nextToken=eyJzeW1ib2wiOiJNUyJ9
printing page:  4
https://api.challenge.fusefinance.com/stocks?nextToken=eyJzeW1ib2wiOiJNU0ZUIn0%3D
printing page:  5

```
open docs http://localhost:3000/ui
```

Future steps:
1- observability.
2- scale the implementation on the go.