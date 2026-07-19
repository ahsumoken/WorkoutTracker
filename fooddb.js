// Voedseldatabase — uit VOEDSELDATABASE.xlsx. "(geschat)" = nog checken tegen verpakking.
const FOOD_DB = [
 {
  "product": "AH Clear Whey citroen-limoen",
  "hoeveelheid": "25g (1 scoop)",
  "kcal": 87,
  "eiwit": "21g",
  "koolh": "0,3g",
  "vet": "0,3g"
 },
 {
  "product": "Dr. Oetker kaneel havermout",
  "hoeveelheid": "30g (1 zakje)",
  "kcal": 112,
  "eiwit": "3g",
  "koolh": "19g",
  "vet": "3g"
 },
 {
  "product": "Halfvolle melk",
  "hoeveelheid": "100ml",
  "kcal": 46,
  "eiwit": "3,2g",
  "koolh": "4,8g",
  "vet": "1,7g"
 },
 {
  "product": "Banaan medium",
  "hoeveelheid": "~120g",
  "kcal": 107,
  "eiwit": "1,3g",
  "koolh": "27g",
  "vet": "0,4g"
 },
 {
  "product": "Magere kwark",
  "hoeveelheid": "100g",
  "kcal": 57,
  "eiwit": "10g",
  "koolh": "4g",
  "vet": "0,2g"
 },
 {
  "product": "Arla Skyr kokos",
  "hoeveelheid": "100g",
  "kcal": 71,
  "eiwit": "8,6g",
  "koolh": "8g",
  "vet": "0,5g"
 },
 {
  "product": "AH Biologisch Yoghurt Griekse stijl 10% vet",
  "hoeveelheid": "100g",
  "kcal": 128,
  "eiwit": "4,5g",
  "koolh": "5g",
  "vet": "10g"
 },
 {
  "product": "Kipfilet",
  "hoeveelheid": "100g",
  "kcal": 110,
  "eiwit": "23g",
  "koolh": "0g",
  "vet": "2g"
 },
 {
  "product": "AH Scharrel Kip Shoarma (650g verpakking)",
  "hoeveelheid": "100g",
  "kcal": 118,
  "eiwit": "22g",
  "koolh": "1,5g",
  "vet": "5,5g"
 },
 {
  "product": "Rundertartaar",
  "hoeveelheid": "100g",
  "kcal": 180,
  "eiwit": "18g",
  "koolh": "0g",
  "vet": "12g"
 },
 {
  "product": "Mager rundergehakt",
  "hoeveelheid": "100g",
  "kcal": 150,
  "eiwit": "20g",
  "koolh": "0g",
  "vet": "8g"
 },
 {
  "product": "Princes Tonijn in water",
  "hoeveelheid": "160g (1 blik)",
  "kcal": 152,
  "eiwit": "35g",
  "koolh": "0g",
  "vet": "1,6g"
 },
 {
  "product": "AH Serranoham (portie 20g)",
  "hoeveelheid": "100g",
  "kcal": 236,
  "eiwit": "32g",
  "koolh": "0,1g",
  "vet": "12g"
 },
 {
  "product": "AH Filet American minder vet",
  "hoeveelheid": "100g",
  "kcal": 175,
  "eiwit": "12g",
  "koolh": "0,5g",
  "vet": "14g"
 },
 {
  "product": "Pastrami",
  "hoeveelheid": "100g",
  "kcal": 120,
  "eiwit": "20g",
  "koolh": "0g",
  "vet": "4g"
 },
 {
  "product": "Aldi Kipnuggets diepvries",
  "hoeveelheid": "100g",
  "kcal": 245,
  "eiwit": "15,2g",
  "koolh": "11,1g",
  "vet": "16g"
 },
 {
  "product": "Rijst droog",
  "hoeveelheid": "75g",
  "kcal": 270,
  "eiwit": "5,6g",
  "koolh": "60g",
  "vet": "0,6g"
 },
 {
  "product": "Aardappelen gekookt",
  "hoeveelheid": "200g",
  "kcal": 154,
  "eiwit": "4g",
  "koolh": "34g",
  "vet": "0,2g"
 },
 {
  "product": "Volkoren wrap",
  "hoeveelheid": "1 stuk (~45g)",
  "kcal": 140,
  "eiwit": "4g",
  "koolh": "24g",
  "vet": "3g"
 },
 {
  "product": "Waldkorn half boterham",
  "hoeveelheid": "1 snee (~35g)",
  "kcal": 70,
  "eiwit": "3g",
  "koolh": "14g",
  "vet": "1g"
 },
 {
  "product": "Rijstwafel",
  "hoeveelheid": "1 stuk (~9g)",
  "kcal": 35,
  "eiwit": "0,7g",
  "koolh": "7,5g",
  "vet": "0,3g"
 },
 {
  "product": "AH Roerbakgroente Italiaans champignons",
  "hoeveelheid": "100g",
  "kcal": 25,
  "eiwit": "1,5g",
  "koolh": "3g",
  "vet": "0,5g"
 },
 {
  "product": "Paprika rauw",
  "hoeveelheid": "100g",
  "kcal": 31,
  "eiwit": "1g",
  "koolh": "6g",
  "vet": "0,3g"
 },
 {
  "product": "Lay's Sensations Mexican Peppers & Cream",
  "hoeveelheid": "150g (heel zakje)",
  "kcal": 735,
  "eiwit": "9,8g",
  "koolh": "84g",
  "vet": "37,5g"
 },
 {
  "product": "AH Cashewnoten Katsu Curry",
  "hoeveelheid": "100g",
  "kcal": 580,
  "eiwit": "15g",
  "koolh": "27g",
  "vet": "41g"
 },
 {
  "product": "McVitie's Digestive Melkchocolade",
  "hoeveelheid": "1 koekje (~17g)",
  "kcal": 84,
  "eiwit": "1g",
  "koolh": "11g",
  "vet": "4g"
 },
 {
  "product": "AH Stoommaaltijd Penne Pollo",
  "hoeveelheid": "100g (verpakking 450g)",
  "kcal": 96,
  "eiwit": "7,8g",
  "koolh": "8,7g",
  "vet": "2,9g"
 },
 {
  "product": "Aviko Rösti rondjes bacon ui",
  "hoeveelheid": "100g (advies 4 rondjes)",
  "kcal": 176,
  "eiwit": "3g",
  "koolh": "22g",
  "vet": "7g"
 },
 {
  "product": "Nigiri zalm",
  "hoeveelheid": "1 stuk",
  "kcal": 56,
  "eiwit": "1,8g",
  "koolh": "9g",
  "vet": "0,4g"
 },
 {
  "product": "Nigiri tonijn",
  "hoeveelheid": "1 stuk",
  "kcal": 46,
  "eiwit": "2g",
  "koolh": "9g",
  "vet": "0,2g"
 },
 {
  "product": "Maki zalm",
  "hoeveelheid": "1 stuk",
  "kcal": 28,
  "eiwit": "1g",
  "koolh": "5g",
  "vet": "0,23g"
 },
 {
  "product": "Maki tonijn",
  "hoeveelheid": "1 stuk",
  "kcal": 42,
  "eiwit": "2g",
  "koolh": "9g",
  "vet": "0,13g"
 },
 {
  "product": "Broodje gezond (keurslager)",
  "hoeveelheid": "1 broodje",
  "kcal": 515,
  "eiwit": "24g",
  "koolh": "61g",
  "vet": "18g"
 },
 {
  "product": "Broodje filet american + uitjes (keurslager)",
  "hoeveelheid": "1 broodje",
  "kcal": 258,
  "eiwit": "13g",
  "koolh": "28g",
  "vet": "9g"
 },
 {
  "product": "MyProtein Slow-Release Caseine (naturel)",
  "hoeveelheid": "30g (1 scoop)",
  "kcal": 107,
  "eiwit": "23g",
  "koolh": "1,2g",
  "vet": "0,5g"
 },
 {
  "product": "Skyr-eiwitschaaltje (250g skyr + 1 scoop AH whey + 1 scoop caseine)",
  "hoeveelheid": "~305g",
  "kcal": 372,
  "eiwit": "65,5g",
  "koolh": "21,5g",
  "vet": "2g"
 },
 {
  "product": "Biefstuk mager (geschat)",
  "hoeveelheid": "100g",
  "kcal": 125,
  "eiwit": "21g",
  "koolh": "0g",
  "vet": "4g"
 },
 {
  "product": "Kalkoenfilet vers (geschat)",
  "hoeveelheid": "100g",
  "kcal": 105,
  "eiwit": "24g",
  "koolh": "0g",
  "vet": "1,5g"
 },
 {
  "product": "Zalmfilet (geschat, vetrijk!)",
  "hoeveelheid": "100g",
  "kcal": 208,
  "eiwit": "20g",
  "koolh": "0g",
  "vet": "13g"
 },
 {
  "product": "Eiwit los, ei (geschat)",
  "hoeveelheid": "100g",
  "kcal": 52,
  "eiwit": "11g",
  "koolh": "0,7g",
  "vet": "0,2g"
 },
 {
  "product": "Magere huttenkase/cottage cheese (geschat)",
  "hoeveelheid": "100g",
  "kcal": 72,
  "eiwit": "12g",
  "koolh": "3g",
  "vet": "1,5g"
 },
 {
  "product": "Broccoli (geschat)",
  "hoeveelheid": "100g",
  "kcal": 34,
  "eiwit": "2,8g",
  "koolh": "7g",
  "vet": "0,4g"
 },
 {
  "product": "Sperziebonen (geschat)",
  "hoeveelheid": "100g",
  "kcal": 31,
  "eiwit": "1,8g",
  "koolh": "7g",
  "vet": "0,2g"
 },
 {
  "product": "Bloemkool (geschat)",
  "hoeveelheid": "100g",
  "kcal": 25,
  "eiwit": "1,9g",
  "koolh": "5g",
  "vet": "0,3g"
 },
 {
  "product": "Spinazie (geschat)",
  "hoeveelheid": "100g",
  "kcal": 23,
  "eiwit": "2,9g",
  "koolh": "3,6g",
  "vet": "0,4g"
 },
 {
  "product": "Courgette (geschat)",
  "hoeveelheid": "100g",
  "kcal": 17,
  "eiwit": "1,2g",
  "koolh": "3g",
  "vet": "0,3g"
 },
 {
  "product": "Wortel (geschat)",
  "hoeveelheid": "100g",
  "kcal": 41,
  "eiwit": "0,9g",
  "koolh": "10g",
  "vet": "0,2g"
 },
 {
  "product": "Sla/komkommer/tomaat rauwkost (geschat)",
  "hoeveelheid": "100g",
  "kcal": 18,
  "eiwit": "1g",
  "koolh": "3g",
  "vet": "0,2g"
 }
];
