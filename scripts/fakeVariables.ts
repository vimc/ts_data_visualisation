export const vimc98Countries = [
    "AFG","AGO","ALB","ARM","AZE","BDI","BEN","BFA","BGD","BIH",
    "BLZ","BOL","BTN","CAF","CHN","CIV","CMR","COD","COG","COM",
    "CPV","CUB","DJI","EGY","ERI","ETH","FJI","FSM","GEO","GHA",
    "GIN","GMB","GNB","GTM","GUY","HND","HTI","IDN","IND","IRQ",
    "KEN","KGZ","KHM","KIR","LAO","LBR","LKA","LSO","MAR","MDA",
    "MDG","MHL","MLI","MMR","MNG","MOZ","MRT","MWI","NER","NGA",
    "NIC","NPL","PAK","PHL","PNG","PRK","PRY","PSE","RWA","SDN",
    "SEN","SLB","SLE","SLV","SOM","SSD","STP","SWZ","SYR","TCD",
    "TGO","TJK","TKM","TLS","TON","TUN","TUV","TZA","UGA","UKR",
    "UZB","VNM","VUT","WSM","XK","YEM","ZMB","ZWE"];

const paper2NewCountries = ["BLR","COL","DZA","ECU","IRN","JAM","JOR","MKD","NAM","PER","SRB","THA","VEN","ZAF"];

export const allCountries = vimc98Countries.concat(paper2NewCountries);

const pineCountries = ["COD", "ETH", "IND", "NGA", "PAK"];

const notDove94 = ["ALB", "BIH", "CHN", "TUN"];
const dove94 = vimc98Countries.filter((x) => notDove94.indexOf(x) < 0 );

const notDove96 = ["TUN", "XK"];
const dove96 = vimc98Countries.filter((x) => notDove96.indexOf(x) < 0 );

const notGavi68 = ["ALB", "BIH", "BLZ", "BTN", "CHN", "CPV", "EGY",
    "FJI", "FSM", "GTM", "HND", "IRQ", "LKA", "MAR", "MHL", "MNG", "PHL", "PRY",
    "PSE", "SLV", "SWZ", "SYR", "TKM", "TON", "TUN", "TUV", "UKR", "VUT", "WSM",
    "XK"];
const gavi68 = vimc98Countries.filter((x) => notGavi68.indexOf(x) < 0 );

const notGavi72 = ["ALB", "BIH", "BLZ", "CHN", "CPV", "EGY", "FJI",
    "FSM", "GTM", "IRQ", "MAR", "MHL", "PHL", "PRY", "PSE", "SLV", "SWZ", "SYR",
    "TKM", "TON", "TUN", "TUV", "UKR", "VUT", "WSM", "XK"];
const gavi72 = vimc98Countries.filter((x) => notGavi72.indexOf(x) < 0 );

const notGavi73 = ["ALB", "BIH", "BLZ", "CHN", "CPV", "EGY", "FJI",
    "FSM", "GTM", "IRQ", "MAR", "MHL", "PHL", "PRY", "PSE", "SLV", "SWZ", "SYR",
    "TKM", "TON", "TUN", "TUV", "VUT", "WSM", "XK"];
const gavi73 = vimc98Countries.filter((x) => notGavi73.indexOf(x) < 0 );

const notGavi77 = ["BLZ", "CPV", "EGY", "FJI", "FSM", "GTM", "IRQ",
    "MAR", "MHL", "PHL", "PRY", "PSE", "SLV", "SWZ", "SYR", "TON", "TUN", "TUV",
    "VUT", "WSM", "XK"];
const gavi77 = vimc98Countries.filter((x) => notGavi77.indexOf(x) < 0 );

export const countryGroups = {
    pine: pineCountries,
    dove94: dove94,
    dove96: dove96,
    gavi68: gavi68,
    gavi72: gavi72,
    gavi73: gavi73,
    gavi77: gavi77,
    vimc98: vimc98Countries
};

export const diseases = ["HepB", "Hib", "HPV", "JE", "Measles", "MenA", "PCV",
    "Rota", "Rubella", "YF", "All Diseases"];

