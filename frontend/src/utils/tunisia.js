// Tunisia's 24 gouvernements with their major cities/delegations

export const TUNISIA_GOUVERNEMENTS = [
  {
    name: "Ariana",
    cities: ["Ariana", "Ettadhamen", "La Soukra", "Raoued", "Kalaat el-Andalous", "Sidi Thabet", "Borj el-Amri"],
  },
  {
    name: "Béja",
    cities: ["Béja", "Amdoun", "Nefza", "Téboursouk", "Testour", "Goubellat", "Thibar", "Medjez el-Bab"],
  },
  {
    name: "Ben Arous",
    cities: ["Ben Arous", "Bou Mhel el-Bassatine", "El Mourouj", "Ezzahra", "Fouchana", "Hammam Chott", "Hammam Lif", "Mégrine", "Mohamedia", "Radès", "Mornag"],
  },
  {
    name: "Bizerte",
    cities: ["Bizerte", "El Haouaria", "Ghar El Melh", "Ghezala", "Joumine", "Mateur", "Menzel Bourguiba", "Menzel Jemil", "Ras Jebel", "Sejnane", "Tinja", "Utique"],
  },
  {
    name: "Gabès",
    cities: ["Gabès", "El Hamma", "Ghannouch", "Mareth", "Matmata", "Métouia", "Nouvelle Matmata", "Sidi Aich", "Menzel el-Habib"],
  },
  {
    name: "Gafsa",
    cities: ["Gafsa", "Belkhir", "El Guettar", "El Ksar", "Mdhilla", "Métlaoui", "Moularès", "Redeyef", "Sned"],
  },
  {
    name: "Jendouba",
    cities: ["Jendouba", "Aïn Draham", "Bou Salem", "Fernana", "Ghardimaou", "Oued Meliz", "Tabarka"],
  },
  {
    name: "Kairouan",
    cities: ["Kairouan", "Alaa", "Bouhajla", "El Oueslatia", "Haffouz", "Hajeb El Aoun", "Nasrallah", "Sbikha"],
  },
  {
    name: "Kasserine",
    cities: ["Kasserine", "Feriana", "Foussana", "Haïdra", "Jediliane", "Majel Bel Abbès", "Sbeitla", "Thélepte"],
  },
  {
    name: "Kébili",
    cities: ["Kébili", "Douz", "El Faouar", "Souk El Ahed"],
  },
  {
    name: "Le Kef",
    cities: ["Le Kef", "Dahmani", "El Ksour", "Jerissa", "Kalaat Senan", "Kalaat Khasba", "Nebeur", "Sakiet Sidi Youssef", "Sers", "Tajerouine"],
  },
  {
    name: "Mahdia",
    cities: ["Mahdia", "Bou Merdes", "Chebba", "Chorbane", "El Jem", "Essouassi", "Hébira", "Ksour Essef", "Melloulèche", "Ouled Chamekh", "Sidi Alouane"],
  },
  {
    name: "La Manouba",
    cities: ["La Manouba", "Douar Hicher", "El Battan", "Jedaïda", "La Mornaguia", "Oued Ellil", "Tebourba", "Den Den"],
  },
  {
    name: "Médenine",
    cities: ["Médenine", "Ben Gardane", "Beni Khedache", "Bou Ghrara", "Djerba - Houmt Souk", "Djerba - Midoun", "Djerba - Ajim", "Sidi Makhlouf", "Zarzis"],
  },
  {
    name: "Monastir",
    cities: ["Monastir", "Bembla", "Beni Hassen", "Jemmal", "Ksar Hellal", "Ouerdanine", "Sahline", "Sayada-Lamta-Bou Hajar", "Téboulba", "Zeramdine"],
  },
  {
    name: "Nabeul",
    cities: ["Nabeul", "Beni Khalled", "Bou Argoub", "Dar Chaabane El Fehri", "El Haouaria", "Grombalia", "Hammamet", "Kelibia", "Korba", "Menzel Bouzelfa", "Menzel Temime", "Soliman", "Takelsa"],
  },
  {
    name: "Sfax",
    cities: ["Sfax", "Agareb", "Bir Ali Ben Khalifa", "Djebeniana", "El Amra", "El Ghraiba", "El Hencha", "Graïba", "Kerkennah", "Mahres", "Menzel Chaker", "Sakiet Eddaier", "Sakiet Ezzit", "Skhira"],
  },
  {
    name: "Sidi Bouzid",
    cities: ["Sidi Bouzid", "Bir El Hafey", "Jilma", "Mazzouna", "Meknassy", "Menzel Bouzaiane", "Ouled Haffouz", "Regueb", "Sidi Ali Ben Aoun"],
  },
  {
    name: "Siliana",
    cities: ["Siliana", "Bargou", "El Aroussa", "Gaafour", "Krib", "Makthar", "Rohia", "Sidi Bou Rouis"],
  },
  {
    name: "Sousse",
    cities: ["Sousse", "Akouda", "Bou Ficha", "Enfidha", "Hammam Sousse", "Hergla", "Kalaa Kebira", "Kalaa Seghira", "Kondar", "M'Saken", "Sidi Bou Ali", "Sidi El Hani"],
  },
  {
    name: "Tataouine",
    cities: ["Tataouine", "Bir Lahmar", "Dehiba", "Ghomrassen", "Remada", "Smar"],
  },
  {
    name: "Tozeur",
    cities: ["Tozeur", "Degache", "El Hamma du Jerid", "Hazoua", "Nefta", "Tameghza"],
  },
  {
    name: "Tunis",
    cities: ["Tunis", "Bab Bhar", "Bab Souika", "Carthage", "El Kabaria", "El Menzah", "El Omrane", "El Omrane Supérieur", "Ezzitouna", "La Goulette", "La Marsa", "Le Bardo", "Sijoumi"],
  },
  {
    name: "Zaghouan",
    cities: ["Zaghouan", "Bir Mcherga", "El Fahs", "Nadhour", "Saouaf", "Zriba"],
  },
];

// Map from gouvernement name to list of cities
export const CITIES_BY_GOUVERNEMENT = Object.fromEntries(
  TUNISIA_GOUVERNEMENTS.map((g) => [g.name, g.cities])
);

// Tunisia map bounds for Leaflet
export const TUNISIA_BOUNDS = [
  [30.24, 7.52], // SW
  [37.54, 11.60], // NE
];

// Tunisia center coordinates
export const TUNISIA_CENTER = [33.8, 9.5];
