// This is not const as we might append colours to it at run time
export let plotColours: { [vaccine: string]: string } = {
  "none":    "#0000C0",
  // disease / vaccine colours
  "HPV":     "#BEBADA",
  "HepB":    "#8DD3C7",
  "HepB_BD": "#466963",
  "Hib":     "#bdb76b",
  "Hib3":    "#FB8072",
  "JE":      "#654321",
  "MCV1":    "#80B1D3",
  "MCV2":    "#597b93",
  "Measles": "#0B588E",
  "MenA":    "#FDB462",
  "PCV":     "#d6604d",
  "PCV3":    "#B3DE69",
  "RCV2":    "#a051d6",
  "Rota":    "#FCCDE5",
  "Rubella": "#D9D9D9",
  "YF":      "#BC80BD",
  "All Diseases": "#379CC8",
  // years
  "2000":    "#0000C0",
  "2001":    "#0400BB",
  "2002":    "#0900B6",
  "2003":    "#0E00B1",
  "2004":    "#1300AC",
  "2005":    "#1800A8",
  "2006":    "#1C00A3",
  "2007":    "#21009E",
  "2008":    "#260099",
  "2009":    "#2B0094",
  "2010":    "#300090",
  "2011":    "#34008B",
  "2012":    "#390086",
  "2013":    "#3E0081",
  "2014":    "#43007C",
  "2015":    "#480078",
  "2016":    "#4C0073",
  "2017":    "#51006E",
  "2018":    "#560069",
  "2019":    "#5B0064",
  "2020":    "#600060",
  "2021":    "#64005B",
  "2022":    "#690056",
  "2023":    "#6E0051",
  "2024":    "#73004C",
  "2025":    "#780048",
  "2026":    "#7C0043",
  "2027":    "#81003E",
  "2028":    "#860039",
  "2029":    "#8B0034",
  "2030":    "#900030",
  "2031":    "#94002B",
  "2032":    "#990026",
  "2033":    "#9E0021",
  "2034":    "#A3001C",
  "2035":    "#A80018",
  "2036":    "#AC0013",
  "2037":    "#B1000E",
  "2038":    "#B60009",
  "2039":    "#BB0004",
  "2040":    "#C00000",
  // activity
  "routine":  "#2cac2d",
  "campaign": "#AC1A68",
  "combined": "#002366",
  // continents
  "Africa":   "#006633",
  "Americas": "#8B0000",
  "Asia":     "#FF8C00",
  "Europe":   "#003399",
  "Oceania":  "#a267ff",
  // gavi cofin status
  "ATP": "#90ee90",
  "ISF": "#ffd700",
  "PTP": "#8B0000",
  // regions
  "Southern Asia":      "#FF8C00",
  "Middle Africa":      "#00873a",
  "Western Asia":       "#cb7400",
  "Eastern Africa":     "#00b855",
  "Western Africa":     "#00db6e",
  "South America":      "#8B0000",
  "Caribbean":          "#e60000",
  "Central America":    "#c30000",
  "South-Eastern Asia": "#e37d00",
  "Central Asia":       "#ba7900",
  "Micronesia":         "#E0FFFF",
  "Southern Africa":    "#006633",
  "Eastern Europe":     "#003399",
  "Eastern Asia":       "#f08a00",
  "Melanesia":          "#98a6a6",
  "Northern Africa":    "#00ff81",
  "Polynesia":          "#bfdcdc",
  "Southern Europe":    "#0047d8",
  // countries
  "AFG": "#cc7000", // ASIA
  "AGO": "#005128", // AFRICA
  "ALB": "#325bad", // EUROPE
  "ARM": "#ffa332", // ASIA
  "AZE": "#995400", // ASIA
  "BDI": "#32845b", // AFRICA
  "BEN": "#003d1e", // AFRICA
  "BFA": "#66a384", // AFRICA
  "BGD": "#ffba66", // ASIA
  "BIH": "#00287a", // EUROPE
  "BLZ": "#6f0000", // AMERICAS
  "BOL": "#a23232", // AMERICAS
  "BTN": "#cc7000", // ASIA
  "CAF": "#005128", // AFRICA
  "CHN": "#636db1", // CHINA
  "CIV": "#32845b", // AFRICA
  "CMR": "#003d1e", // AFRICA
  "COD": "#66a384", // AFRICA
  "COG": "#005128", // AFRICA
  "COM": "#32845b", // AFRICA
  "CPV": "#003d1e", // AFRICA
  "CUB": "#530000", // AMERICAS
  "DJI": "#66a384", // AFRICA
  "EGY": "#005128", // AFRICA
  "ERI": "#32845b", // AFRICA
  "ETH": "#003d1e", // AFRICA
  "FJI": "#8152cc", // OCEANIA
  "FSM": "#b485ff", // OCEANIA
  "GEO": "#ffa332", // ASIA
  "GHA": "#66a384", // AFRICA
  "GIN": "#005128", // AFRICA
  "GMB": "#32845b", // AFRICA
  "GNB": "#003d1e", // AFRICA
  "GTM": "#b96666", // AMERICAS
  "GUY": "#66a384", // AFRICA
  "HND": "#6f0000", // AMERICAS
  "HTI": "#a23232", // AMERICAS
  "IDN": "#995400", // ASIA
  "IND": "#ffba66", // ASIA
  "IRQ": "#cc7000", // ASIA
  "KEN": "#005128", // AFRICA
  "KGZ": "#ffa332", // ASIA
  "KHM": "#995400", // ASIA
  "KIR": "#613d99", // OCEANIA
  "LAO": "#ffba66", // ASIA
  "LBR": "#32845b", // AFRICA
  "LKA": "#cc7000", // ASIA
  "LSO": "#003d1e", // AFRICA
  "MAR": "#66a384", // AFRICA
  "MDA": "#6684c1", // EUROPE
  "MDG": "#005128", // AFRICA
  "MHL": "#c7a3ff", // OCEANIA
  "MLI": "#32845b", // AFRICA
  "MMR": "#ffa332", // ASIA
  "MNG": "#995400", // ASIA
  "MOZ": "#003d1e", // AFRICA
  "MRT": "#66a384", // AFRICA
  "MWI": "#005128", // AFRICA
  "NER": "#32845b", // AFRICA
  "NGA": "#003d1e", // AFRICA
  "NIC": "#530000", // AMERICAS
  "NPL": "#ffba66", // ASIA
  "PAK": "#cc7000", // ASIA
  "PHL": "#ffa332", // ASIA
  "PNG": "#8152cc", // OCEANIA
  "PRK": "#995400", // ASIA
  "PRY": "#b96666", // AMERICAS
  "PSE": "#ffba66", // ASIA
  "RWA": "#66a384", // AFRICA
  "SDN": "#005128", // AFRICA
  "SEN": "#32845b", // AFRICA
  "SLB": "#b485ff", // OCEANIA
  "SLE": "#003d1e", // AFRICA
  "SLV": "#6f0000", // AMERICAS
  "SOM": "#66a384", // AFRICA
  "SSD": "#005128", // AFRICA
  "STP": "#32845b", // AFRICA
  "SWZ": "#003d1e", // AFRICA
  "SYR": "#cc7000", // ASIA
  "TCD": "#66a384", // AFRICA
  "TGO": "#005128", // AFRICA
  "TJK": "#ffa332", // ASIA
  "TKM": "#995400", // ASIA
  "TLS": "#ffba66", // ASIA
  "TON": "#613d99", // OCEANIA
  "TUV": "#613d99", // OCEANIA
  "TZA": "#32845b", // AFRICA
  "UGA": "#003d1e", // AFRICA
  "UKR": "#001e5b", // EUROPE
  "UZB": "#cc7000", // ASIA
  "VNM": "#ffa332", // ASIA
  "VUT": "#8152cc", // OCEANIA
  "WSM": "#b485ff", // OCEANIA
  "XK":  "#325bad", // EUROPE
  "YEM": "#995400", // ASIA
  "ZMB": "#66a384", // AFRICA
  "ZWE": "#005128", // AFRICA
  // touchstones
  "201710gavi-201907wue":  "#AC1A68",
  "201710gavi":            "#00ffff",
  "201710gavi-201810gavi": "#00008b",
  "201510gavi":            "#ff8c00",
  "201310gavi-201810gavi": "#008000",
  "201310gavi":            "#ffb6c1",
  "201510gavi-201810gavi": "#800000",
  "201210gavi-201810gavi": "#ff0000",
  "201210gavi-201303gavi": "#9400d3",
  "201310gavi-201403gavi": "#808000",
  // support Types
  "gavi":  "#0000ff",
  "other": "#8b0000",
};

