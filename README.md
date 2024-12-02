# ts_data_visualisation

[![Build Status](https://travis-ci.org/vimc/ts_data_visualisation.svg?branch=master )](https://travis-ci.org/vimc/ts_data_visualisation)
[![codecov.io](https://codecov.io/github/vimc/ts_data_visualisation/coverage.svg?branch=master)](https://codecov.io/github/vimc/ts_data_visualisation?branch=master)

The typescript / knockout implementation of the interactive reporting app.

Compiling this is somewhat complicated as it relies on a multiple large data
files that we don't want to put into git.

The data file are `interim-update-201907wue_summary.rds` from the Montagu report
`modup2-201907` and, `life_time_impact.rds` and `cross_sectional_impact.rds`
from `internal-2018-201710gavi-impact-estimates`.

In addition to the data files we also need some _dictionary_ files containing
_e.g._ country and vaccine names.

The process of creating these files for the app is carried out in the montagu
report `internal-2018-interactive-plotting`.

# Local development

## Quick start:
This method is ideal for UI development where the data does not matter at all.
1. `npm install`
1. Generate completely fake data by running one of:
`npm run generate-fake-data [MODE]` where `[MODE]` is one of:
- `private` - the old private (Funders') tool
- `public` - the public tool for the first paper
- `paper2` - the public tool for the second paper
- `interim` - the private (Funders') tool for interim updates 
 
1. `npm run build-dev` or `npm run build-dev-watch`
1. `cd out && python3 -m http.server` to serve the compiled files.
1. Visit localhost:8000 in your browser to view the app.

Note that the fake data only contains points for the most recent 3 touchstones.

## Using real data:
This will make development slow, but will give you the most accurate impression
of the app in production.
1. Grab the real data file by downloading the relevant file from the relevant
report on the reporting portal
(`https://montagu.vaccineimpact.org/reports/report/internal-2018-interactive-plotting/XXXXXXXX-XXXXXX-XXXXXXXX`). 
Copy the files to `data/test`.
1. `npm install`
1. `npm run build-dev` or `npm run build-dev-watch`
1. `cd out && python3 -m http.server` to serve the compiled files.
1. Visit localhost:8000 in your browser to view the app.

## Testing
To run tests with coverage, run `npm run coverage`.

# Deployment

To deploy the internal app:

1. Make sure the [report dependencies](https://github.com/vimc/montagu-reports/blob/master/src/internal-2018-interactive-plotting/orderly.yml#L88) 
are up to date (these provide all the data that is displayed in the app)
2. Run the report `internal-2018-interactive-plotting`

To deploy the public app:

The public app depends on the internal one, so follow the above instructions to make sure it is up to date and additionally:
3. Make sure its other [report dependencies](https://github.com/vimc/montagu-reports/blob/master/src/paper-first-public-app/orderly.yml#L54) 
are up to date, as these provide the burden estimates displayed in the public app
4. Run the report `paper-first-public-app`

To deploy the paper 2 app:
1. Make sure the [report dependencies](https://github.com/vimc/montagu-reports/blob/master/src/paper-second-public-app/orderly.yml) 
are up to date (these provide all the data that is displayed in the app)
2. Run the report `paper-second-public-app`

To deploy the interim update app:
1. Make sure the [report dependencies](https://github.com/vimc/montagu-reports/blob/vimc-4849/src/interim-update-app/orderly.yml) are up to date (these provide all the data that is displayed in the app)
2. Run the report `interim-update-app`