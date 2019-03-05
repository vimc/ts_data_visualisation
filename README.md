# ts_data_visualisation
The typescript / knockout implementation of the interactive reporting app.

Compiling this is somewhat complicated as it relies on a large 100+MB data file that we don't want to put into git.

The data set is `201710gavi_summary.rds` from the Montagu report `native-201710gavi-method2`.

To compile this report we need to 
* grab that data file,
* convert it to a JSON file,
* prepend the file with `const impactData = ` and turn the file into a javascript file
* move the `.js` into `data/`.

A simple R script to create this file is:
```
temp_data <- readRDS("201710gavi_summary.rds")

# save the impact data a json file
jsonlite::write_json(temp_data, "temporary.json", pretty = TRUE, na = "string")

# we need the json file to be a javascript file
# prepended with 'const impactdata = '
system("echo 'const impactData = ' > impactData.js")
system("cat temporary.json >> impactData.js")

# remove the json file
file.remove("temporary.json")
```

# Local development

## Quick start:
This method is ideal for UI development where the data does not matter at all.
1. Generate completely fake data by running `npm run generate-fake-data`
2. `npm run build-dev` or `npm run-build-dev-watch`
3. open `out/index.html` in a browser to view the compiled app.

Note that the fake data only contains points for years 2014 - 2020 and for the most 
recent 3 touchstones.

## Using realistic data:
Useful if you want data that resembles the real data set, but still want
local development to be a bit quicker.
1. Grab the real data set by downloading the relevant artefact from the
reporting portal and copying it into this repo's `data` directory.
2. `./scripts/thinData`.
3. `npm run build-dev` or `npm run-build-dev-watch`
4. open `out/index.html` in a browser to view the compiled app

## Using real data:
This will make development slow, but will give you the most accurate impression
of the app in production.
1. Grab the real data set as above but this time put it straight into `data/test`.
3. `npm run build-dev` or `npm run-build-dev-watch`
4. open `out/index.html` in a browser to view the compiled app

## TODO list
* Make the text in the UI more human readable
* Sort out missing colours
* Add functionality to compare across touchstones
* Better automated titles
* Redraw after every UI input
* Make the country checkbox interface nicer
### Added after meeting with funders
* Redesign the filter options for disease/vaccine/activity
    * Diease
        * vaccine 1
            * campaign
            * routine
        * vaccine 2
            * campaign
        * vaccine 3
            * routine
* OPTIONAL Do the same thing for continents/countries/regions
* On time series add labels next to curves (instead of legend)
* Allow user to set their own colours
* Replace Gavi69 (Gavi73 - PINE) with gavi68
* BUG Title doesn't change on click
* Organise legend order to reflect groupngs
* Hover label show counties and rounded numbers
* Put meta-data on plot / on screen (only list first N when manhy options are chosen)
* Add meta-data when saving plot/csv
* Provide a warning message when there is no data
* Hover over explaining metrics