export const diseaseVaccines = {
    "HepB":["HepB","HepB_BD"],
    "Hib":["Hib3"],"HPV":["HPV"],
    "JE":["JE"],
    "Measles":["MCV1","MCV2","Measles"],
    "MenA":["MenA"],
    "PCV":["PCV3"],
    "Rota":["Rota"],
    "Rubella":["Rubella"],
    "YF":["YF"],
    "All Diseases": ["All Vaccines"],
};

export const vaccines = ["HepB", "HepB_BD", "Hib3", "HPV", "JE", "MCV1", "MCV2",
"Measles", "MenA", "PCV3", "Rota", "RCV2", "Rubella", "YF", "All Vaccines"];

export const vaccineDict = {
    HPV: "HPV",
    HepB: "Hepatitis B",
    HepB_BD: "HepB_BD",
    Hib3: "Hib3",
    JE: "Japanese encephalitis",
    MCV1: "MCV1",
    MCV2: "MCV2",
    Measles: "Measles",
    MenA: "MenA",
    PCV3: "PCV3",
    RCV2: "RCV2",
    Rota: "Rotavirus",
    Rubella: "Rubella",
    YF: "Yellow Fever",
    "All Vaccines": "All Vaccines",
};

export const diseaseDict = {
    Rota: "Rotavirus",
    Rubella: "Rubella",
    YF: "Yellow Fever",
    HPV: "HPV",
    Hib: "Hib"
};

export const activityTypes = ["routine", "campaign", "combined"];

export const plottingVariables = ["year", "country", "continent", "region",
    "cofinance_status_2018", "activity_type", "disease", "vaccine", "touchstone", "support_type"];

export const touchstones = ["201210gavi-201303gavi", "201210gavi-201907wue",
                            "201310gavi", "201310gavi-201403gavi",
                            "201310gavi-201907wue", "201510gavi",
                            "201510gavi-201907wue", "201710gavi",
                            "201710gavi-201907wue"];

export const supportTypes = ["gavi", "other"];

