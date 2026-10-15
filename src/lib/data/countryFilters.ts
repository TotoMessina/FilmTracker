// Country and Actor filtering constants and helpers
import { PASSPORT_COUNTRIES, countryName, countryFlag } from "@/lib/services/cineMap";

export interface CountryActor {
  id: number;
  name: string;
  profile_path: string | null;
  known_for?: string[];
  popularity?: number;
}

export interface CountryInfo {
  code: string;
  name: string;
  flag: string;
}

export const POPULAR_ORIGIN_COUNTRIES: CountryInfo[] = [
  {
    "code": "AR",
    "name": "Argentina",
    "flag": "🇦🇷"
  },
  {
    "code": "ES",
    "name": "España",
    "flag": "🇪🇸"
  },
  {
    "code": "US",
    "name": "Estados Unidos",
    "flag": "🇺🇸"
  },
  {
    "code": "MX",
    "name": "México",
    "flag": "🇲🇽"
  },
  {
    "code": "FR",
    "name": "Francia",
    "flag": "🇫🇷"
  },
  {
    "code": "GB",
    "name": "Reino Unido",
    "flag": "🇬🇧"
  },
  {
    "code": "KR",
    "name": "Corea del Sur",
    "flag": "🇰🇷"
  },
  {
    "code": "JP",
    "name": "Japón",
    "flag": "🇯🇵"
  },
  {
    "code": "IT",
    "name": "Italia",
    "flag": "🇮🇹"
  },
  {
    "code": "DE",
    "name": "Alemania",
    "flag": "🇩🇪"
  },
  {
    "code": "BR",
    "name": "Brasil",
    "flag": "🇧🇷"
  },
  {
    "code": "CO",
    "name": "Colombia",
    "flag": "🇨🇴"
  },
  {
    "code": "CL",
    "name": "Chile",
    "flag": "🇨🇱"
  },
  {
    "code": "UY",
    "name": "Uruguay",
    "flag": "🇺🇾"
  },
  {
    "code": "IE",
    "name": "Irlanda",
    "flag": "🇮🇪"
  },
  {
    "code": "AU",
    "name": "Australia",
    "flag": "🇦🇺"
  },
  {
    "code": "CA",
    "name": "Canadá",
    "flag": "🇨🇦"
  },
  {
    "code": "IN",
    "name": "India",
    "flag": "🇮🇳"
  },
  {
    "code": "DK",
    "name": "Dinamarca",
    "flag": "🇩🇰"
  },
  {
    "code": "SE",
    "name": "Suecia",
    "flag": "🇸🇪"
  },
  {
    "code": "NO",
    "name": "Noruega",
    "flag": "🇳🇴"
  },
  {
    "code": "PL",
    "name": "Polonia",
    "flag": "🇵🇱"
  },
  {
    "code": "IR",
    "name": "Irán",
    "flag": "🇮🇷"
  }
];

