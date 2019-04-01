// the data for South Sudan (SSD), Palestinian Territories (PSE) and Kosovo (XK)
// are dodgy so I've omitted them
export const countries = ["AFG", "ALB", "AGO", "ARM", "AZE", "BGD", "BLZ",
    "BEN", "BTN", "BOL", "BIH", "BFA", "BDI", "KHM", "CMR", "CPV", "CAF", "TCD",
    "CHN", "COM", "CIV", "CUB", "DJI", "PRK", "COD", "EGY", "SLV", "ERI", "ETH",
    "FJI", "GMB", "GEO", "GHA", "GTM", "GIN", "GNB", "GUY", "HTI", "HND", "IND",
    "IDN", "IRQ", "KEN", "KIR", /*"XK",*/ "KGZ", "LSO", "LBR", "MDG", "MWI",
    "MLI", "MHL", "MRT", "FSM", "MDA", "MNG", "MAR", "MOZ", "MMR", "NPL", "NIC",
    "NER", "NGA", "PAK", /*"PSE",*/ "PNG", "PRY", "LAO", "PHL", "COG", "RWA",
    "WSM", "STP", "SEN", "SLE", "SLB", "SOM", /*"SSD",*/ "LKA", "SDN", "SWZ",
    "SYR", "TJK", "TZA", "TLS", "TGO", "TON", "TKM", "TUV", "UGA", "UKR", "UZB",
    "VUT", "VNM", "YEM", "ZMB", "ZWE"];

export const pineCountries = ["COD", "ETH", "IND", "NGA", "PAK"];

const notDove94 = ["ALB", "BIH", "CHN", "TUN"];
export const dove94 = countries.filter(x => notDove94.indexOf(x) < 0 );

const notDove96 = ["TUN", "XK"];
export const dove96 = countries.filter(x => notDove96.indexOf(x) < 0 );

const notGavi68 = ["ALB", "BIH", "BLZ", "BTN", "CHN", "CPV", "EGY",
    "FJI", "FSM", "GTM", "HND", "IRQ", "LKA", "MAR", "MHL", "MNG", "PHL", "PRY",
    "PSE", "SLV", "SWZ", "SYR", "TKM", "TON", "TUN", "TUV", "UKR", "VUT", "WSM",
    "XK"];
export const gavi68 = countries.filter(x => notGavi68.indexOf(x) < 0 );

const notGavi72 = ["ALB", "BIH", "BLZ", "CHN", "CPV", "EGY", "FJI",
    "FSM", "GTM", "IRQ", "MAR", "MHL", "PHL", "PRY", "PSE", "SLV", "SWZ", "SYR",
    "TKM", "TON", "TUN", "TUV", "UKR", "VUT", "WSM", "XK"];
export const gavi72 = countries.filter(x => notGavi72.indexOf(x) < 0 );

const notGavi77 = ["BLZ", "CPV", "EGY", "FJI", "FSM", "GTM", "IRQ",
    "MAR", "MHL", "PHL", "PRY", "PSE", "SLV", "SWZ", "SYR", "TON", "TUN", "TUV",
    "VUT", "WSM", "XK"];
export const gavi77 = countries.filter(x => notGavi77.indexOf(x) < 0 );

export const diseases = ["HepB", "Hib", "HPV", "JE", "Measles", "MenA", "PCV",
    "Rota", "Rubella", "YF"];

export const vaccines = ["HepB", "HepB_BD", "Hib3", "HPV", "JE", "MCV1", "MCV2",
    "Measles", "MenA", "PCV3", "Rota", "RCV2", "Rubella", "YF"];

export const activityTypes = ["routine", "campaign", "combined"];

export const plottingVariables = ["year", "country", "continent", "region",
    "cofinance_status_2018", "activity_type", "disease", "vaccine", "touchstone", "support_type"];

export const touchstones = ["201710gavi", "201710gavi-201807wue", "201510gavi",
                            "201310gavi-201807wue", "201310gavi",
                            "201310gavi-201403gavi", "201510gavi-201807wue",
                            "201210gavi-201807wue", "201210gavi-201303gavi"];

export const supportTypes = ["gavi", "other"];
