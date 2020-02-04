/**
  * The funtions in this file handle the logic around reading data files into
  * memory. Since the data files can be very large they can take a noticably
  * long time to load. So we took the decision to split the files into smaller
  * chunks and only load them when necessary.
  *
  * To do this we use an array of DataSets which allows us the filter the data
  * along two axes 'name' and 'touchstone'.
  * Each Dataset corresponds to a single name, currently we use this separation
  * for each counting method (cohort, cross sectional, year of vaccination)
  * [the `name` label could be changed to `method`].
  * Within each Dataset we keep a list of subsets we have loaded into that
  * dataset. This means we only have load a subset of data for each method at
  * any tim. We also have a list of which subsets are currently relevant.
  *
  * A DataSet with a given must exist before appending to it.
  *
  * The data is stored in json files that !must! have the filename format
  *
  *                     "./PREFIX_SUBSET_NAME.json";
  *
  * e.g. impactData_201310gavi-201907wue_cross.json
  * or
  * firstPaper_1_cohort.json
  */

import * as $ from "jquery";
import {ImpactDataRow} from "./ImpactDataRow";
import {loadObjectFromJSONFile} from "./Utils";

/**
  * This object is a the data for a given name
  * @interface
  */
export interface DataSet {
  /**
    * The name of the DataSet - we only use this for the counting method at the
     moment (cohort, cross sectional, year of vaccination)
    * @abstract
    */
  name: string;
  /**
    * The Data
    * @abstract
    */
  data: ImpactDataRow[];
  /**
    * A list of the subsets of data we have already appended to data
    * @abstract
    */
  seen: string[];
  /**
    * A list of the subsets of data are currently relevant
    * @abstract
    */
  selected: string[];
}


/**
  * A wrapper around the dataSets['name'] logic. 
  *
  * @remarks Was used during development to produce meaningful error messages 
  * and to allow the app to continue if data is missing. Probably is no longer
  * relevant, but a hassle to remove.
  *
  *
  * @param name - Name of the DataSet we want
  * @param sets - The array of DataSets
  * @returns The relevant dataset
  */
export function getDataSet(name: string,
                           sets: DataSet[]): DataSet {
  const ds = sets.find((x) => x.name === name);
  if (ds === undefined) {
    console.log("No dataset named " + name);
    return null;
  }
  return ds;
}

/**
  * Appends data to an !existing! DataSet. If the DataSet does not exist, we do
  * nothing and return null. This function will read data from disc with an Ajax
  * call.
  *
  *
  * @param toAdd - Name of the subsets that want to add we want
  * @param prefix - A user-defined prefix (only used to differentiate data files)
  * @param appendTo - The name of DataSet we want to append to
  * @param dataSets - The array of DataSet
  * @param updateSelected - Set the selected subsets to the sets we just appended
  *
  * @returns The relevant dataset
  */
export function appendToDataSet(toAdd: string[],
                                prefix: string,
                                appendTo: string,
                                dataSets: DataSet[],
                                updateSelected: boolean = false) {
  const ds = getDataSet(appendTo, dataSets);
  if (ds === null) {
    return;
  }
  // for each selected subset...
  for (const subset of toAdd) {
    // ...check if we've already added this data set...
    if (ds.seen.indexOf(subset) === -1) {
      // ...if not add it
      // WARNING This file must exactly match the path below including being
      // being in same directory
      const filename = "./" + prefix + "_" + subset + "_" + appendTo + ".json";
      const newData: ImpactDataRow[] =
          loadObjectFromJSONFile(filename);

      ds.data = ds.data.concat(newData);
      ds.seen.push(subset);
    }
  }

  if (updateSelected) {
    ds.selected = toAdd;
  }
}
