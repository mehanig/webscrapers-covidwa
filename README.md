# Basic scraper for COVID19 from Shoreline Clinic and Holly Park Clinic

## How to run:

1) create `local.settings.json` with

```
{
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "API_SECRET": "<your secret>"
  },
  "IsEncrypted": false
}
```

2)  run `npm run start`
