export const countryDict: { [code: string]: string} = {
    AFG: "Afghanistan",
    AGO: "Angola",
    ALB: "Albania",
    ARM: "Armenia",
    AZE: "Azerbaijan",
    BDI: "Burundi",
    BEN: "Benin",
    BFA: "Burkina Faso",
    BGD: "Bangladesh",
    BIH: "Bosnia and Herzegovina",
    BLZ: "Belize",
    BOL: "Bolivia",
    BTN: "Bhutan",
    CAF: "Central African Republic",
    CHN: "China",
    CIV: "Côte d'Ivoire",
    CMR: "Cameroon",
    COD: "DR Congo",
    COG: "Republic of Congo",
    COM: "Comoros",
    CPV: "Cape Verde",
    CUB: "Cuba",
    DJI: "Djibouti",
    EGY: "Egypt",
    ERI: "Eritrea",
    ETH: "Ethiopia",
    FJI: "Fiji",
    FSM: "Micronesia",
    GEO: "Georgia",
    GHA: "Ghana",
    GIN: "Guinea",
    GMB: "Gambia",
    GNB: "Guinea-Bissau",
    GTM: "Guatemala",
    GUY: "Guyana",
    HND: "Honduras",
    HTI: "Haiti",
    IDN: "Indonesia",
    IND: "India",
    IRQ: "Iraq",
    KEN: "Kenya",
    KGZ: "Kyrgyzstan",
    KHM: "Cambodia",
    KIR: "Kiribati",
    LAO: "PDR Lao",
    LBR: "Liberia",
    LKA: "Sri Lanka",
    LSO: "Lesotho",
    MAR: "Morocco",
    MDA: "Moldova",
    MDG: "Madagascar",
    MHL: "Marshall Islands",
    MLI: "Mali",
    MMR: "Myanmar",
    MNG: "Mongolia",
    MOZ: "Mozambique",
    MRT: "Mauritania",
    MWI: "Malawi",
    NER: "Niger",
    NGA: "Nigeria",
    NIC: "Nicaragua",
    NPL: "Nepal",
    PAK: "Pakistan",
    PHL: "Philippines",
    PNG: "Papua New Guinea",
    PRK: "DPR Korea",
    PRY: "Paraguay",
    PSE: "Palestinian Territory",
    RWA: "Rwanda",
    SDN: "Sudan",
    SEN: "Senegal",
    SLB: "Solomon Islands",
    SLE: "Sierra Leone",
    SLV: "El Salvador",
    SOM: "Somalia",
    SSD: "South Sudan",
    STP: "Sao Tome and Principe",
    SWZ: "Swaziland",
    SYR: "Syria",
    TCD: "Chad",
    TGO: "Togo",
    TJK: "Tajikistan",
    TKM: "Turkmenistan",
    TLS: "Timor-Leste",
    TON: "Tonga",
    TUV: "Tuvalu",
    TZA: "Tanzania",
    UGA: "Uganda",
    UKR: "Ukraine",
    UZB: "Uzbekistan",
    VNM: "Viet Nam",
    VUT: "Vanuatu",
    WSM: "Samoa",
    XK: "Kosovo",
    YEM: "Yemen",
    ZMB: "Zambia",
    ZWE: "Zimbabwe",
};

export const vaccineDict: { [code: string]: string} = {
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
};

export const diseaseDict: { [code: string]: string} = {
    HPV: "HPV",
    HepB: "Hepatitis B",
    Hib: "Hib",
    JE: "Japanese encephalitis",
    Measles: "Measles",
    MenA: "MenA",
    PCV: "PCV",
    Rota: "Rotavirus",
    Rubella: "Rubella",
    YF: "Yellow Fever"
};

export const diseaseVaccineLookup: { [code: string] : string[]} = {
    HepB: ["HepB", "HepB_BD"],
    Hib: ["Hib3"],
    HPV: ["HPV"],
    JE: ["JE"],
    Measles: ["MCV1", "MCV2", "Measles"],
    MenA: ["MenA"],
    PCV: ["PCV3"],
    Rota: ["Rota"],
    Rubella: ["RCV2", "Rubella"],
    YF: ["YF"]
};

export const touchstoneYears: { [code: string] : number} = {
    "201210gavi-201303gavi" : 2011,
    "201210gavi-201807wue"  : 2017,
    "201310gavi"            : 2012,
    "201310gavi-201403gavi" : 2012,
    "201310gavi-201807wue"  : 2017,
    "201510gavi"            : 2014,
    "201510gavi-201807wue"  : 2017,
    "201710gavi"            : 2016,
    "201710gavi-201807wue"  : 2017
};
