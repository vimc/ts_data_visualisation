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
1. Generate completely fake data by running `npm run generate-fake-data private` or `npm run generate-fake-data public` (depending on whether you want to test the private or public app)
1. `npm run build-dev` or `npm run build-dev-watch`
1. `cd out && python -m SimpleHTTPServer` to serve the compiled files.
1. Visit localhost:8000 in your browser to view the app.

Note that the fake data only contains points for years 2014 - 2020 and for the
most recent 3 touchstones.

## Using real data:
This will make development slow, but will give you the most accurate impression
of the app in production.
1. Grab the real data file by downloading the relevant file from the relevant
report on the reporting portal
(`https://montagu.vaccineimpact.org/reports/report/internal-2018-interactive-plotting/XXXXXXXX-XXXXXX-XXXXXXXX`). 
Copy the files to `data/test`.
1. `npm install`
1. `npm run build-dev` or `npm run build-dev-watch`
1. `cd out && python -m SimpleHTTPServer` to serve the compiled files.
1. Visit localhost:8000 in your browser to view the app.