export let niceColours = {
  aqua:           "#00ffff",
  azure:          "#f0ffff",
  beige:          "#f5f5dc",
  black:          "#000000",
  blue:           "#0000ff",
  brown:          "#a52a2a",
  cyan:           "#00ffff",
  darkblue:       "#00008b",
  darkcyan:       "#008b8b",
  darkgrey:       "#a9a9a9",
  darkgreen:      "#006400",
  darkkhaki:      "#bdb76b",
  darkmagenta:    "#8b008b",
  darkolivegreen: "#556b2f",
  darkorange:     "#ff8c00",
  darkorchid:     "#9932cc",
  darkred:        "#8b0000",
  darksalmon:     "#e9967a",
  darkviolet:     "#9400d3",
  fuchsia:        "#ff00ff",
  gold:           "#ffd700",
  green:          "#008000",
  indigo:         "#4b0082",
  khaki:          "#f0e68c",
  lightblue:      "#add8e6",
  lightcyan:      "#e0ffff",
  lightgreen:     "#90ee90",
  lightgrey:      "#d3d3d3",
  lightpink:      "#ffb6c1",
  lightyellow:    "#ffffe0",
  lime:           "#00ff00",
  magenta:        "#ff00ff",
  maroon:         "#800000",
  navy:           "#000080",
  olive:          "#808000",
  orange:         "#ffa500",
  pink:           "#ffc0cb",
  purple:         "#800080",
  violet:         "#800080",
  red:            "#ff0000",
  silver:         "#c0c0c0",
  white:          "#ffffff",
  yellow:         "#ffff00",
};
