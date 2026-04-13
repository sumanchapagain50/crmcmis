/**
 * Community Resource and Capacity Data
 * Contains coordinates for various resources/capacities within each community.
 */
// BADHUPURUWA
const COMMUNITY_RESOURCES = {
  "Badhupuruwa": [
    { name: "Health Post", type: "Health", lat: 28.2285, lng: 81.3712 },
    { name: "Primary School", type: "Education", lat: 28.2275, lng: 81.3705 },
    { name: "Water Point", type: "Water", lat: 28.2282, lng: 81.3702 },
    { name: "Market Area", type: "Economy", lat: 28.2291, lng: 81.3715 }
  ],

// BAGPHANTA
  "Bagphanta (Shuktaraj Tole)": [
    { name: "Clinic", type: "Health", lat: 28.8405, lng: 80.4105 },
    { name: "Community", type: "Social", lat: 28.8392, lng: 80.4095 },
    { name: "Tube Well", type: "Water", lat: 28.8401, lng: 80.4108 }
  ],

//BAIDI
  "Baidi": [
    { name: "Local Health Center", type: "Health", lat: 28.4552, lng: 81.0292 },
    { name: "Baidi Secondary School", type: "Education", lat: 28.4538, lng: 81.0282 },
    { name: "Public Hydrant", type: "Water", lat: 28.4548, lng: 81.0278 }
  ],

//BALAPUR
  "Balapur": [
    { name: "Health Post", type: "Health", lat: 28.2285, lng: 81.3712 },
    { name: "School", type: "Education", lat: 28.2278, lng: 81.3708 }
  ],

//BALMI
  "Balmi": [
    { name: "Rural Clinic", type: "Health", lat: 28.7515, lng: 80.3755 },
    { name: "Community Hall", type: "Social", lat: 28.7502, lng: 80.3742 },
    { name: "Water Point", type: "Water", lat: 28.7510, lng: 80.3748 }
  ],

//BANGALIPUR
  "Bangalipur": [
    { name: "Primary Clinic", type: "Health", lat: 28.3905, lng: 81.2435 },
    { name: "Secondary School", type: "Education", lat: 28.3892, lng: 81.2422 }
  ],

//BANGHUSHRA
  "Banghushra": [
    { name: "Community Health Unit", type: "Health", lat: 28.5392, lng: 81.1912 },
    { name: "Ward Office", type: "Social", lat: 28.5382, lng: 81.1902 }
  ],

//BANKATTI
  "Bankatti": [
    { name: "Health Post", type: "Health", lat: 28.4998, lng: 81.1698 },
    { name: "Water Station", type: "Water", lat: 28.4988, lng: 81.1688 }
  ],

//BELPUR
  "Belpur": [
    { name: "Mobile Clinic", type: "Health", lat: 28.5485, lng: 81.0712 },
    { name: "Social Support Point", type: "Social", lat: 28.5472, lng: 81.0702 }
  ],

//BHAGATPUR
"Bhagatpur": [
    { "name": "West Border", "type": "Extent", "lat": 28.3653701, "lng": 81.2368282, "code": "EXT-01", "note": "Nabina Chowk, Constructed in 2081, East Border of Khata Community" },
    { "name": "Culvert", "type": "Infrastructures", "lat": 28.3634255, "lng": 81.2365001, "code": "INF-01", "note": "Length: 12m, Width: 8m, Height raised: 2.4m" },
    { "name": "Irrigation Canal", "type": "Infrastructures", "lat": 28.3634255, "lng": 81.2365001, "code": "INF-02", "note": "Length: 1,000m, Width: 1.2m" },
    { "name": "Road", "type": "Infrastructures", "lat": 28.3628713, "lng": 81.2364295, "code": "INF-03", "note": "Length: 3,000m, Width: 3m, Connects Nabina Chowk and Dharmapur Road" },
    { "name": "Mattribhumi Microfinance", "type": "Institution", "lat": 28.3625162, "lng": 81.2362792, "code": "INS-01", "note": "1 storey institutional building, 1,500+ community shareholders, saving and credit services" },
    { "name": "Sumit Bangur Pasal", "type": "Business", "lat": 28.3601171, "lng": 81.2354104, "code": "BUS-01", "note": "1 storey concrete building, retail of pork meat" },
    { "name": "Culvert", "type": "Infrastructures", "lat": 28.3601197, "lng": 81.2354387, "code": "INF-04", "note": "Length: 12m, Width: 6m" },
    { "name": "Culvert", "type": "Infrastructures", "lat": 28.359237, "lng": 81.2352917, "code": "INF-05", "note": "Length: 12m, Width: 8m, Height raised: 1.2m" },
    { "name": "Road", "type": "Infrastructures", "lat": 28.3592171, "lng": 81.2353343, "code": "INF-06", "note": "Length: 500m, Width: 6m, Local road" },
    { "name": "Retail Shop", "type": "Business", "lat": 28.358151, "lng": 81.2348588, "code": "BUS-02", "note": "Retail seller of regular household items" },
    { "name": "South Border", "type": "Extent", "lat": 28.3553093, "lng": 81.2327886, "code": "EXT-02", "note": "South border" },
    { "name": "Road", "type": "Infrastructures", "lat": 28.3553223, "lng": 81.2327071, "code": "INF-07", "note": "Width: 10m" },
    { "name": "Road", "type": "Infrastructures", "lat": 28.3565524, "lng": 81.2333009, "code": "INF-08", "note": "Length: 4,000m, Width: 8m" },
    { "name": "Culvert", "type": "Infrastructures", "lat": 28.3580361, "lng": 81.2351903, "code": "INF-09", "note": "Length: 12m, Width: 8m, Constructed in 2059 B.S." },
    { "name": "Dakshin Chowk", "type": "Community", "lat": 28.3579166, "lng": 81.235952, "code": "CHK-01", "note": "Community Center" },
    { "name": "Road", "type": "Infrastructures", "lat": 28.3582922, "lng": 81.2361483, "code": "INF-10", "note": "Width: 6m" },
    { "name": "Bich Gau Chowk", "type": "Community", "lat": 28.3589111, "lng": 81.2365115, "code": "CHK-02", "note": "Community Center" },
    { "name": "Retail Shop", "type": "Business", "lat": 28.3593029, "lng": 81.2365908, "code": "BUS-03", "note": "Retail seller of regular household items" },
    { "name": "Milan Chowk", "type": "Community", "lat": 28.3593048, "lng": 81.2365846, "code": "CHK-03", "note": "Community Center" },
    { "name": "Shree Jan Chetana Primary School", "type": "Education", "lat": 28.3592356, "lng": 81.2373534, "code": "EDU-01", "note": "Established: 2072 B.S., Buildings: 2 concrete, 2 GI-sheet, Students: 70 (Girls: 43, Boys: 27), Teachers: 6 (4 Female, 2 Male), Water Tank: 1, Raised tap: 1, Toilets: 2" },
    { "name": "Bal Kumari Community Forest", "type": "Forest", "lat": 28.3591015, "lng": 81.237768, "code": "FOR-01", "note": "Established: 2058 B.S., Area: 124 hectares, User members: 234" },
    { "name": "East Border", "type": "Extent", "lat": 28.3691015, "lng": 81.227768, "code": "EXT-03", "note": "East border" },
    { "name": "CDMC Chairperson House", "type": "Settlement", "lat": 28.3603794, "lng": 81.2370936, "code": "SET-01", "note": "CDMC Chairperson: Tiju Maya Tharu" },
    { "name": "Jharan Nahar / Canal", "type": "Infrastructures", "lat": 28.3618903, "lng": 81.2379032, "code": "INF-11", "note": "Length: 200m, drains forest surface water" },
    { "name": "Badghar House", "type": "Settlement", "lat": 28.3618282, "lng": 81.2377254, "code": "SET-02", "note": "Badghar: Madan Tharu" },
    { "name": "Road", "type": "Infrastructures", "lat": 28.3618953, "lng": 81.2378892, "code": "INF-12", "note": "Width: 8m" },
    { "name": "North Border", "type": "Extent", "lat": 28.3636063, "lng": 81.2386323, "code": "EXT-04", "note": "North border, Orali Bazar" }
  ],
  "Bhagrahiya": [
    { name: "Culvert", type: "Infrastructure", lat: 28.3634255, lng: 81.2365001 },
    { name: "Irrigation Canal", type: "Infrastructure", lat: 28.3634255, lng: 81.2365001 },
    { name: "Road", type: "Infrastructure", lat: 28.3634255, lng: 81.2365001 },
    { name: "Local School", type: "Education", lat: 28.3528, lng: 81.2208 }
  ],
  "Bhaishakhani": [
    { name: "Health Center", type: "Health", lat: 28.3185, lng: 81.3158 },
    { name: "Market Area", type: "Economy", lat: 28.3172, lng: 81.3148 }
  ],
  "Bhanubhakta Tole (Saraswati, Bhumiraj)": [
    { name: "Community Clinic", type: "Health", lat: 28.9382, lng: 75.2045 },
    { name: "Social Center", type: "Social", lat: 28.9372, lng: 75.2032 }
  ],
  "Bhartapur": [
    { name: "Water Reservior", type: "Water", lat: 28.5008, lng: 81.0458 },
    { name: "School", type: "Education", lat: 28.4998, lng: 81.0448 }
  ],
  "Binbari": [
    { name: "Emergency Post", type: "Safety", lat: 28.7102, lng: 80.4452 },
    { name: "Local Clinic", type: "Health", lat: 28.7092, lng: 80.4432 }
  ],
  "Chanaura": [
    { name: "Health Unit", type: "Health", lat: 28.4782, lng: 81.1365 },
    { name: "Water Well", type: "Water", lat: 28.4772, lng: 81.1345 }
  ],
  "Dakshinshahipur": [
    { name: "Clinic", type: "Health", lat: 28.4682, lng: 81.1042 },
    { name: "School", type: "Education", lat: 28.4668, lng: 81.1025 }
  ],
  "Dangpur": [
    { name: "Health Post", type: "Health", lat: 28.3875, lng: 81.3292 },
    { name: "Hydrant", type: "Water", lat: 28.3865, lng: 81.3275 }
  ],
  "Dashrathbasti": [
    { name: "Community Clinic", type: "Health", lat: 28.6688, lng: 80.4735 },
    { name: "School", type: "Education", lat: 28.6678, lng: 80.4725 }
  ],
  "Dekhatbhuli (Deuwa Tole)": [
    { name: "Emergency Center", type: "Safety", lat: 28.8418, lng: 80.4122 },
    { name: "Health Post", type: "Health", lat: 28.8408, lng: 80.4108 }
  ],
  "Dhungrahi": [
    { name: "Health Unit", type: "Health", lat: 28.2108, lng: 81.1912 },
    { name: "Primary School", type: "Education", lat: 28.2098, lng: 81.1895 }
  ],
  "Dunga": [
    { name: "Emergency Clinic", type: "Health", lat: 28.7628, lng: 80.3672 },
    { name: "Water Well", type: "Water", lat: 28.7615, lng: 80.3655 }
  ],
  "Farela": [
    { name: "Clinic", type: "Health", lat: 28.5435, lng: 81.0578 },
    { name: "Social Support Center", type: "Social", lat: 28.5422, lng: 81.0565 }
  ],
  "Ghorpitta": [
    { name: "Health Clinic", type: "Health", lat: 28.3068, lng: 81.3195 },
    { name: "Water Standpoint", type: "Water", lat: 28.3055, lng: 81.3178 }
  ],
  "Girdharpur": [
    { name: "Secondary School", type: "Education", lat: 28.5502, lng: 81.0585 },
    { name: "Clinic", type: "Health", lat: 28.5488, lng: 81.0572 }
  ],
  "Guruwa Gau": [
    { name: "Health Post", type: "Health", lat: 28.2885, lng: 81.3235 },
    { name: "Social Activity Room", type: "Social", lat: 28.2872, lng: 81.3218 }
  ],
  "Jabdi": [
    { name: "Health Clinic", type: "Health", lat: 28.2745, lng: 81.3762 },
    { name: "School", type: "Education", lat: 28.2732, lng: 81.3742 }
  ],
  "Kanj": [
    { name: "Health Post", type: "Health", lat: 28.7298, lng: 80.4085 },
    { name: "Emergency Water Point", type: "Water", lat: 28.7282, lng: 80.4068 }
  ],
  "Kasba": [
    { name: "School", type: "Education", lat: 28.7435, lng: 80.4142 },
    { name: "Village Clinic", type: "Health", lat: 28.7422, lng: 80.4122 }
  ],
  "Khall Jain": [
    { name: "Clinic", type: "Health", lat: 28.7892, lng: 80.3738 },
    { name: "Water Well", type: "Water", lat: 28.7878, lng: 80.3722 }
  ],
  "Khallabichawa": [
    { name: "School", type: "Education", lat: 28.6968, lng: 80.4788 },
    { name: "Emergency Clinic", type: "Health", lat: 28.6952, lng: 80.4772 }
  ],


//KHUTIYA TOLE
"Khutiya Tole": [
  { name: "East Border", type: "Extent", lat: 28.64502003, lng: 80.68345025, notes: "East border - Baibaha Tole" },
  { name: "West Border", type: "Extent", lat: 28.64502003, lng: 80.68345025, notes: "West border - Khutiya River joining to Community/Municipality" },
  { name: "North Border", type: "Extent", lat: 28.64502003, lng: 80.68345025, notes: "North border - Jana Shakti Chowk" },
  { name: "South Border", type: "Extent", lat: 28.64502003, lng: 80.68345025, notes: "South border - Khutiya River, Adjoining to India Border" },
  { name: "Dipti Plumbing & Trade Suppliers", type: "Business", lat: 28.64502003, lng: 80.68345025, notes: "Plumbing items, building materials available, 2 plumbers" },
  { name: "Raised Handpump 1", type: "Infrastructure", lat: 28.64421848, lng: 80.6644525, notes: "Community owned, Raised 4ft, 60ft deep boring, 20 households benefitted" },
  { name: "Raised Handpump 2", type: "Infrastructure", lat: 28.64386304, lng: 80.66581573, notes: "Community owned, Raised 5ft, 120ft deep boring, 20 households benefitted" },
  { name: "Raised Handpump 3", type: "Infrastructure", lat: 28.64381154, lng: 80.6672078, notes: "Community owned, Raised 5ft, 120ft deep boring, 20 households benefitted" },
  { name: "Bal Adharbhut Bidhyalaya", type: "Education", lat: 28.6444986, lng: 80.6672078, notes: "Primary School - 2 teachers, 4 students, 2 one-storey buildings with 5 rooms total" },
  { name: "Irrigation Deep Boring", type: "Infrastructure", lat: 28.64118479, lng: 80.66979077, notes: "Irrigation boring serving 20+ households" },
  { name: "Angat Pharmacy & Prabiha Clinic", type: "Health", lat: 28.64516358, lng: 80.68366047, notes: "Private pharmacy and clinic (1 male, 1 female)" },
  { name: "Nobel Academy", type: "Education", lat: 28.64515829, lng: 80.68407856, notes: "Private school, 90+ students, 9 teachers & staff, 11 classrooms, 2 buildings" },
  { name: "Ward 14 Health Post", type: "Health", lat: 28.63683361, lng: 80.69147073, notes: "Government health post, 1 staff nurse, 1 health assistant, 3 staff, 1 bed, medicine for up to 20 patients" },
  { name: "Simran Chiya Nasta Pashal", type: "Business", lat: 28.64521206, lng: 80.68352089, notes: "Fast food / tea shop, serves 10 people at a time, up to 100 people per day" },
  { name: "Laxmi Electronics", type: "Business", lat: 28.64550814, lng: 80.68380162, notes: "Electronics shop with 2 electricians" },
  { name: "Culvert 1", type: "Culvert", lat: 28.6403347, lng: 80.67636218, notes: "Culvert 1 - Syaule Bajar" },
  { name: "Culvert 2", type: "Culvert", lat: 28.64456451, lng: 80.67230634, notes: "Culvert 2" },
  { name: "Culvert 3", type: "Culvert", lat: 28.64442092, lng: 80.66402704, notes: "Culvert 3" },
  { name: "Smarat Hardware & Trade Suppliers", type: "Business", lat: 28.64515829, lng: 80.68407856, notes: "Construction hardware shop - cement, rod, pipes, fittings, electrical items" },
  { name: "Playground", type: "Infrastructure", lat: 28.64357379, lng: 80.68118479, notes: "Public playground" }
],


//KUMRA GAU
  "Kumra Gau": [
    { name: "Health Post", type: "Health", lat: 28.3522, lng: 81.3175 },
    { name: "Emergency Center", type: "Safety", lat: 28.3508, lng: 81.3158 }
  ],
  "Lamkipuruwa": [
    { name: "Clinic", type: "Health", lat: 28.5568, lng: 81.1778 },
    { name: "Ward Office", type: "Social", lat: 28.5555, lng: 81.1762 }
  ],
  "Lauthuwa (Jogipur)": [
    { name: "Health Center", type: "Health", lat: 28.3335, lng: 76.3142 },
    { name: "Market Area", type: "Economy", lat: 28.3322, lng: 76.3122 }
  ],
  "Nand Gau": [
    { name: "Health Post", type: "Health", lat: 28.7578, lng: 80.4055 },
    { name: "Primary School", type: "Education", lat: 28.7565, lng: 80.4038 }
  ],
  "Naya Likepur Shiber": [
    { name: "Clinic", type: "Health", lat: 28.5468, lng: 81.1402 },
    { name: "Support Hub", type: "Social", lat: 28.5458, lng: 81.1392 }
  ],
  "Nuklipur": [
    { name: "Rural Health Center", type: "Health", lat: 28.6142, lng: 80.6895 },
    { name: "Hydrant point", type: "Water", lat: 28.6128, lng: 80.6878 }
  ],
  "Patharbojhi": [
    { name: "Hospital", type: "Health", lat: 28.3752, lng: 81.2182 },
    { name: "Secondary School", type: "Education", lat: 28.3735, lng: 81.2165 }
  ],
  "Payal": [
    { name: "Local Clinic", type: "Health", lat: 28.4378, lng: 81.0398 },
    { name: "Water Well", type: "Water", lat: 28.4362, lng: 81.0382 }
  ],
  "Purba Lalitpur": [
    { name: "Health Post", type: "Health", lat: 28.5828, lng: 80.7435 },
    { name: "Community Hall", type: "Social", lat: 28.5815, lng: 80.7418 }
  ],
  "Rajipur": [
    { name: "Rural Clinic", type: "Health", lat: 28.5478, lng: 81.2028 },
    { name: "School", type: "Education", lat: 28.5465, lng: 81.2012 }
  ],
  "Ramnagar": [
    { name: "Emergency Health Post", type: "Health", lat: 28.7368, lng: 80.3878 },
    { name: "Water Station", type: "Water", lat: 28.7352, lng: 80.3862 }
  ],
  "Rautela Khola (Bishnu Tole)": [
    { name: "Support Clinic", type: "Health", lat: 29.0035, lng: 80.2045 },
    { name: "Ward Office", type: "Social", lat: 29.0022, lng: 80.2032 }
  ],
  "Sangharshanagar": [
    { name: "Primary Clinic", type: "Health", lat: 28.4205, lng: 81.0822 },
    { name: "Hydrant Point", type: "Water", lat: 28.4188, lng: 81.0805 }
  ],
  "Sankatti": [
    { name: "Village Health Center", type: "Health", lat: 28.5088, lng: 81.1722 },
    { name: "Tube Well", type: "Water", lat: 28.5075, lng: 81.1708 }
  ],
  "Sano Bikree": [
    { name: "Health Clinic", type: "Health", lat: 28.2285, lng: 81.3822 },
    { name: "Market Area", type: "Economy", lat: 28.2272, lng: 81.3808 }
  ],

//SONAHA GAUN
 "Sonaha Gaun": [
  { name: "East Border", type: "Extent", lat: 28.5086, lng: 81.1853747, notes: "East Border - Shantibazar" },
  { name: "West Border", type: "Extent", lat: 28.5147892, lng: 81.1692009, notes: "West border of community - Karnali River and Jali Embankment Dam" },
  { name: "North Border", type: "Extent", lat: 28.5155921, lng: 81.1826196, notes: "North Point of Community - Khuttehana Community" },
  { name: "South Border", type: "Extent", lat: 28.5110537, lng: 81.1726015, notes: "South Point of Community - Sankatti community" },
  { name: "Culvert", type: "Infrastructures", lat: 28.5086235, lng: 81.1854071, notes: "Construction: 2075 B.S., Length: 8m, Width: 6m, Height: 4ft, Box Culvert over Bankatti Kulo" },
  { name: "Culvert", type: "Infrastructures", lat: 28.5096071, lng: 81.1836275, notes: "Construction: 2074 B.S., Length: 5m, Width: 6m, Height: 5ft, Culvert over Bhadli Kulo" },
  { name: "Culvert", type: "Infrastructures", lat: 28.5102126, lng: 81.1826659, notes: "Construction: 2078 B.S., Length: 20m, Width: 11.5m, Height: 3ft, Box Culvert over Shelu Kulo" },
  { name: "Culvert", type: "Infrastructures", lat: 28.5126649, lng: 81.178915, notes: "Construction: 2075 B.S., Length: 8m, Width: 4m, Height: 4ft, Culvert over Tihuni Kulo" },
  { name: "Culvert", type: "Infrastructures", lat: 28.5133058, lng: 81.1785204, notes: "Construction: 2075 B.S., Length: 8m, Width: 4m, Height: 4ft, Culvert over Juru Kulo" },
  { name: "Panfekuwa", type: "Infrastructures", lat: 28.512869, lng: 81.175558, notes: "Construction: 2078 B.S., Length: 6m, Width: 2.5m, 25m Gabion Wall, Panfekuwa in Juru Kulo" },
  { name: "Culvert", type: "Infrastructures", lat: 28.5137185, lng: 81.173512, notes: "Construction: 2078 B.S., Length: 8m, Width: 8m, Culvert and Panfekuwa in Jhanra Kulo" },
  { name: "Public Shade", type: "Infrastructures", lat: 28.5122288, lng: 81.17741, notes: "Construction: 2081 B.S., Capacity: 15 people, Pratikshalaya" },
  { name: "Health Clinic", type: "Health", lat: 28.5125672, lng: 81.1789198, notes: "Health Clinic Building, Construction: 2074 B.S., 2 Storey building with capacity (Ground: 50 people, First: 75 people)" },
  { name: "Kali Temple", type: "Temple", lat: 28.5135375, lng: 81.1824071, notes: "Kali Temple, Construction: 2076 B.S., 1 Storey, Total Area: 15 Kattha" },
  { name: "Krishna Temple", type: "Temple", lat: 28.5108315, lng: 81.178452, notes: "Krishna Temple, Construction: 2081 B.S., 1 Storey with tin roof, Total Area: 3 Kattha, Elevation: 175.86m" },
  { name: "Mamta Buffer Community Forest", type: "Forest", lat: 28.5151311, lng: 81.1696442, notes: "Established: 2042 B.S., 18 Ropani, 204 households, Mamta Buffer Community Forest, Flora found: Sisau, Salla, Khayar, etc." },
  { name: "Miten Kirana Shop", type: "Business", lat: 28.5096025, lng: 81.1836525, notes: "Retail shop for groceries" },
  { name: "Jitram Kirana Shop", type: "Business", lat: 28.5139526, lng: 81.182112, notes: "Retail shop for groceries" },
  { name: "Road", type: "Infrastructure", lat: 28.5086132, lng: 81.1853747, notes: "Construction: 2081 B.S., Length: 450m, Width: 10m, Black topped road" },
  { name: "Road", type: "Road", lat: 28.5123358, lng: 81.1800581, notes: "Width: 6m, local community road, Gravel road" },
  { name: "Road", type: "Road", lat: 28.5110537, lng: 81.1726015, notes: "Width: 6m, Connects Shonaha Gau to Sankatti, Earthen road" },
  { name: "Road", type: "Road", lat: 28.5126649, lng: 81.178915, notes: "Length: 2,000m, Width: 6m, Community Forest Road" },
  { name: "CDMC Chairperson House", type: "Settlement", lat: 28.5120668, lng: 81.1779143, notes: "Chairperson: Ram Autar Tharu (9844891484)" },
  { name: "FCHV House", type: "Settlement", lat: 28.5109122, lng: 81.1785581, notes: "FCHV Woman: Nani Kumari Tharu (9855056996)" }
],

//SHREELANKA
  "Shreelanka": [
    { name: "Clinic", type: "Health", lat: 28.4068, lng: 81.0585 },
    { name: "Primary School", type: "Education", lat: 28.4055, lng: 81.0572 }
  ],
  "Simari": [
    { name: "Community Clinic", type: "Health", lat: 28.6675, lng: 80.4752 },
    { name: "Water Well", type: "Water", lat: 28.6662, lng: 80.4735 }
  ],
  "Sonaha": [
    { name: "Primary Health Unit", type: "Health", lat: 28.3798, lng: 81.2365 },
    { name: "Market Area", type: "Economy", lat: 28.3785, lng: 81.2348 }
  ],

//TEDIYA
"Tediya": [
  { name: "South Border", type: "Extent", lat: 28.435221, lng: 81.097684, notes: "South Border of Tediya Community, Khaddhyanna Byawasthapan Tatha Bepar Company" },
  { name: "Ashik Motor Cycle Repair Center", type: "Business", lat: 28.435187, lng: 81.097704, notes: "Motorcycle repair center, Daily 15-20 vehicles, 4 workers" },
  { name: "Bhagoriya Restaurant", type: "Business", lat: 28.436696, lng: 81.098708, notes: "2 Storey building with 6 rooms, Restaurant serving up to 15 people at a time" },
  { name: "Swostik Traders", type: "Business", lat: 28.436686, lng: 81.098697, notes: "2 Storey building, Stationery, photocopy and grocery shop" },
  { name: "Janata Auto Mobile Center", type: "Business", lat: 28.437405, lng: 81.099355, notes: "Vehicle repair and maintenance service" },
  { name: "Shree Bindeswori Cooperative Ltd.", type: "Institution", lat: 28.437959, lng: 81.099748, notes: "1 Storey building, Savings & Credit Cooperative with more than 500 members" },
  { name: "Huma Medical", type: "Health", lat: 28.438203, lng: 81.100004, notes: "1 Storey building, Daily clinic service with 3 beds" },
  { name: "B.AND B Traders", type: "Business", lat: 28.438209, lng: 81.100004, notes: "Hardware and construction materials shop, 1 Storey building" },
  { name: "Culvert (Dhumri Kulo)", type: "Infrastructure", lat: 28.438921, lng: 81.107501, notes: "Construction: 2082 B.S., Length: 8m, Width: 4m, Height: 2.5m, on Muraiya - Khenuwapur Road" },
  { name: "Chiura Mill and Company", type: "Business", lat: 28.439274, lng: 81.104865, notes: "2 Storey building, Rice flakes (Chiura) mill" },
  { name: "Ward Office Road", type: "Road", lat: 28.439641, lng: 81.103101, notes: "12m wide gravel road from Star Point to Ward Office, Length: 500m" },
  { name: "Tharu Deuthan Temple", type: "Temple", lat: 28.438996, lng: 81.101956, notes: "Tharu Community Deuthan Temple" },
  { name: "Culvert (Near Shri Nepal Rastriya Aadharbhut School)", type: "Infrastructure", lat: 28.439183, lng: 81.100666, notes: "Length: 12m, Width: 6m, Height: 1.5m" },
  { name: "Uttar Chowk", type: "Chowk", lat: 28.439381, lng: 81.100722, notes: "Northern Chowk of Tediya" },
  { name: "Shree Nepal Rastriya Aadharbhut School", type: "Education", lat: 28.440202, lng: 81.101083, notes: "4 buildings (2 single storey + 1 double storey), 175 students, 13 teachers" },
  { name: "Pitch Road (Geruwa Main Road)", type: "Road", lat: 28.441104, lng: 81.101094, notes: "12m wide Blacktopped Road connecting to Geruwa" },
  { name: "River Side Restaurant and Hotel", type: "Business", lat: 28.442069, lng: 81.10145, notes: "3 Storey building with restaurant & hotel, Established 2084 B.S., Capacity 150 people" },
  { name: "Shree Sai Baba Rice Mill", type: "Business", lat: 28.442297, lng: 81.101508, notes: "Rice mill with tin roof" },
  { name: "North Border", type: "Extent", lat: 28.444707, lng: 81.102097, notes: "North Border Chowk of Tediya - Chakkhapur Community" },
  { name: "Raised Hand Pump", type: "Infrastructure", lat: 28.445535, lng: 81.095286, notes: "Depth: 30ft, Serves 15 households, housed in a house of Kalpana Tharu" },
  { name: "Road", type: "Road", lat: 28.445559, lng: 81.09498, notes: "6m wide gravel road, Length: 150m, Way to Nursery Tole" },
  { name: "Ranjit Kirana Pasal", type: "Business", lat: 28.443836, lng: 81.095788, notes: "Grocery shop" },
  { name: "Raised Hand Pump", type: "Infrastructure", lat: 28.444099, lng: 81.096303, notes: "Depth: 30ft, Serves 25 households, housed in a house of  Sunita Tharu" },
  { name: "CDMC Chairperson House", type: "Settlement", lat: 28.444203, lng: 81.09637, notes: "Chairperson: Man Bahadur Tharu" },
  { name: "CDMC Secretary House", type: "Settlement", lat: 28.444058, lng: 81.096289, notes: "Secretary: Anita Chaudhary (9855055298)" },
  { name: "Road", type: "Road", lat: 28.444015, lng: 81.09626, notes: "6m wide earthen/gravel road to Karnali River, Length: 200m, way to Nursery Tole" },
  { name: "West Border", type: "Extent", lat: 28.444564, lng: 81.091776, notes: "Karnali River bank with 500m Embankment" },
  { name: "Road", type: "Road", lat: 28.443678, lng: 81.092778, notes: "20m wide road through jungle to Karnali River, Length: 500m" },
  { name: "Culvert", type: "Infrastructure", lat: 28.442745, lng: 81.096059, notes: "Length: 8m, Width: 6m, Height: 3.5m, near Laaliguras Community Forest)" },
  { name: "Public Shade", type: "Infrastructures", lat: 28.442694, lng: 81.095693, notes: "Public waiting shade, Community Pratikshalaya, Capacity: 20-25 people" },
  { name: "Road", type: "Road", lat: 28.441723, lng: 81.097408, notes: "Gravel road to Stadium" },
  { name: "Christian Building", type: "Institution", lat: 28.441279, lng: 81.097624, notes: "1 Storey building, Capacity: 50-60 people" },
  { name: "Stadium", type: "Infrastructures", lat: 28.441125, lng: 81.097894, notes: "Community ground, Area: 4 Ropani" },
  { name: "Road", type: "Road", lat: 28.439621, lng: 81.098978, notes: "10m wide blacktopped road, Length: 300m, Black topped road, Dakshin Tole to Stadium" },
  { name: "Badghar House", type: "Settlement", lat: 28.439859, lng: 81.099577, notes: "Badghar: Ram Swarup Tharu" },
  { name: "FCHV House", type: "Settlement", lat: 28.440324, lng: 81.100195, notes: "FCHV: Sadhana Tharu" },
  { name: "Road", type: "Road", lat: 28.439601, lng: 81.099516, notes: "6m wide gravel road, Length: 200m, way to Barka Purwa Tole" },
  { name: "Health Clinic", type: "Health", lat: 28.439375, lng: 81.099683, notes: "Construction: 2086 B.S., Capacity: 35-40 people" },
  { name: "Raised Hand Pump", type: "Infrastructure", lat: 28.439007, lng: 81.099701, notes: "Depth: 30ft, Serves 55 households" },
  { name: "Shree Baiddhnath Temple", type: "Temple", lat: 28.439007, lng: 81.099478, notes: "1 Storey temple, Area: 15 Kattha" },
  { name: "Deuthan Temple", type: "Temple", lat: 28.438998, lng: 81.099651, notes: "Deuthan Temple in Dakshin Tole" },
  { name: "Tribeni Chowk", type: "Chowk", lat: 28.438754, lng: 81.100341, notes: "Tribeni Chowk" },
  { name: "Jiwan Uddhwar Bangur Meat Center", type: "Business", lat: 28.438526, lng: 81.1003, notes: "Meat shop" },
  { name: "Culvert", type: "Culvert", lat: 28.438506, lng: 81.100374, notes: "Construction: 2082 B.S., Length: 8m, Width: 6m, Height: 4m, Over Murkatta Kulo" },
  { name: "Gondhana Pond", type: "Infrastructure", lat: 28.437329, lng: 81.101838, notes: "Pond with 500m gravel road access, Established 2081 B.S." },
  { name: "Bhimmapur Kulo", type: "Infrastructure", lat: 28.435287, lng: 81.10475, notes: "Irrigation canal serving 650 Ropani land" },
  { name: "Gondhana Pond", type: "Water Body", lat: 28.435014, lng: 81.105821, notes: "Area: 2 Ropani, Depth: 20-25m, Serves 365 households" },
  { name: "Sworojgar Laghubitta Bittiya Sanstha", type: "Institution", lat: 28.438909, lng: 81.10048, notes: "Microfinance institution with 400+ members" },
  { name: "Uttar Chowk", type: "Chowk", lat: 28.439075, lng: 81.100576, notes: "Uttar Chowk" },
  { name: "Charna Bathuwa Fresh House", type: "Business", lat: 28.4391, lng: 81.10069, notes: "Fresh meat shop" },
  { name: "Shanti Dahit Shop", type: "Business", lat: 28.439111, lng: 81.100657, notes: "Utensils and household items shop" },
  { name: "Jay Laxmi Traders", type: "Business", lat: 28.437752, lng: 81.099674, notes: "Hardware and construction materials" },
  { name: "Laxmi Grill Uddhog", type: "Business", lat: 28.437352, lng: 81.099397, notes: "Grill and fabrication workshop" },
  { name: "Laxmi Laghubitta Bittiya Sanstha", type: "Institution", lat: 28.437352, lng: 81.099396, notes: "Microfinance, 2 Storey building, 450+ members" },
  { name: "Dipak Motor Cycle Servicing Center", type: "Business", lat: 28.437073, lng: 81.099251, notes: "Motorcycle service center" },
  { name: "Rosika Traders", type: "Business", lat: 28.436732, lng: 81.098937, notes: "Grocery and household items shop" },
  { name: "Robin Hotel", type: "Business", lat: 28.436545, lng: 81.0986, notes: "2 Storey hotel & restaurant, Capacity: 20-25 people" }
],

//THAPUWA
  "Thapuwa": [
    { name: "Village Health Center", type: "Health", lat: 28.1772, lng: 81.3642 },
    { name: "Hydrant point", type: "Water", lat: 28.1758, lng: 81.3625 }
  ],
  "Tigra": [
    { name: "Emergency Clinic", type: "Health", lat: 28.4515, lng: 81.1068 },
    { name: "Water Well", type: "Water", lat: 28.4502, lng: 81.1052 }
  ],
"Tihuni": [
  { name: "North Border", type: "Extent", lat: 28.4956456, lng: 81.1634219, notes: "North Border, Bankatti" },
  { name: "West Border", type: "Extent", lat: 28.4955436, lng: 81.1593271, notes: "West Border, Karnali River" },
  { name: "East Border", type: "Extent", lat: 28.4924192, lng: 81.1632815, notes: "East Border, Kotharpur" },
  { name: "South Border", type: "Extent", lat: 28.4883257, lng: 81.1529129, notes: "South Border, Himalipur" },
  { name: "Kalika Temple", type: "Temple", lat: 28.4937552, lng: 81.1598813, notes: "Established: 2075 B.S., 1 Storey Temple, Land Area: 1 Kattha" },
  { name: "Community Forest Building", type: "Institution", lat: 28.4937499, lng: 81.1605117, notes: "1 Storey Building, Capacity: 100 people, Land Area: 2 Kattha" },
  { name: "Culvert", type: "Infrastructures", lat: 28.4924192, lng: 81.1632815, notes: "Constrution: 2054 B.S., Length: 8m, Width: 6m, Height: 3m, Over Bhadali Kulo" },
  { name: "Culvert", type: "Infrastructures", lat: 28.4901947, lng: 81.1619223, notes: "Constrution: 2056 B.S., Length: 26m, Width: 10m, Height: 4m, Over Bhadali Kulo" },
  { name: "Bhadali Kulo", type: "Infrastructures", lat: 28.4901947, lng: 81.1619223, notes: "Irrigated Land Area: 25 Bigha" },
  { name: "Culvert", type: "Infrastructures", lat: 28.4918001, lng: 81.1621052, notes: "Constrution: 2081 B.S., Length: 10m, Width: 3m, Height: 0.6m, Over Gaule Kulo" },
  { name: "Doriya Kulo", type: "Infrastructures", lat: 28.4939377, lng: 81.1614131, notes: "Irrigated Land Area: 40 Bigha" },
  { name: "Road", type: "Infrastructures", lat: 28.4930181, lng: 81.1623833, notes: "Width: 6m, Connects Chautara and Jhabahi, Gravel Road" },
  { name: "Road", type: "Infrastructures", lat: 28.4956456, lng: 81.1634219, notes: "Width: 10m, Connects to Geruwa - Rajapur Road, Black Topped" },
  { name: "Devithan Temple", type: "Temple", lat: 28.4902086, lng: 81.1618377, notes: "Construction: 2076 B.S., Concrete Structure" },
  { name: "Badghar House", type: "Settlement", lat: 28.4914585, lng: 81.1618649, notes: "Badghar: Keshar Ram Tharu (9844837285)" },
  { name: "CDMC Chairperson House", type: "Settlement", lat: 28.4937483, lng: 81.1606876, notes: "Chairperson: Sita Kumari Tharu (9866813003)" },
  { name: "FCHV House", type: "Settlement", lat: 28.4935957, lng: 81.162961, notes: "Ful Kumari Tharu (9825549998)" },
  { name: "Bhaura Tappa Hotel and Homestay", type: "Business", lat: 28.4937517, lng: 81.1594644, notes: "Construction: 2080 B.S., Capacity: 150 people, Full-time Staff: 3" },
  { name: "Pipal Chautara Chowk and Pratikshalaya", type: "Infrastructures", lat: 28.4929586, lng: 81.1622805, notes: "G.I Sheet and Wooden Transit Shade, Capacity: 15 people" },
  { name: "Tihuni Chowk", type: "Chowk", lat: 28.4939377, lng: 81.1606106, notes: "Tihuni Chowk" },
  { name: "OPS Traders", type: "Business", lat: 28.4939377, lng: 81.1606106, notes: "Retail seller of regular household items" },
  { name: "Irrigation Canal", type: "Infrastructures", lat: 28.4891418, lng: 81.1606106, notes: "Construction: 2046 B.S., Length: 500m, Irrigated Land Area: 10 Bigha" },
  { name: "Karasar Ltd", type: "Business", lat: 28.492722, lng: 81.1574819, notes: "Established: 2082 B.S." }
],
  "Tilki": [
    { name: "Village Health center", type: "Health", lat: 28.8158, lng: 80.3748 },
    { name: "School", type: "Education", lat: 28.8145, lng: 80.3732 }
  ],
  "Udayapur": [
    { name: "Rural clinic", type: "Health", lat: 28.7342, lng: 80.3888 },
    { name: "Support hub", type: "Social", lat: 28.7328, lng: 80.3872 }
  ]
};
