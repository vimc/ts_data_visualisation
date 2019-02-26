// This is not const as we might append colours to it at run time
export let plotColours: { [vaccine: string]: string } = {
    // disease / vaccine colours
    "HPV":     "#BEBADA",
    "HepB":    "#8DD3C7",
    "HepB_BD": "#466963",
    "Hib":     "#bdb76b",
    "Hib3":    "#FB8072",
    "JE":      "#FFFFB3",
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
    // years
    "2011":    "#0022E5",
    "2012":    "#0620DF",
    "2013":    "#0D1FD9",
    "2014":    "#131ED3",
    "2015":    "#1A1DCD",
    "2016":    "#201CC8",
    "2017":    "#271AC2",
    "2018":    "#2E19BC",
    "2019":    "#3418B6",
    "2020":    "#3B17B1",
    "2021":    "#4116AB",
    "2022":    "#4815A5",
    "2023":    "#4F139F",
    "2024":    "#55129A",
    "2025":    "#5C1194",
    "2026":    "#62108E",
    "2027":    "#690F88",
    "2028":    "#6F0E83",
    "2029":    "#760C7D",
    "2030":    "#7D0B77",
    "2031":    "#830A71",
    "2032":    "#8A096C",
    "2033":    "#900866",
    "2034":    "#970760",
    "2035":    "#9E055A",
    "2036":    "#A40455",
    "2037":    "#AB034F",
    "2038":    "#B10249",
    "2039":    "#B80143",
    "2040":    "#BF003E",
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
    "201710gavi":            "#00ffff",
    "201710gavi-201807wue":  "#00008b",
    "201510gavi":            "#ff8c00",
    "201310gavi-201807wue":  "#008000",
    "201310gavi":            "#ffb6c1",
    "201510gavi-201807wue":  "#800000",
    "201210gavi-201807wue":  "#ff0000",
    "201210gavi-201303gavi": "#9400d3",
    "201310gavi-201403gavi": "#808000",
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