export const fakeCountryDict = [
    {"country":"AFG","country_name":"Afghanistan"},
    {"country":"ALB","country_name":"Albania"},
    {"country":"DZA","country_name":"Algeria"},
    {"country":"AGO","country_name":"Angola"},
    {"country":"ARM","country_name":"Armenia"},
    {"country":"AZE","country_name":"Azerbaijan"},
    {"country":"BGD","country_name":"Bangladesh"},
    {"country":"BLR","country_name":"Belarus"},
    {"country":"BLZ","country_name":"Belize"},
    {"country":"BEN","country_name":"Benin"},
    {"country":"BTN","country_name":"Bhutan"},
    {"country":"BOL","country_name":"Bolivia"},
    {"country":"BIH","country_name":"Bosnia and Herzegovina"},
    {"country":"BFA","country_name":"Burkina Faso"},
    {"country":"BDI","country_name":"Burundi"},
    {"country":"CPV","country_name":"Cabo Verde"},
    {"country":"KHM","country_name":"Cambodia"},
    {"country":"CMR","country_name":"Cameroon"},
    {"country":"CAF","country_name":"Central African Republic"},
    {"country":"TCD","country_name":"Chad"},
    {"country":"CHN","country_name":"China"},
    {"country":"COL","country_name":"Colombia"},
    {"country":"COM","country_name":"Comoros"},
    {"country":"COG","country_name":"Congo"},
    {"country":"CIV","country_name":"Cote d'Ivoire"},
    {"country":"CUB","country_name":"Cuba"},
    {"country":"DJI","country_name":"Djibouti"},
    {"country":"COD","country_name":"DR Congo"},
    {"country":"ECU","country_name":"Ecuador"},
    {"country":"EGY","country_name":"Egypt"},
    {"country":"SLV","country_name":"El Salvador"},
    {"country":"ERI","country_name":"Eritrea"},
    {"country":"ETH","country_name":"Ethiopia"},
    {"country":"FJI","country_name":"Fiji"},
    {"country":"GMB","country_name":"Gambia"},
    {"country":"GEO","country_name":"Georgia"},
    {"country":"GHA","country_name":"Ghana"},
    {"country":"GTM","country_name":"Guatemala"},
    {"country":"GIN","country_name":"Guinea"},
    {"country":"GNB","country_name":"Guinea-Bissau"},
    {"country":"GUY","country_name":"Guyana"},
    {"country":"HTI","country_name":"Haiti"},
    {"country":"HND","country_name":"Honduras"},
    {"country":"IND","country_name":"India"},
    {"country":"IDN","country_name":"Indonesia"},
    {"country":"IRN","country_name":"Iran"},
    {"country":"IRQ","country_name":"Iraq"},
    {"country":"JAM","country_name":"Jamaica"},
    {"country":"JOR","country_name":"Jordan"},
    {"country":"KEN","country_name":"Kenya"},
    {"country":"KIR","country_name":"Kiribati"},
    {"country":"XK","country_name":"Kosovo"},
    {"country":"KGZ","country_name":"Kyrgyzstan"},
    {"country":"LAO","country_name":"Laos"},
    {"country":"LSO","country_name":"Lesotho"},
    {"country":"LBR","country_name":"Liberia"},
    {"country":"MKD","country_name":"Macedonia"},
    {"country":"MDG","country_name":"Madagascar"},
    {"country":"MWI","country_name":"Malawi"},
    {"country":"MLI","country_name":"Mali"},
    {"country":"MHL","country_name":"Marshall Islands"},
    {"country":"MRT","country_name":"Mauritania"},
    {"country":"FSM","country_name":"Micronesia"},
    {"country":"MDA","country_name":"Moldova"},
    {"country":"MNG","country_name":"Mongolia"},
    {"country":"MAR","country_name":"Morocco"},
    {"country":"MOZ","country_name":"Mozambique"},
    {"country":"MMR","country_name":"Myanmar"},
    {"country":"NAM","country_name":"Namibia"},
    {"country":"NPL","country_name":"Nepal"},
    {"country":"NIC","country_name":"Nicaragua"},
    {"country":"NER","country_name":"Niger"},
    {"country":"NGA","country_name":"Nigeria"},
    {"country":"PRK","country_name":"North Korea"},
    {"country":"PAK","country_name":"Pakistan"},
    {"country":"PSE","country_name":"Palestine"},
    {"country":"PNG","country_name":"Papua New Guinea"},
    {"country":"PRY","country_name":"Paraguay"},
    {"country":"PER","country_name":"Peru"},
    {"country":"PHL","country_name":"Philippines"},
    {"country":"RWA","country_name":"Rwanda"},
    {"country":"WSM","country_name":"Samoa"},
    {"country":"STP","country_name":"Sao Tome and Principe"},
    {"country":"SEN","country_name":"Senegal"},
    {"country":"SRB","country_name":"Serbia"},
    {"country":"SLE","country_name":"Sierra Leone"},
    {"country":"SLB","country_name":"Solomon Islands"},
    {"country":"SOM","country_name":"Somalia"},
    {"country":"ZAF","country_name":"South Africa"},
    {"country":"SSD","country_name":"South Sudan"},
    {"country":"LKA","country_name":"Sri Lanka"},
    {"country":"SDN","country_name":"Sudan"},
    {"country":"SWZ","country_name":"Swaziland"},
    {"country":"SYR","country_name":"Syria"},
    {"country":"TJK","country_name":"Tajikistan"},
    {"country":"TZA","country_name":"Tanzania"},
    {"country":"THA","country_name":"Thailand"},
    {"country":"TLS","country_name":"Timor-Leste"},
    {"country":"TGO","country_name":"Togo"},
    {"country":"TON","country_name":"Tonga"},
    {"country":"TUN","country_name":"Tunisia"},
    {"country":"TKM","country_name":"Turkmenistan"},
    {"country":"TUV","country_name":"Tuvalu"},
    {"country":"UGA","country_name":"Uganda"},
    {"country":"UKR","country_name":"Ukraine"},
    {"country":"UZB","country_name":"Uzbekistan"},
    {"country":"VUT","country_name":"Vanuatu"},
    {"country":"VEN","country_name":"Venezuela"},
    {"country":"VNM","country_name":"Viet Nam"},
    {"country":"YEM","country_name":"Yemen"},
    {"country":"ZMB","country_name":"Zambia"},
    {"country":"ZWE","country_name":"Zimbabwe"}
];
