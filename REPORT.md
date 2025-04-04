Considerations:
- In order to handle the availability of the stock service all stock data is loaded from the original service by a cronjob with a configurable schedule.
- Cronjobs triggering workerthread to make it easy to scale the solution just by a small refactor in worker to follow a cloud native approach if needed.
- Sendgrid as email relay platform has a good free tier and is user friendly.
- API depending on a local db to avoid service interruptions.
- The endpoint to buy stock is still depending directly on the remote trading service but it can be prestaged in a new cronjob retrying failed transactions.

Blueprint:

https://drive.google.com/file/d/14c9DFeqipKTLx8FIoCuPcpcgj-odJ4Yj/view?usp=drive_link

