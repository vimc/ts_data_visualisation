import * as $ from "jquery";
import * as moment from "moment";

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

export function touchstoneFriendly(touchstone: string[] | undefined): string {
  if (!touchstone || touchstone.length === 0) {
    return "";
  }

  const touchstoneName = touchstone[0];

  if (touchstoneName.length < 7) {
    return touchstoneName;
  }

  //Expect string of the form: YYYYMMtype where type is wue or gavi
  const year = touchstoneName.substr(0,4);
  const monthNum = parseInt(touchstoneName.substr(4,2));

  //Bail out and return the string unchanged if cannot parse the month part as numeric
  if (isNaN(monthNum)) {
    return touchstoneName
  } else {
    const month = moment.months(monthNum - 1);
    const type = touchstoneName.substr(6);
    let friendlyType: string;
    switch (type) {
      case("wue"):
        friendlyType = "WUENIC";
        break;
      case("gavi"):
        friendlyType = "OP";
        break;
      default:
        friendlyType = type;
        break;
    }
    return `${month} ${year} ${friendlyType}`;
  }
}
