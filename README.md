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
For running locally, you will need to create a top level sub-directory called `data` and
populate it with a file called `impactData.js`, generated as described above, and another one
called `reportInfo.js` containing a dictionary of 3 objects in the format:

```
const reportInfo =
{"rep_id":["20180713-111821-4b65b50b"],
"dep_id":["20180521-105151-275bd2ac"],
"git_id":["c1b586e18beed4a3a2d4c27830ae3a40a072e59e"]}
```

These 2 files can be most easily obtained by downloading the compiled app and copying
them in to your local `data` directory.

Then run `npm run build` and open `out/index.html` in a browser to view the app locally.

## TODO list
* Make the text in the UI more human readable
* Add total labels to the top of each bar
* Add a loading screen
* Sort out missing colours
* Add functionality to compare across touchstones
* Implement the cumulative plot
* Better automated titles
* When comparing years allow line plots
* Redraw after every UI input
* Make the country checkbox interface nicer
