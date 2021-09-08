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

export function touchstoneFriendly(touchstone: string[]): string {
  if (touchstone.length === 0 || touchstone[0].length < 7) {
    return "";
  }

  const touchstoneName = touchstone[0];

  //Expect string of the form: YYYYMMtype where type is wue or gavi
  const year = touchstoneName.substr(0,4);
  const monthNum = touchstoneName.substr(4,2);
  console.log("monthNum: " + monthNum)
  const month = Intl.DateTimeFormat('en', { month: 'long' }).format(parseInt(monthNum)); //TODO: this doesn't work, use moment instead
  let type: string;
  switch(touchstoneName.substr(6)) {
    case("wue"):
      type = "WUENIC";
      break;
    case("gavi"):
      type = "OP";
      break;
    default:
      type = "";
      break;
  }
  const result = `${month} ${year} ${type}`;
  console.log("friendly ts: " + result);
  return result;
}