export const ACTORS_BY_COUNTRY: Record<string, { country: string; actors: CountryActor[] }> = {
  "AR": {
    "country": "Argentina",
    "actors": [
      {
        "id": 1397778,
        "name": "Anya Taylor-Joy",
        "profile_path": "/yZpghhtKM2VZHDx6JGAZqAVU4PL.jpg",
        "known_for": [
          "Fragmentado",
          "La Bruja"
        ],
        "popularity": 10.5
      },
      {
        "id": 18478,
        "name": "Rodrigo de la Serna",
        "profile_path": "/yUngw2JLFYewHJq1oqx5JnNVpnW.jpg",
        "known_for": [
          "La casa de papel",
          "Diarios de motocicleta"
        ],
        "popularity": 2
      },
      {
        "id": 69310,
        "name": "Ricardo Darín",
        "profile_path": "/2laJXyYQkL9YdLL1PRdD3hLZ6Uy.jpg",
        "known_for": [
          "Relatos salvajes",
          "El secreto de sus ojos"
        ],
        "popularity": 1.9
      },
      {
        "id": 74909,
        "name": "Dolores Fonzi",
        "profile_path": "/4axi3Dz8zKK0b1kk54tPOeywb84.jpg",
        "known_for": [
          "Puerta 7",
          "Una sonrisa a la vida"
        ],
        "popularity": 1.7
      },
      {
        "id": 1077146,
        "name": "Joaquín Furriel",
        "profile_path": "/nCEfia5gvBmuJHOMnXM7vhq01lg.jpg",
        "known_for": [
          "El hijo",
          "El faro de las orcas"
        ],
        "popularity": 1.7
      },
      {
        "id": 1020042,
        "name": "Griselda Siciliani",
        "profile_path": "/vl8mSPAkc4xr0X3BiO2bzjUbqgn.jpg",
        "known_for": [
          "Bardo, falsa crónica de unas cuantas verdades",
          "Envidiosa"
        ],
        "popularity": 1.6
      },
      {
        "id": 93650,
        "name": "Guillermo Francella",
        "profile_path": "/tqHvc1MaEzZHp52EeOagmBzaTn8.jpg",
        "known_for": [
          "El robo del siglo",
          "El secreto de sus ojos"
        ],
        "popularity": 1.5
      },
      {
        "id": 19803,
        "name": "Leonardo Sbaraglia",
        "profile_path": "/jGYgJqNEWVvp92ZPre1PEKfci5H.jpg",
        "known_for": [
          "Relatos salvajes",
          "Dolor y gloria"
        ],
        "popularity": 1.4
      },
      {
        "id": 953,
        "name": "Cecilia Roth",
        "profile_path": "/4icHsZvHy0ZnDGF2kovjNLuDQEM.jpg",
        "known_for": [
          "Todo sobre mi madre",
          "Crímenes de familia"
        ],
        "popularity": 1.4
      },
      {
        "id": 96429,
        "name": "Diego Peretti",
        "profile_path": "/honq5g3GPjaCBoiik4uU7va0OJf.jpg",
        "known_for": [
          "El robo del siglo",
          "La ira de Dios"
        ],
        "popularity": 1
      },
      {
        "id": 562364,
        "name": "Carla Peterson",
        "profile_path": "/wzu3UNvxIlk1i9uWjcFi8ANrAyl.jpg",
        "known_for": [
          "El Eternauta",
          "Medianeras"
        ],
        "popularity": 1
      },
      {
        "id": 141455,
        "name": "Érica Rivas",
        "profile_path": "/8WqQnJJ30fJkFZAnmndjfhsT41k.jpg",
        "known_for": [
          "Relatos salvajes",
          "Casados con Hijos"
        ],
        "popularity": 0.9
      },
      {
        "id": 1457004,
        "name": "Oscar Martínez",
        "profile_path": "/t8d1BEV3OEasLnIULbL1oYVIvxa.jpg",
        "known_for": [
          "Relatos salvajes",
          "Toc Toc"
        ],
        "popularity": 0.9
      },
      {
        "id": 18499,
        "name": "Mercedes Morán",
        "profile_path": "/2r5QQeumzXWoSma6RQrLjiNhHdu.jpg",
        "known_for": [
          "Diarios de motocicleta",
          "El Ángel"
        ],
        "popularity": 0.9
      },
      {
        "id": 46853,
        "name": "Norma Aleandro",
        "profile_path": "/5XRDMXqCeSURgl3q0S8xm9oygKd.jpg",
        "known_for": [
          "La historia oficial",
          "El hijo de la novia"
        ],
        "popularity": 0.9
      },
      {
        "id": 1308586,
        "name": "Chino Darín",
        "profile_path": "/74iskBTtTctJDO6riMhhq7W8Dfa.jpg",
        "known_for": [
          "Durante la tormenta",
          "El Ángel"
        ],
        "popularity": 0.9
      },
      {
        "id": 1246181,
        "name": "Peter Lanzani",
        "profile_path": "/eo1TzQmNL9jTQTCe6AvUDr1ZktS.jpg",
        "known_for": [
          "Argentina 1985",
          "El clan"
        ],
        "popularity": 0.8
      },
      {
        "id": 119671,
        "name": "Gastón Pauls",
        "profile_path": "/aAdkMqUUGjdjMU1MT1ncx9cBDUE.jpg",
        "known_for": [
          "Nueve reinas",
          "Che: Guerrilla"
        ],
        "popularity": 0.8
      }
    ]
  },
  "ES": {
    "country": "España",
    "actors": [
      {
        "id": 955,
        "name": "Penélope Cruz",
        "profile_path": "/n5SFgmvJSENQt8poE4qYacUnKOi.jpg",
        "known_for": [
          "Piratas del Caribe 4: Navegando Aguas Misteriosas",
          "Vanilla Sky"
        ],
        "popularity": 6.5
      },
      {
        "id": 3131,
        "name": "Antonio Banderas",
        "profile_path": "/n8YlGookYzgD3cmpMP45BYRNIoh.jpg",
        "known_for": [
          "Gato con Botas: El último deseo",
          "Gato con Botas"
        ],
        "popularity": 6.1
      },
      {
        "id": 3810,
        "name": "Javier Bardem",
        "profile_path": "/zfRID0jx8DKBluPGU9xtk9sZWUt.jpg",
        "known_for": [
          "Sin lugar para los débiles",
          "Piratas del Caribe 5: La Venganza de Salazar"
        ],
        "popularity": 5.5
      },
      {
        "id": 1109836,
        "name": "Pedro Alonso",
        "profile_path": "/38HeVKeOBztVYrLJOWzAtEZiB02.jpg",
        "known_for": [
          "La casa de papel",
          "Berlín"
        ],
        "popularity": 4.2
      },
      {
        "id": 1042728,
        "name": "Úrsula Corberó",
        "profile_path": "/cmH8Z459tw9YkR61QfxlCSlZw9P.jpg",
        "known_for": [
          "La casa de papel",
          "La Casa de Papel: el fenómeno"
        ],
        "popularity": 3
      },
      {
        "id": 1031914,
        "name": "Anna Castillo",
        "profile_path": "/skQ9HzWM4Ya9YB6J9QSRPVgjfNG.jpg",
        "known_for": [
          "Nowhere",
          "La llamada"
        ],
        "popularity": 2.2
      },
      {
        "id": 224728,
        "name": "Inma Cuesta",
        "profile_path": "/mzOriC8zIS3HqjGtthO4XwLht6C.jpg",
        "known_for": [
          "Vivir dos veces",
          "El desorden que dejas"
        ],
        "popularity": 2.2
      },
      {
        "id": 82700,
        "name": "Mario Casas",
        "profile_path": "/y0H8jDiOZqYKZkamv2z4cV9FLsl.jpg",
        "known_for": [
          "Contratiempo",
          "Tres Metros Sobre El Cielo"
        ],
        "popularity": 2
      },
      {
        "id": 16971,
        "name": "Maribel Verdú",
        "profile_path": "/7hxTsW5CKi2lkz5yGMWShki7DOo.jpg",
        "known_for": [
          "El laberinto del fauno",
          "Flash"
        ],
        "popularity": 1.8
      },
      {
        "id": 724188,
        "name": "Bárbara Lennie",
        "profile_path": "/pEiyonuiZbpkpfdGf5inWQ8Tr1h.jpg",
        "known_for": [
          "Contratiempo",
          "Los renglones torcidos de Dios"
        ],
        "popularity": 1.7
      },
      {
        "id": 1340020,
        "name": "Álvaro Morte",
        "profile_path": "/2TGPhdpRC5wjdFEJqnLYiN5kbwg.jpg",
        "known_for": [
          "La casa de papel",
          "Inmaculada"
        ],
        "popularity": 1.7
      },
      {
        "id": 106817,
        "name": "Blanca Suárez",
        "profile_path": "/otfekDB4sJbZeXavqyC0CKadSkQ.jpg",
        "known_for": [
          "El bar",
          "La piel que habito"
        ],
        "popularity": 1.6
      },
      {
        "id": 1610,
        "name": "Javier Cámara",
        "profile_path": "/pG2uOSwthuTXn8LAV2MTZbyOre9.jpg",
        "known_for": [
          "Hable con ella",
          "Una sonrisa a la vida"
        ],
        "popularity": 1.5
      },
      {
        "id": 2744,
        "name": "Carmen Maura",
        "profile_path": "/sXvr7BvxscBkYpGTcYjpqbzkUSH.jpg",
        "known_for": [
          "Mujeres al borde de un ataque de nervios",
          "Volver"
        ],
        "popularity": 1.4
      },
      {
        "id": 16867,
        "name": "Luis Tosar",
        "profile_path": "/7ZTdhzUCpG9jhsKJeTJbGn36v5F.jpg",
        "known_for": [
          "Mientras duermes",
          "Celda 211"
        ],
        "popularity": 1.3
      },
      {
        "id": 87015,
        "name": "Eduard Fernández",
        "profile_path": "/1oBOegVHnzjNAU3PFsulfYApEb8.jpg",
        "known_for": [
          "La piel que habito",
          "30 monedas"
        ],
        "popularity": 1.2
      },
      {
        "id": 224870,
        "name": "Paco León",
        "profile_path": "/dZd0Z3mUgXrE0y21KknLp40Ivuk.jpg",
        "known_for": [
          "Toc Toc",
          "Aída"
        ],
        "popularity": 1.2
      },
      {
        "id": 105217,
        "name": "José Sacristán",
        "profile_path": "/dT1tMNeRiBHVfpgSKY1EoxiioVw.jpg",
        "known_for": [
          "Magical Girl",
          "Madrid, 1987"
        ],
        "popularity": 0.9
      }
    ]
  },
  "MX": {
    "country": "México",
    "actors": [
      {
        "id": 1222992,
        "name": "Eiza González",
        "profile_path": "/v8CnaoJqdPwkQhJeGwgJDnESOd6.jpg",
        "known_for": [
          "Bloodshot",
          "Baby: El aprendiz del crimen"
        ],
        "popularity": 6.4
      },
      {
        "id": 8688,
        "name": "Diego Luna",
        "profile_path": "/qwbjcyDN37OHiln4a6P4LP31o7F.jpg",
        "known_for": [
          "Star Wars: Rogue One",
          "El Libro de la Vida"
        ],
        "popularity": 4.4
      },
      {
        "id": 258,
        "name": "Gael García Bernal",
        "profile_path": "/9xoTG05O2jEzLBCrVCMrKMh25lG.jpg",
        "known_for": [
          "Coco",
          "Viejos"
        ],
        "popularity": 4.1
      },
      {
        "id": 3136,
        "name": "Salma Hayek Pinault",
        "profile_path": "/3j8MpAjyopkAc8mbNiDeXyqBmcS.jpg",
        "known_for": [
          "Gato con Botas: El último deseo",
          "Gato con Botas"
        ],
        "popularity": 3.8
      },
      {
        "id": 76855,
        "name": "Tony Dalton",
        "profile_path": "/vWteTJu9Dyrax7gQq8ndTjx5s6V.jpg",
        "known_for": [
          "Hawkeye",
          "Better Call Saul"
        ],
        "popularity": 3.1
      },
      {
        "id": 220496,
        "name": "Alfonso Herrera",
        "profile_path": "/54KLFvt8iMDFmam2tsb5wk3AIcv.jpg",
        "known_for": [
          "La captura",
          "El Exorcista"
        ],
        "popularity": 2.6
      },
      {
        "id": 239574,
        "name": "Eugenio Derbez",
        "profile_path": "/6o1w3mYF947N6TTakQXcs3NNy4w.jpg",
        "known_for": [
          "De viaje con los Derbez",
          "La familia P. Luche"
        ],
        "popularity": 2.2
      },
      {
        "id": 87265,
        "name": "Tenoch Huerta Mejía",
        "profile_path": "/x0Wy85CZu887ZQMWrjj4vVulczM.jpg",
        "known_for": [
          "Pantera Negra: Wakanda por siempre",
          "007: Spectre"
        ],
        "popularity": 1.9
      },
      {
        "id": 7370,
        "name": "Damián Alcázar",
        "profile_path": "/6IAlrZ2yXubmmVaRsF7fdaP3N7C.jpg",
        "known_for": [
          "El Infierno",
          "Narcos"
        ],
        "popularity": 1.9
      },
      {
        "id": 36628,
        "name": "Kate del Castillo",
        "profile_path": "/tknUSNx66mhWYlfi9rLsjdeeuhP.jpg",
        "known_for": [
          "La Reina del Sur",
          "Bad Boys para Siempre"
        ],
        "popularity": 1.7
      },
      {
        "id": 76961,
        "name": "Demián Bichir",
        "profile_path": "/dur9tX8tbDDJE5mSOZkuW2VDGz4.jpg",
        "known_for": [
          "La monja",
          "Los 8 Más Odiados"
        ],
        "popularity": 1.7
      },
      {
        "id": 25911,
        "name": "Cecilia Suárez",
        "profile_path": "/m2lUTpivduEiRwyPIrdg8hcI8zq.jpg",
        "known_for": [
          "Espanglish",
          "La casa de las flores"
        ],
        "popularity": 1.6
      },
      {
        "id": 106080,
        "name": "Pedro Infante",
        "profile_path": "/sfbbx0ZJiEdMPhSSK11qHMApD4H.jpg",
        "known_for": [
          "Los tres huastecos",
          "Nosotros los pobres"
        ],
        "popularity": 1.6
      },
      {
        "id": 1775557,
        "name": "Yalitza Aparicio",
        "profile_path": "/wiZEyqNTNkevCT768bKvvOJvCHb.jpg",
        "known_for": [
          "Roma",
          "Presencias"
        ],
        "popularity": 1.2
      },
      {
        "id": 76857,
        "name": "Joaquín Cosío",
        "profile_path": "/ijMo3fMyY4VL1xyIj6ytiJrzaw9.jpg",
        "known_for": [
          "Spider-Man: Un nuevo universo",
          "Rambo: Last Blood"
        ],
        "popularity": 1.1
      }
    ]
  },
  "US": {
    "country": "Estados Unidos",
    "actors": [
      {
        "id": 1245,
        "name": "Scarlett Johansson",
        "profile_path": "/tgxYh3jMs5bY2Ub4d2dcp9iaz1R.jpg",
        "known_for": [
          "Lucy",
          "Black Widow"
        ],
        "popularity": 15.1
      },
      {
        "id": 31,
        "name": "Tom Hanks",
        "profile_path": "/oFvZoKI6lvU03n4YoNGAll9rkas.jpg",
        "known_for": [
          "Forrest Gump",
          "Toy Story"
        ],
        "popularity": 14.5
      },
      {
        "id": 287,
        "name": "Brad Pitt",
        "profile_path": "/ajNaPmXVVMJFg9GWmu6MJzTaXdV.jpg",
        "known_for": [
          "Bastardos sin gloria",
          "Guerra mundial Z"
        ],
        "popularity": 12.4
      },
      {
        "id": 500,
        "name": "Tom Cruise",
        "profile_path": "/maf8PhSvDCdEwjEMbYfGpojR5RP.jpg",
        "known_for": [
          "Al filo del mañana",
          "Oblivion: El Tiempo del Olvido"
        ],
        "popularity": 10.3
      },
      {
        "id": 192,
        "name": "Morgan Freeman",
        "profile_path": "/905k0RFzH0Kd6gx8oSxRdnr6FL.jpg",
        "known_for": [
          "Se7en: Los Siete Pecados Capitales",
          "Sueño de fuga"
        ],
        "popularity": 9.6
      },
      {
        "id": 6193,
        "name": "Leonardo DiCaprio",
        "profile_path": "/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg",
        "known_for": [
          "El Origen",
          "Titanic"
        ],
        "popularity": 9.4
      },
      {
        "id": 5292,
        "name": "Denzel Washington",
        "profile_path": "/jj2Gcobpopokal0YstuCQW0ldJ4.jpg",
        "known_for": [
          "El Justiciero [The Equalizer]",
          "El libro de los secretos"
        ],
        "popularity": 8.6
      },
      {
        "id": 85,
        "name": "Johnny Depp",
        "profile_path": "/k2xt6EUxQDwYRKIyI4IBdZxfs8n.jpg",
        "known_for": [
          "Piratas del Caribe: La Maldición del Perla Negra",
          "Piratas del Caribe 2: El Cofre de la Muerte"
        ],
        "popularity": 8
      },
      {
        "id": 10297,
        "name": "Matthew McConaughey",
        "profile_path": "/lCySuYjhXix3FzQdS4oceDDrXKI.jpg",
        "known_for": [
          "Interestelar",
          "El Club de los Desahuciados"
        ],
        "popularity": 7.9
      },
      {
        "id": 380,
        "name": "Robert De Niro",
        "profile_path": "/cT8htcckIuyI1Lqwt1CvD02ynTh.jpg",
        "known_for": [
          "Buenos Muchachos",
          "Guasón"
        ],
        "popularity": 7.8
      },
      {
        "id": 2231,
        "name": "Samuel L. Jackson",
        "profile_path": "/AiAYAqwpM5xmiFrAIeQvUXDCVvo.jpg",
        "known_for": [
          "Los 8 Más Odiados",
          "Tiempos Violentos"
        ],
        "popularity": 7.8
      },
      {
        "id": 5064,
        "name": "Meryl Streep",
        "profile_path": "/g5cVxQBAQ3AXt3LhdBXtbbN47Uc.jpg",
        "known_for": [
          "El diablo viste a la moda",
          "The Post: Los Oscuros Secretos del Pentágono"
        ],
        "popularity": 6.6
      },
      {
        "id": 73421,
        "name": "Joaquin Phoenix",
        "profile_path": "/u38k3hQBDwNX0VA22aQceDp9Iyv.jpg",
        "known_for": [
          "Guasón",
          "Ella"
        ],
        "popularity": 6.2
      },
      {
        "id": 1158,
        "name": "Al Pacino",
        "profile_path": "/m8HAAjq1T75JypKk0v1FFQn4ysZ.jpg",
        "known_for": [
          "El Padrino II",
          "Caracortada"
        ],
        "popularity": 5.7
      },
      {
        "id": 3894,
        "name": "Christian Bale",
        "profile_path": "/7Pxez9J8fuPd2Mn9kex13YALrCQ.jpg",
        "known_for": [
          "Batman: El caballero de la noche",
          "Batman: El caballero de la noche asciende"
        ],
        "popularity": 5.4
      }
    ]
  },
  "GB": {
    "country": "Reino Unido",
    "actors": [
      {
        "id": 1373737,
        "name": "Florence Pugh",
        "profile_path": "/2URrZb95t3kY6pLroKny3Enmabp.jpg",
        "known_for": [
          "Midsommar: el terror no espera la noche",
          "Black Widow"
        ],
        "popularity": 14.3
      },
      {
        "id": 2524,
        "name": "Tom Hardy",
        "profile_path": "/d81K0RH8UX7tZj49tZaQhZ9ewH.jpg",
        "known_for": [
          "Mad Max: Furia en el camino",
          "Venom"
        ],
        "popularity": 10.5
      },
      {
        "id": 64,
        "name": "Gary Oldman",
        "profile_path": "/yhaSM5habNNI1Tf4ALRwRk3VvSZ.jpg",
        "known_for": [
          "Batman: El caballero de la noche asciende",
          "Batman: El caballero de la noche"
        ],
        "popularity": 9.4
      },
      {
        "id": 10990,
        "name": "Emma Watson",
        "profile_path": "/mf0OANvWYSzU1d8yggrhyw8IbIz.jpg",
        "known_for": [
          "La Bella y La Bestia",
          "Harry Potter y las reliquias de la muerte: Parte 2"
        ],
        "popularity": 9.2
      },
      {
        "id": 71580,
        "name": "Benedict Cumberbatch",
        "profile_path": "/wz3MRiMmoz6b5X3oSzMRC9nLxY1.jpg",
        "known_for": [
          "Doctor Strange: Hechicero supremo",
          "El código enigma"
        ],
        "popularity": 8
      },
      {
        "id": 3895,
        "name": "Michael Caine",
        "profile_path": "/bVZRMlpjTAO2pJK6v90buFgVbSW.jpg",
        "known_for": [
          "Interestelar",
          "Batman inicia"
        ],
        "popularity": 7.8
      },
      {
        "id": 17605,
        "name": "Idris Elba",
        "profile_path": "/be1bVF7qGX91a6c5WeRPs5pKXln.jpg",
        "known_for": [
          "Zootopia",
          "La Torre Oscura"
        ],
        "popularity": 7.5
      },
      {
        "id": 2037,
        "name": "Cillian Murphy",
        "profile_path": "/2lKs67r7FI4bPu0AXxMUJZxmUXn.jpg",
        "known_for": [
          "Oppenheimer",
          "Peaky Blinders"
        ],
        "popularity": 6.1
      },
      {
        "id": 4173,
        "name": "Anthony Hopkins",
        "profile_path": "/iaf7SHSkGDpnyrDh1Jolilwk2TD.jpg",
        "known_for": [
          "El Silencio de los Inocentes",
          "Thor"
        ],
        "popularity": 6
      },
      {
        "id": 204,
        "name": "Kate Winslet",
        "profile_path": "/6qNnMsKtKz9si5rabpUEG85UfHp.jpg",
        "known_for": [
          "Titanic",
          "Eterno resplandor de una mente sin recuerdos"
        ],
        "popularity": 5.6
      },
      {
        "id": 39187,
        "name": "Olivia Colman",
        "profile_path": "/lawJUdbLb1YW0niaYjiVGR9IBG8.jpg",
        "known_for": [
          "La favorita",
          "La Langosta"
        ],
        "popularity": 5.6
      },
      {
        "id": 7056,
        "name": "Emma Thompson",
        "profile_path": "/zQ0hWHh3tzaOOziPbABQI8s9WCu.jpg",
        "known_for": [
          "Valiente",
          "Cruella"
        ],
        "popularity": 4.9
      },
      {
        "id": 3291,
        "name": "Hugh Grant",
        "profile_path": "/dvV843fOuzsEPXHtFvdzsHpy1rC.jpg",
        "known_for": [
          "Realmente amor",
          "Un lugar llamado Notting Hill"
        ],
        "popularity": 4.8
      },
      {
        "id": 1327,
        "name": "Ian McKellen",
        "profile_path": "/5cnnnpnJG6TiYUSS7qgJheUZgnv.jpg",
        "known_for": [
          "El Hobbit 3: La Batalla de Los Cinco Ejércitos",
          "El Hobbit 2: La Desolación de Smaug"
        ],
        "popularity": 4.7
      },
      {
        "id": 11856,
        "name": "Daniel Day-Lewis",
        "profile_path": "/3kNA9VcmymoEwT0btQ4bvMYxzcP.jpg",
        "known_for": [
          "Petróleo sangriento",
          "Lincoln"
        ],
        "popularity": 3.4
      }
    ]
  },
  "FR": {
    "country": "Francia",
    "actors": [
      {
        "id": 10912,
        "name": "Eva Green",
        "profile_path": "/vwjOWfUeDk5fQr8jraKlR1Yfxxq.jpg",
        "known_for": [
          "Miss Peregrine y los niños peculiares",
          "Casino Royale"
        ],
        "popularity": 7.3
      },
      {
        "id": 8293,
        "name": "Marion Cotillard",
        "profile_path": "/biitzOF0GffIqFYLyOPkoiaOngQ.jpg",
        "known_for": [
          "Contagio",
          "El Origen"
        ],
        "popularity": 7
      },
      {
        "id": 1003,
        "name": "Jean Reno",
        "profile_path": "/mw0EZJYz3kiFq9fNxsML773gotF.jpg",
        "known_for": [
          "El Perfecto Asesino",
          "El Código Da Vinci"
        ],
        "popularity": 6.1
      },
      {
        "id": 1925,
        "name": "Vincent Cassel",
        "profile_path": "/ivUQfhn5olOmR5hthN8C8GThBV4.jpg",
        "known_for": [
          "El cisne negro",
          "El odio"
        ],
        "popularity": 4
      },
      {
        "id": 1137,
        "name": "Juliette Binoche",
        "profile_path": "/htdZZIroEyJaeHQAUTqokNfkPgl.jpg",
        "known_for": [
          "Chocolate",
          "Godzilla"
        ],
        "popularity": 3.9
      },
      {
        "id": 121529,
        "name": "Léa Seydoux",
        "profile_path": "/4q6xqqWLLleQrFjeqeYYV8B0fwE.jpg",
        "known_for": [
          "La vida de Adèle",
          "007: Spectre"
        ],
        "popularity": 3.8
      },
      {
        "id": 78423,
        "name": "Omar Sy",
        "profile_path": "/Uuy6WuizieB4fOIGFp0gY90Yq2.jpg",
        "known_for": [
          "Amigos Intocables",
          "Dos son familia"
        ],
        "popularity": 3.8
      },
      {
        "id": 586757,
        "name": "Adèle Exarchopoulos",
        "profile_path": "/5I98lvcCH7T6KlTp9pqupMXa4Pi.jpg",
        "known_for": [
          "La vida de Adèle",
          "Corazones rotos"
        ],
        "popularity": 3.2
      },
      {
        "id": 2405,
        "name": "Audrey Tautou",
        "profile_path": "/d1HVrV8zXy1FJVptmOCkHWG8Jf2.jpg",
        "known_for": [
          "Amélie",
          "El Código Da Vinci"
        ],
        "popularity": 3
      },
      {
        "id": 16927,
        "name": "Gérard Depardieu",
        "profile_path": "/cibkIAJN6ctlqHohhdDEcfbiCAL.jpg",
        "known_for": [
          "Astérix & Obélix : Mission Cléopâtre",
          "Astérix aux Jeux olympiques"
        ],
        "popularity": 2.9
      },
      {
        "id": 50,
        "name": "Catherine Deneuve",
        "profile_path": "/7NS1KuwxTIzyMcpNGKBGlSV0Hqo.jpg",
        "known_for": [
          "Repulsion",
          "8 femmes"
        ],
        "popularity": 2.7
      },
      {
        "id": 16269,
        "name": "Louis Garrel",
        "profile_path": "/iKJ1SL0im6tJVnE777HNLX2kUeG.jpg",
        "known_for": [
          "Los Soñadores",
          "El acusado y el espía"
        ],
        "popularity": 2.7
      },
      {
        "id": 2406,
        "name": "Mathieu Kassovitz",
        "profile_path": "/3FRBEdKKlxhvPWPt0jzgmSjeHwn.jpg",
        "known_for": [
          "Amélie",
          "El Quinto Elemento"
        ],
        "popularity": 2
      },
      {
        "id": 17497,
        "name": "Romain Duris",
        "profile_path": "/70KN228eNpvouPTCxDSurnCzx9G.jpg",
        "known_for": [
          "L'Arnacœur",
          "L'Auberge espagnole"
        ],
        "popularity": 1.5
      },
      {
        "id": 6012,
        "name": "Daniel Auteuil",
        "profile_path": "/5asrvkdSnlYlHap3ldDNyE5opeI.jpg",
        "known_for": [
          "Escondido",
          "La Belle Époque"
        ],
        "popularity": 1.3
      }
    ]
  },
  "KR": {
    "country": "Corea del Sur",
    "actors": [
      {
        "id": 25002,
        "name": "Lee Byung Hun",
        "profile_path": "/5p5LDbZtnKhXDZL5227ExukbnRo.jpg",
        "known_for": [
          "Yo vi al diablo",
          "El juego del calamar"
        ],
        "popularity": 4.6
      },
      {
        "id": 1024395,
        "name": "마동석",
        "profile_path": "/xqnARIEzfyr3BalhFBWHmCusLKH.jpg",
        "known_for": [
          "Estación Zombie: tren a Busan",
          "El gángster, el policía y el diablo"
        ],
        "popularity": 4.4
      },
      {
        "id": 150903,
        "name": "Gong Yoo",
        "profile_path": "/ocGoFb6TrK3uWGXt4WnuibUG1vD.jpg",
        "known_for": [
          "Estación Zombie: tren a Busan",
          "Goblin: El Guardián"
        ],
        "popularity": 4.3
      },
      {
        "id": 20738,
        "name": "송강호",
        "profile_path": "/kBM9UTPYXUA2RNk210DXhztLFns.jpg",
        "known_for": [
          "Parásitos",
          "El expreso del miedo"
        ],
        "popularity": 3.3
      },
      {
        "id": 73249,
        "name": "Lee Jung-jae",
        "profile_path": "/lx8oiTXL9lIx78KOXlrlvNfoz43.jpg",
        "known_for": [
          "El juego del calamar",
          "Nuevo Mundo"
        ],
        "popularity": 2.5
      },
      {
        "id": 2053219,
        "name": "김다미",
        "profile_path": "/1biBc16BVz6bnkajnhdHUsE3j8p.jpg",
        "known_for": [
          "La Bruja: Parte 1 - El Experimento",
          "El gran diluvio"
        ],
        "popularity": 2.5
      },
      {
        "id": 1537768,
        "name": "Kim Tae-ri",
        "profile_path": "/gFofVUeVlIvBJMUv7maHQwWdfsk.jpg",
        "known_for": [
          "La doncella",
          "Barrenderos espaciales"
        ],
        "popularity": 2.5
      },
      {
        "id": 21688,
        "name": "배두나",
        "profile_path": "/lCL08q20zkqHcLLLZQRlJfG09P4.jpg",
        "known_for": [
          "Cloud Atlas: La Red Invisible",
          "El Huésped"
        ],
        "popularity": 2.4
      },
      {
        "id": 1080935,
        "name": "윤여정",
        "profile_path": "/rSoSAX85gvPNSWmWXcCaJ2eBPrp.jpg",
        "known_for": [
          "Minari - Historia de mi familia",
          "Pachinko"
        ],
        "popularity": 1.6
      },
      {
        "id": 21687,
        "name": "박해일",
        "profile_path": "/8ltdBxd40m2iAnsRKV0JMbv7rZT.jpg",
        "known_for": [
          "El Huésped",
          "La decisión de partir"
        ],
        "popularity": 1.3
      },
      {
        "id": 2473961,
        "name": "Choi Chul-min",
        "profile_path": "/8xdnb728F9qQkvm3YVgznEDn0U2.jpg",
        "known_for": [
          "법쩐",
          "룸싸롱 맛있는 서비스"
        ],
        "popularity": 0.6
      },
      {
        "id": 4274545,
        "name": "Park So Dam",
        "profile_path": null,
        "known_for": [
          "괜찮아 안죽어"
        ],
        "popularity": 0.5
      },
      {
        "id": 3499963,
        "name": "Son Suk-ku",
        "profile_path": null,
        "known_for": [],
        "popularity": 0.3
      },
      {
        "id": 3354519,
        "name": "Jung Woo Sung",
        "profile_path": null,
        "known_for": [],
        "popularity": 0.3
      },
      {
        "id": 4607459,
        "name": "Ha Woojung",
        "profile_path": null,
        "known_for": [
          "赤道"
        ],
        "popularity": 0.3
      }
    ]
  },
  "JP": {
    "country": "Japón",
    "actors": [
      {
        "id": 9195,
        "name": "真田広之",
        "profile_path": "/SOwDxhGnRccP2lAtssQ7TxCzOe.jpg",
        "known_for": [
          "Wolverine: Inmortal",
          "47 Ronin: La Leyenda del Samurái"
        ],
        "popularity": 5.7
      },
      {
        "id": 1566805,
        "name": "新田真剣佑",
        "profile_path": "/y4FTSASxsO1F61p3hFIPMCeprut.jpg",
        "known_for": [
          "Los Caballeros del Zodiaco: Saint Seiya - El inicio",
          "ONE PIECE"
        ],
        "popularity": 2.9
      },
      {
        "id": 46364,
        "name": "小栗旬",
        "profile_path": "/4tfrhvqp3IGHPATor0lYE9X9UD3.jpg",
        "known_for": [
          "Godzilla vs Kong",
          "Capitán Harlock: El pirata espacial"
        ],
        "popularity": 2.7
      },
      {
        "id": 18054,
        "name": "菊地凛子",
        "profile_path": "/lv4UuorZtC37VaFAHO205u4lS73.jpg",
        "known_for": [
          "Titanes Del Pacífico",
          "Babel"
        ],
        "popularity": 2.6
      },
      {
        "id": 80863,
        "name": "本木雅弘",
        "profile_path": "/2W5391NRFyhvCZgtR2drmc9VIrh.jpg",
        "known_for": [
          "Despedidas",
          "Gemini"
        ],
        "popularity": 2.2
      },
      {
        "id": 7450,
        "name": "三船敏郎",
        "profile_path": "/cZ5ybA7cDA0EBMaM5jX2f7RNBVb.jpg",
        "known_for": [
          "Los Siete Samuráis",
          "Rashomon"
        ],
        "popularity": 2.1
      },
      {
        "id": 18056,
        "name": "役所広司",
        "profile_path": "/r2WyVRyl6EJgyPKUJCB7D9cKYPE.jpg",
        "known_for": [
          "Días Perfectos",
          "El niño y la bestia"
        ],
        "popularity": 1.8
      },
      {
        "id": 1357546,
        "name": "Ken Watanabe",
        "profile_path": null,
        "known_for": [
          "Il ragazzo dal kimono d'oro",
          "Il ragazzo dal kimono d'oro 2"
        ],
        "popularity": 0.6
      },
      {
        "id": 3360300,
        "name": "Sakura Ando",
        "profile_path": null,
        "known_for": [
          "アットホーム・ダッド"
        ],
        "popularity": 0.4
      },
      {
        "id": 4307265,
        "name": "Tadanobu Asano",
        "profile_path": null,
        "known_for": [
          "Heat Guy J"
        ],
        "popularity": 0.3
      },
      {
        "id": 5086748,
        "name": "Takashi Shimura",
        "profile_path": null,
        "known_for": [
          "戦後性犯罪史 暴姦"
        ],
        "popularity": 0.3
      },
      {
        "id": 3517535,
        "name": "北野剛志",
        "profile_path": null,
        "known_for": [
          "SHIROBAKO"
        ],
        "popularity": 0.3
      }
    ]
  },
  "IT": {
    "country": "Italia",
    "actors": [
      {
        "id": 28782,
        "name": "Monica Bellucci",
        "profile_path": "/7g3k3u2gZpE7XU8GRYwHDuN1jlM.jpg",
        "known_for": [
          "Irreversible",
          "Malena"
        ],
        "popularity": 6.7
      },
      {
        "id": 16757,
        "name": "Sophia Loren",
        "profile_path": "/lxhkn933v8EuBHvfTWSS5SQQnJ4.jpg",
        "known_for": [
          "Un día especial",
          "Dos mujeres"
        ],
        "popularity": 3.4
      },
      {
        "id": 4959,
        "name": "Claudia Cardinale",
        "profile_path": "/gbTVdZGrOwteJ7qYSzyn8XpUk0H.jpg",
        "known_for": [
          "Érase una vez en el Oeste",
          "8½"
        ],
        "popularity": 3
      },
      {
        "id": 509344,
        "name": "Luca Marinelli",
        "profile_path": "/9Tmzfhp9hY6Zouo8KtHcyzuKfdf.jpg",
        "known_for": [
          "Lo llamaban Jeeg Robot",
          "Non essere cattivo"
        ],
        "popularity": 2.3
      },
      {
        "id": 4818,
        "name": "Roberto Benigni",
        "profile_path": "/ba1Sg02XxCphu6E1dWDMAH1GzeE.jpg",
        "known_for": [
          "La Vida es Bella",
          "Café y Cigarrillos"
        ],
        "popularity": 2.2
      },
      {
        "id": 5676,
        "name": "Marcello Mastroianni",
        "profile_path": "/bfLnFfNfMC73Q7WW90xQy2PvRZm.jpg",
        "known_for": [
          "8½",
          "La dolce vita"
        ],
        "popularity": 2
      },
      {
        "id": 17839,
        "name": "Pierfrancesco Favino",
        "profile_path": "/hedzgTKFKrSleWvLkBlANng8w4T.jpg",
        "known_for": [
          "Rush: Pasión y Gloria",
          "Ángeles y demonios"
        ],
        "popularity": 1.9
      },
      {
        "id": 59269,
        "name": "Elio Germano",
        "profile_path": "/2Z6SHTOQ9XuKdFlFpKZ2yPCpald.jpg",
        "known_for": [
          "La increíble historia de la Isla de las Rosas",
          "Il giovane favoloso"
        ],
        "popularity": 1.2
      },
      {
        "id": 72782,
        "name": "Toni Servillo",
        "profile_path": "/zHMSH7YrfQJFcdPNbZ42l5sZRLn.jpg",
        "known_for": [
          "La grande bellezza",
          "Gomorra"
        ],
        "popularity": 1
      },
      {
        "id": 67323,
        "name": "Margherita Buy",
        "profile_path": "/bVYTMEpmk7JqgmTKMXbiqLOLFLo.jpg",
        "known_for": [
          "Le fate ignoranti",
          "7 mujeres y un misterio"
        ],
        "popularity": 1
      }
    ]
  },
  "DE": {
    "country": "Alemania",
    "actors": [
      {
        "id": 17288,
        "name": "Michael Fassbender",
        "profile_path": "/xvbnUiB2ZBR3QIt595OzNy657Vw.jpg",
        "known_for": [
          "Alien: Covenant",
          "Assassin's Creed"
        ],
        "popularity": 7.6
      },
      {
        "id": 27319,
        "name": "Christoph Waltz",
        "profile_path": "/jMvLGCVXLaBqjRLf5olyvEucZob.jpg",
        "known_for": [
          "Django sin Cadenas",
          "Bastardos sin gloria"
        ],
        "popularity": 6.4
      },
      {
        "id": 7152,
        "name": "Sandra Hüller",
        "profile_path": "/jQfKXVCPTH9KEnzHHU4QemCnlMe.jpg",
        "known_for": [
          "Proyecto Fin del Mundo",
          "Anatomía de una Caída"
        ],
        "popularity": 4.4
      },
      {
        "id": 9824,
        "name": "Diane Kruger",
        "profile_path": "/o5gVowcjVw4ThYi0L3883Y4X7kH.jpg",
        "known_for": [
          "Bastardos sin gloria",
          "La leyenda del tesoro perdido"
        ],
        "popularity": 4.1
      },
      {
        "id": 1844,
        "name": "Til Schweiger",
        "profile_path": "/3Jk7y4sKgckrN9RzAAt0drlR0QG.jpg",
        "known_for": [
          "Bastardos sin gloria",
          "¡Esto es guerra!"
        ],
        "popularity": 3.6
      },
      {
        "id": 3872,
        "name": "Daniel Brühl",
        "profile_path": "/3YlmTfiy5qZXkrdKGjaM1uMjGKP.jpg",
        "known_for": [
          "Rush: Pasión y Gloria",
          "Bastardos sin gloria"
        ],
        "popularity": 3.4
      },
      {
        "id": 681,
        "name": "Nina Hoss",
        "profile_path": "/n0iOzWeNemXRTt4fgs7Tt2swtr1.jpg",
        "known_for": [
          "TÁR",
          "Phoenix"
        ],
        "popularity": 2.8
      },
      {
        "id": 6091,
        "name": "August Diehl",
        "profile_path": "/tZfdH3EXLr5OmXBtxV1zT8eYbpT.jpg",
        "known_for": [
          "Bastardos sin gloria",
          "Agente Salt"
        ],
        "popularity": 2.1
      },
      {
        "id": 677,
        "name": "Moritz Bleibtreu",
        "profile_path": "/xg2F0OM9ZTLrEvaQsqFSiMH79WB.jpg",
        "known_for": [
          "Corre Lola, corre (Run Lola Run)",
          "Das Experiment"
        ],
        "popularity": 1.9
      },
      {
        "id": 8197,
        "name": "Sebastian Koch",
        "profile_path": "/3n3BP3FmuFinFokeGx0cHhM4XBH.jpg",
        "known_for": [
          "Duro de matar: Un buen día para morir",
          "Puente de espías"
        ],
        "popularity": 1.4
      }
    ]
  },
  "BR": {
    "country": "Brasil",
    "actors": [
      {
        "id": 17289,
        "name": "Rodrigo Santoro",
        "profile_path": "/d3MaF9SPHDn2PMYHuqdnO0Csik6.jpg",
        "known_for": [
          "Focus: Maestros de la estafa",
          "300"
        ],
        "popularity": 3.8
      },
      {
        "id": 52583,
        "name": "Wagner Moura",
        "profile_path": "/53IbAed4t1dOWxY3iygbRYZBBnm.jpg",
        "known_for": [
          "Narcos",
          "Tropa de Élite"
        ],
        "popularity": 3.3
      },
      {
        "id": 8602,
        "name": "Alice Braga",
        "profile_path": "/d9JdgvUiqyWuGQLmozNfGZOpIBz.jpg",
        "known_for": [
          "Soy Leyenda",
          "Soul"
        ],
        "popularity": 3.2
      },
      {
        "id": 1475555,
        "name": "Gabriel Leone",
        "profile_path": "/wvinAoGZiOGczIEtXWFmXGMl0QC.jpg",
        "known_for": [
          "Ferrari",
          "El agente secreto"
        ],
        "popularity": 2.2
      },
      {
        "id": 27396,
        "name": "Sonia Braga",
        "profile_path": "/8NqF8pH836rfSlcI4ipmPH1NL2g.jpg",
        "known_for": [
          "Aquarius",
          "La primera profecía"
        ],
        "popularity": 1.9
      },
      {
        "id": 87341,
        "name": "Selton Mello",
        "profile_path": "/sBVDTAAEDJuVBTKzVGA0PrqeD17.jpg",
        "known_for": [
          "El Auto De La Compadecida",
          "Lisbela e o Prisioneiro"
        ],
        "popularity": 1.8
      },
      {
        "id": 5659,
        "name": "Seu Jorge",
        "profile_path": "/p8VUk0ZSzfAF9uWjWg2jEVpPtTy.jpg",
        "known_for": [
          "Ciudad de Dios",
          "Pelé: El nacimiento de una leyenda"
        ],
        "popularity": 1.6
      },
      {
        "id": 10055,
        "name": "Fernanda Montenegro",
        "profile_path": "/bja0rn1BjAnA5Z5VbEvL2apvMT5.jpg",
        "known_for": [
          "Estación central",
          "Aún estoy aquí"
        ],
        "popularity": 1.4
      },
      {
        "id": 55009,
        "name": "Lázaro Ramos",
        "profile_path": "/jf9CJgtmHjsiczNUiQGM6znAYl.jpg",
        "known_for": [
          "O Homem Que Copiava",
          "Ó Paí, Ó"
        ],
        "popularity": 1.2
      }
    ]
  },
  "CO": {
    "country": "Colombia",
    "actors": [
      {
        "id": 5723,
        "name": "John Leguizamo",
        "profile_path": "/kwYCdxTlDh9zauUCg4mp2XTCQTw.jpg",
        "known_for": [
          "La era de hielo",
          "La era de hielo 2"
        ],
        "popularity": 6
      },
      {
        "id": 63522,
        "name": "Sofía Vergara",
        "profile_path": "/l79eVtn6bSOaiq7R0UGu60foMrK.jpg",
        "known_for": [
          "Una Familia Moderna",
          "Dos locas en fuga"
        ],
        "popularity": 3.2
      },
      {
        "id": 1128383,
        "name": "Juana Acosta",
        "profile_path": "/r1Zcu20O9b0R7OYfeVjZVbtk4Vb.jpg",
        "known_for": [
          "Perfectos desconocidos",
          "El cártel de los sapos"
        ],
        "popularity": 2
      },
      {
        "id": 937009,
        "name": "Juan Pablo Raba",
        "profile_path": "/xXgB3pOpYWs8NlePS0QrRiYV5FD.jpg",
        "known_for": [
          "Matar o Morir",
          "Héroe Por Encargo"
        ],
        "popularity": 1.8
      },
      {
        "id": 66914,
        "name": "Manolo Cardona",
        "profile_path": "/9hPHLgO9lINwZynrFywTG9ms8Jl.jpg",
        "known_for": [
          "¿Quién mató a Sara?",
          "Uno Para Morir"
        ],
        "popularity": 1.7
      },
      {
        "id": 1596934,
        "name": "Natalia Reyes",
        "profile_path": "/9N7FNKUhjtinrNPy8ANvXrB7iEr.jpg",
        "known_for": [
          "Lady, la vendedora de rosas",
          "Terminator: Destino oculto"
        ],
        "popularity": 1.5
      },
      {
        "id": 71200,
        "name": "Andrés Parra",
        "profile_path": "/4VLToLmpMaFcgIuuYCyyV6tWVfG.jpg",
        "known_for": [
          "Pablo Escobar: El Patrón del Mal",
          "El robo del siglo"
        ],
        "popularity": 1
      },
      {
        "id": 588943,
        "name": "Marlon Moreno",
        "profile_path": "/kDoq3qs9V8CU7xbVTrvO4kUac6t.jpg",
        "known_for": [
          "El Capo",
          "Regreso a la guaca"
        ],
        "popularity": 0.8
      }
    ]
  },
  "CL": {
    "country": "Chile",
    "actors": [
      {
        "id": 1253360,
        "name": "Pedro Pascal",
        "profile_path": "/oKcMbVn0NJTNzQt0ClKKvVXkm60.jpg",
        "known_for": [
          "The Mandalorian",
          "The Last of Us"
        ],
        "popularity": 11.5
      },
      {
        "id": 225011,
        "name": "Alfredo Castro",
        "profile_path": "/Rmp7RMej76wPBRK4KcSfD57H5z.jpg",
        "known_for": [
          "El Club",
          "No"
        ],
        "popularity": 1
      },
      {
        "id": 1532436,
        "name": "Paulina García",
        "profile_path": "/tNlCDdvzkGyvdv2SbWzkQdpV5xA.jpg",
        "known_for": [
          "Gloria",
          "Los 33: Una historia de esperanza"
        ],
        "popularity": 1
      },
      {
        "id": 127248,
        "name": "Luis Gnecco",
        "profile_path": "/diVRMQ3cFRldIRWXJ6SieIuJ9Ro.jpg",
        "known_for": [
          "Los Dos Papas",
          "Una mujer fantástica"
        ],
        "popularity": 1
      },
      {
        "id": 1436971,
        "name": "Daniela Vega",
        "profile_path": "/pqiWEvi0iwtkWMq2060jtrckxpS.jpg",
        "known_for": [
          "Una mujer fantástica",
          "La jauría"
        ],
        "popularity": 0.9
      },
      {
        "id": 141624,
        "name": "Antonia Zegers",
        "profile_path": "/6wd9Jb4kxSDfxWXMUWTgLEF8HiY.jpg",
        "known_for": [
          "La jauría",
          "No"
        ],
        "popularity": 0.9
      },
      {
        "id": 79001,
        "name": "Benjamín Vicuña",
        "profile_path": "/wYiCITgYIIfam3pbBIdVzXEtni1.jpg",
        "known_for": [
          "Vis a vis",
          "Pacto de fuga"
        ],
        "popularity": 0.8
      }
    ]
  },
  "UY": {
    "country": "Uruguay",
    "actors": [
      {
        "id": 64774,
        "name": "Natalia Oreiro",
        "profile_path": "/mPXbbWPifRNHoi9HFCUQI8FDKG.jpg",
        "known_for": [
          "Re Loca",
          "Wakolda"
        ],
        "popularity": 1.6
      },
      {
        "id": 3301646,
        "name": "Enzo Vogrincic",
        "profile_path": "/ebRL8vHFjA0vCYw66CmUa4UJ9Be.jpg",
        "known_for": [
          "La sociedad de la nieve",
          "9"
        ],
        "popularity": 1.3
      },
      {
        "id": 968818,
        "name": "Jorge Drexler",
        "profile_path": "/54A04OO4qCgaw1YUYfvwMiJDqki.jpg",
        "known_for": [
          "Diarios de motocicleta",
          "The City of Your Final Destination"
        ],
        "popularity": 1.2
      },
      {
        "id": 131867,
        "name": "Daniel Hendler",
        "profile_path": "/8Q36TGfbnm4CjuKVWz1XGmTiZtk.jpg",
        "known_for": [
          "Virus: 32",
          "Fase 7"
        ],
        "popularity": 0.9
      },
      {
        "id": 54190,
        "name": "César Troncoso",
        "profile_path": "/eUbQSEPu2qrIAQ2UMzTXN1Ofq8r.jpg",
        "known_for": [
          "El Eternauta",
          "El vendedor de sueños"
        ],
        "popularity": 0.9
      },
      {
        "id": 74897,
        "name": "China Zorrilla",
        "profile_path": "/leG6cjuFtfBwSHt2c9PeJdIdX12.jpg",
        "known_for": [
          "Elsa y Fred",
          "Esperando la carroza"
        ],
        "popularity": 0.8
      }
    ]
  },
  "IE": {
    "country": "Irlanda",
    "actors": [
      {
        "id": 3896,
        "name": "Liam Neeson",
        "profile_path": "/sRLev3wJioBgun3ZoeAUFpkLy0D.jpg",
        "known_for": [
          "La Lista de Schindler",
          "Star Wars: Episodio I - La amenaza fantasma"
        ],
        "popularity": 8.6
      },
      {
        "id": 517,
        "name": "Pierce Brosnan",
        "profile_path": "/dzXVwwJLPwiZeXOnf7YxorqVEEM.jpg",
        "known_for": [
          "007: Goldeneye, el Regreso del Agente",
          "007: Otro día para morir"
        ],
        "popularity": 6.5
      },
      {
        "id": 2037,
        "name": "Cillian Murphy",
        "profile_path": "/2lKs67r7FI4bPu0AXxMUJZxmUXn.jpg",
        "known_for": [
          "Oppenheimer",
          "Peaky Blinders"
        ],
        "popularity": 6.1
      },
      {
        "id": 72466,
        "name": "Colin Farrell",
        "profile_path": "/5FdalJbrbZ5UCsED5rFrXpvbqJa.jpg",
        "known_for": [
          "La Langosta",
          "El vengador del futuro"
        ],
        "popularity": 5.9
      },
      {
        "id": 2039,
        "name": "Brendan Gleeson",
        "profile_path": "/ctPPJu5ZYDZr1IPmzoNpezczrm0.jpg",
        "known_for": [
          "Harry Potter y el cáliz de fuego",
          "Al filo del mañana"
        ],
        "popularity": 5
      },
      {
        "id": 1290466,
        "name": "Barry Keoghan",
        "profile_path": "/ngoitknM6hw8fffLywyvjzy6Iti.jpg",
        "known_for": [
          "Saltburn",
          "Dunkerque"
        ],
        "popularity": 4.8
      },
      {
        "id": 36592,
        "name": "Saoirse Ronan",
        "profile_path": "/tsk3iKGmMgXIGbRjwf2zYkh8Zkb.jpg",
        "known_for": [
          "Lady Bird",
          "Mujercitas"
        ],
        "popularity": 4
      },
      {
        "id": 93210,
        "name": "Domhnall Gleeson",
        "profile_path": "/a63BgOBKzJ9XPaLFyu7u5Ge3REG.jpg",
        "known_for": [
          "Ex-Máquina",
          "Cuestión de tiempo"
        ],
        "popularity": 4
      },
      {
        "id": 125660,
        "name": "Andrew Scott",
        "profile_path": "/4F8XpjyQCvtuu21WFm5d8RF5Rl.jpg",
        "known_for": [
          "1917",
          "007: Spectre"
        ],
        "popularity": 3.7
      },
      {
        "id": 2326151,
        "name": "Paul Mescal",
        "profile_path": "/vrzZ41TGNAFgfmZjC2sOJySzBLd.jpg",
        "known_for": [
          "Gladiador II",
          "Aftersun"
        ],
        "popularity": 2.9
      }
    ]
  },
  "AU": {
    "country": "Australia",
    "actors": [
      {
        "id": 234352,
        "name": "Margot Robbie",
        "profile_path": "/euDPyqLnuwaWMHajcU3oZ9uZezR.jpg",
        "known_for": [
          "Barbie",
          "Aves De Presa y La Fantabulosa Emancipación De Una Harley Quinn"
        ],
        "popularity": 10.8
      },
      {
        "id": 2227,
        "name": "Nicole Kidman",
        "profile_path": "/4KSQDodyBtTDMaREYgMdWD1LbH1.jpg",
        "known_for": [
          "Los otros",
          "Ojos bien cerrados"
        ],
        "popularity": 9.6
      },
      {
        "id": 74568,
        "name": "Chris Hemsworth",
        "profile_path": "/piQGdoIQOF3C1EI5cbYZLAW1gfj.jpg",
        "known_for": [
          "Thor",
          "Thor: Ragnarok"
        ],
        "popularity": 8.5
      },
      {
        "id": 934,
        "name": "Russell Crowe",
        "profile_path": "/3IBZF0qCZMZ7zJYlgrH0sQzNZV.jpg",
        "known_for": [
          "Gladiador",
          "Una Mente Brillante"
        ],
        "popularity": 6.8
      },
      {
        "id": 6968,
        "name": "Hugh Jackman",
        "profile_path": "/4Xujtewxqt6aU0Y81tsS9gkjizk.jpg",
        "known_for": [
          "Logan: Wolverine",
          "El Gran Truco"
        ],
        "popularity": 6.1
      },
      {
        "id": 3051,
        "name": "Toni Collette",
        "profile_path": "/lzXRh16qe4HHeBN6tMyw0DHvaMn.jpg",
        "known_for": [
          "El legado del diablo",
          "El Sexto Sentido"
        ],
        "popularity": 5
      },
      {
        "id": 112,
        "name": "Cate Blanchett",
        "profile_path": "/vUuEHiAR0eD3XEJhg2DWIjymUAA.jpg",
        "known_for": [
          "El Curioso Caso de Benjamin Button",
          "Thor: Ragnarok"
        ],
        "popularity": 4.9
      },
      {
        "id": 1810,
        "name": "Heath Ledger",
        "profile_path": "/p2z2bURSg7nuMsN9P2s61e2RvNz.jpg",
        "known_for": [
          "Batman: El caballero de la noche",
          "10 cosas que odio de ti"
        ],
        "popularity": 4.8
      },
      {
        "id": 529,
        "name": "Guy Pearce",
        "profile_path": "/vTqk6Nh3WgqPubkS23eOlMAwmwa.jpg",
        "known_for": [
          "Amnesia",
          "Iron Man 3"
        ],
        "popularity": 4.3
      },
      {
        "id": 118,
        "name": "Geoffrey Rush",
        "profile_path": "/npXFjaFQzBNroCEPllGPTZ5IisA.jpg",
        "known_for": [
          "Piratas del Caribe: La Maldición del Perla Negra",
          "Piratas del Caribe 3: En el Fin del Mundo"
        ],
        "popularity": 3.6
      }
    ]
  },
  "CA": {
    "country": "Canadá",
    "actors": [
      {
        "id": 30614,
        "name": "Ryan Gosling",
        "profile_path": "/lyUyVARQKhGxaxy0FbPJCQRpiaW.jpg",
        "known_for": [
          "La La Land: Una historia de amor",
          "Blade Runner 2049"
        ],
        "popularity": 10.3
      },
      {
        "id": 6384,
        "name": "Keanu Reeves",
        "profile_path": "/8RZLOyYGsoRe9p44q3xin9QkMHv.jpg",
        "known_for": [
          "Matrix",
          "Otro día para matar"
        ],
        "popularity": 8.6
      },
      {
        "id": 10859,
        "name": "Ryan Reynolds",
        "profile_path": "/trzgptffGvAlAT6MEu01fz47cLW.jpg",
        "known_for": [
          "Deadpool",
          "Deadpool 2"
        ],
        "popularity": 7.8
      },
      {
        "id": 206,
        "name": "Jim Carrey",
        "profile_path": "/y3U9QfPN6sJaGl6l68xjwWj28ig.jpg",
        "known_for": [
          "Truman Show: Historia de una Vida",
          "Eterno resplandor de una mente sin recuerdos"
        ],
        "popularity": 7.5
      },
      {
        "id": 27578,
        "name": "Elliot Page",
        "profile_path": "/nXO8DE4biVXY4UDYP0NdIY1zvXS.jpg",
        "known_for": [
          "El Origen",
          "Juno: Crecer, correr y tropezar"
        ],
        "popularity": 6.8
      },
      {
        "id": 53714,
        "name": "Rachel McAdams",
        "profile_path": "/2DPh6KoNg0p57vvGc6N468zr3ct.jpg",
        "known_for": [
          "Doctor Strange: Hechicero supremo",
          "Diario de una pasión"
        ],
        "popularity": 5
      },
      {
        "id": 19274,
        "name": "Seth Rogen",
        "profile_path": "/nYl9bvQzaPQLzlf0wf75clLN6Hi.jpg",
        "known_for": [
          "La fiesta de las salchichas",
          "Buenos vecinos"
        ],
        "popularity": 4.6
      },
      {
        "id": 39995,
        "name": "Michael Cera",
        "profile_path": "/qjhNKsw0OLyZQgK4srhelBafcCf.jpg",
        "known_for": [
          "Scott Pilgrim vs. los ex de la chica de sus sueños",
          "Supercool"
        ],
        "popularity": 3.5
      },
      {
        "id": 55636,
        "name": "Donald Sutherland",
        "profile_path": "/t9rN5Vni7GYmqqNi9nANCZbmewx.jpg",
        "known_for": [
          "Los juegos del hambre: En llamas",
          "Los juegos del hambre"
        ],
        "popularity": 3.1
      }
    ]
  },
  "IN": {
    "country": "India",
    "actors": [
      {
        "id": 1108120,
        "name": "आलिया भट्ट",
        "profile_path": "/lAgBZgHKTo6amIO9CfNxUbm1usH.jpg",
        "known_for": [
          "Agente Stone",
          "Dear Zindagi"
        ],
        "popularity": 4.4
      },
      {
        "id": 77234,
        "name": "Priyanka Chopra Jonas",
        "profile_path": "/hh48u9scic0nITGtzi9b6rJeAtT.jpg",
        "known_for": [
          "Baywatch: Guardianes de la bahía",
          "¿No Es Romántico?"
        ],
        "popularity": 4.1
      },
      {
        "id": 76793,
        "name": "Irrfan Khan",
        "profile_path": "/qkA9PpWJRw3rNjVkWfNZdwLvRZx.jpg",
        "known_for": [
          "Jurassic World",
          "Una aventura extraordinaria"
        ],
        "popularity": 3.1
      },
      {
        "id": 78749,
        "name": "ऋतिक रोशन",
        "profile_path": "/d7XGTvyYgmrsA05XOn1YtxYcuY1.jpg",
        "known_for": [
          "Vida solo hay una",
          "War"
        ],
        "popularity": 3
      },
      {
        "id": 53975,
        "name": "Deepika Padukone",
        "profile_path": "/rzvvBQ0r6oiqDdzcsdTRB7jN4Rx.jpg",
        "known_for": [
          "xXx: Reactivado",
          "पद्मावत"
        ],
        "popularity": 2.5
      },
      {
        "id": 35780,
        "name": "Amitabh Bachchan",
        "profile_path": "/u69PvpWqGkywSm0YjFiw77j9eqS.jpg",
        "known_for": [
          "El gran Gatsby",
          "Kabhi Khushi Kabhie Gham"
        ],
        "popularity": 1.7
      },
      {
        "id": 4943388,
        "name": "Khan Aamir",
        "profile_path": null,
        "known_for": [
          "Black Coffee"
        ],
        "popularity": 0.4
      },
      {
        "id": 5634988,
        "name": "Ram Charan",
        "profile_path": null,
        "known_for": [
          "సినిమా బండి"
        ],
        "popularity": 0.4
      },
      {
        "id": 1713165,
        "name": "Shahrukh Adnan",
        "profile_path": null,
        "known_for": [
          "Dubai Return"
        ],
        "popularity": 0.3
      },
      {
        "id": 3676950,
        "name": "Rajinikanth",
        "profile_path": null,
        "known_for": [
          "అరణ్యంలో"
        ],
        "popularity": 0.3
      }
    ]
  },
  "DK": {
    "country": "Dinamarca",
    "actors": [
      {
        "id": 1019,
        "name": "Mads Mikkelsen",
        "profile_path": "/AsX4bdvZ8UCayWTmAf9lAqOA8V7.jpg",
        "known_for": [
          "La caza",
          "Doctor Strange: Hechicero supremo"
        ],
        "popularity": 6.6
      },
      {
        "id": 12795,
        "name": "Nikolaj Coster-Waldau",
        "profile_path": "/rpFOERbHkj7GWxkinUNiQ76sSGk.jpg",
        "known_for": [
          "Juego De Tronos",
          "Dioses De Egipto"
        ],
        "popularity": 5.6
      },
      {
        "id": 32683,
        "name": "Sidse Babett Knudsen",
        "profile_path": "/yVkWyBuJaup9I6FIgjZlGkczNNj.jpg",
        "known_for": [
          "Inferno",
          "Un holograma para el rey"
        ],
        "popularity": 2.8
      },
      {
        "id": 71158,
        "name": "Lars Mikkelsen",
        "profile_path": "/xw3bJxjf8yT8TS8zigEGWQYSaXH.jpg",
        "known_for": [
          "Frankenstein",
          "Ahsoka"
        ],
        "popularity": 2.5
      },
      {
        "id": 4455,
        "name": "Ulrich Thomsen",
        "profile_path": "/qjXAPbuO8CicunlQs07c1fbFG67.jpg",
        "known_for": [
          "Festen",
          "La cosa del otro mundo"
        ],
        "popularity": 2.5
      }
    ]
  },
  "SE": {
    "country": "Suecia",
    "actors": [
      {
        "id": 227454,
        "name": "Alicia Vikander",
        "profile_path": "/lZu8qiTwiQIN96cuptgqMCCaUtg.jpg",
        "known_for": [
          "Tomb Raider: Las aventuras de Lara Croft",
          "Ex-Máquina"
        ],
        "popularity": 7.2
      },
      {
        "id": 87722,
        "name": "Noomi Rapace",
        "profile_path": "/m0J6ZqEyNljqF1DXBoC9DcMStHP.jpg",
        "known_for": [
          "Prometeo",
          "¿Qué le pasó a Lunes?"
        ],
        "popularity": 6.5
      },
      {
        "id": 137905,
        "name": "Bill Skarsgård",
        "profile_path": "/xBXLx1m0uzhXIbY3wN8lmPGeUHl.jpg",
        "known_for": [
          "John Wick 4",
          "It (Eso)"
        ],
        "popularity": 5.4
      },
      {
        "id": 28846,
        "name": "Alexander Skarsgård",
        "profile_path": "/6VNNddrSrIVgdzhXr4Zg89gmOzY.jpg",
        "known_for": [
          "Godzilla vs Kong",
          "La leyenda de Tarzán"
        ],
        "popularity": 4.1
      },
      {
        "id": 1640,
        "name": "Stellan Skarsgård",
        "profile_path": "/mW7xmtGV4y79kQGn0zkKVGDMAmw.jpg",
        "known_for": [
          "Thor",
          "Chernobyl"
        ],
        "popularity": 3.6
      },
      {
        "id": 2201,
        "name": "Max von Sydow",
        "profile_path": "/u16BsGyT6v9yuO7wWAF62NayDth.jpg",
        "known_for": [
          "La Isla Siniestra",
          "Minority report: Sentencia previa"
        ],
        "popularity": 2.7
      },
      {
        "id": 4111,
        "name": "Ingrid Bergman",
        "profile_path": "/jXEE0P6705JbMAJ2nwtHjmqkd5F.jpg",
        "known_for": [
          "Casablanca",
          "Cuéntame tu Vida"
        ],
        "popularity": 2.2
      }
    ]
  }
};

/**
 * Returns a pipe-separated string of actor IDs for TMDB with_cast ("id1|id2|...")
 */
export function getCastIdsForCountry(countryCode: string): string {
  const data = ACTORS_BY_COUNTRY[countryCode.toUpperCase()];
  if (!data || !data.actors.length) return "";
  return data.actors.map((a) => a.id).join("|");
}

/**
 * Returns list of leading actors for a specific country, sorted by popularity descending
 */
export function getActorsForCountry(countryCode: string): CountryActor[] {
  const data = ACTORS_BY_COUNTRY[countryCode.toUpperCase()];
  if (!data?.actors) return [];
  return [...data.actors].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
}

/**
 * Returns a sorted list of all worldwide countries with Spanish names and flags
 */
export function getAllCountriesOptions(): CountryInfo[] {
  const list: CountryInfo[] = [];
  PASSPORT_COUNTRIES.forEach((code) => {
    list.push({
      code,
      name: countryName(code),
      flag: countryFlag(code),
    });
  });
  return list.sort((a, b) => a.name.localeCompare(b.name, "es"));
}
