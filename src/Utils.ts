import * as $ from "jquery";

export function loadObjectFromJSONFile(path: string): any {
  let newData: {[code: string]: string[]} = {}; // fail safe in case the file can't be read
  $.ajax({
    async: false,
    contentType: "application/json",
    data: { request: "", target: "arrange_url", method: "method_target" },
    dataType: "JSON",
    global: false,
    success(data) {
      newData = data;
      return;
    },
    error(jqXHR, text, errorThrown) {
      console.log(jqXHR + " " + text + " " + errorThrown + "[" + path + "]");
    },
    type: "GET",
    url: path,
  });
  return newData;
}

export interface ParseDict {
  [key: string]: string;
}

export function parseIntoDictionary(arrOfObjects: ParseDict[], lhs: string,
                                    rhs: string): any {
  const outDict: any = {};
  for (const e of arrOfObjects) {
    const key = e[lhs];
    const value = e[rhs];
    outDict[key] = value;
  }
  return outDict;
}
