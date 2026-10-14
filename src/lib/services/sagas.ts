import { TMDBCollectionDetails, getCollectionDetails } from "../tmdb/client";

export type SagaCategory = 
  | "all" 
  | "sci-fi" 
  | "superheroes" 
  | "action" 
  | "classics" 
  | "horror" 
  | "animation";

export interface CuratedSaga {
  id: number;
  name: string;
  universe: string;
  category: SagaCategory | SagaCategory[];
  tagline: string;
  approxMovies: number;
  yearRange: string;
  badge?: string;
  accentColor?: string;
  aliases?: string[];
  backdropPath?: string | null;
  posterPath?: string | null;
}

export const SAGA_CATEGORIES: { id: SagaCategory; label: string }[] = [
  { id: "all", label: "Todas las Sagas" },
  { id: "sci-fi", label: "Ciencia Ficción & Fantasía" },
  { id: "superheroes", label: "Superhéroes & Cómics" },
  { id: "action", label: "Acción & Espionaje" },
  { id: "classics", label: "Clásicos & Culto" },
  { id: "horror", label: "Terror & Suspenso" },
  { id: "animation", label: "Animación & Aventura" },
];

export const CURATED_SAGAS: CuratedSaga[] = [
  {
    "id": 119,
    "name": "El Señor de los Anillos",
    "universe": "Tierra Media (Tolkien)",
    "category": [
      "sci-fi",
      "classics"
    ],
    "tagline": "La mayor epopeya de fantasía de la historia del cine dirigida por Peter Jackson.",
    "badge": "Trilogía Legendaria",
    "accentColor": "from-amber-600/30 via-yellow-700/20 to-stone-900",
    "aliases": [
      "lord of the rings",
      "lotr",
      "frodo",
      "tolkien",
      "anillos"
    ],
    "approxMovies": 3,
    "yearRange": "2001 - 2003",
    "backdropPath": "/bccR2CGTWVVSZAG0yqmy3DIvhTX.jpg",
    "posterPath": "/qVI680m5Vx182wO3Bek1XdB4bGD.jpg"
  },
  {
    "id": 121938,
    "name": "El Hobbit",
    "universe": "Tierra Media (Tolkien)",
    "category": [
      "sci-fi",
      "action"
    ],
    "tagline": "El viaje inesperado de Bilbo Bolsón junto a Thorin y la compañía de enanos hacia Erebor.",
    "badge": "Trilogía Épica",
    "accentColor": "from-amber-700/30 via-yellow-800/20 to-stone-900",
    "aliases": [
      "hobbit",
      "bilbo",
      "smaug",
      "tolkien"
    ],
    "approxMovies": 3,
    "yearRange": "2012 - 2014",
    "backdropPath": "/7wO7MSnP5UcwR2cTHdJFF1vP4Ie.jpg",
    "posterPath": "/7v0zSqufU8OBEcpocmbHYDnZE9t.jpg"
  },
  {
    "id": 1241,
    "name": "Harry Potter",
    "universe": "Wizarding World",
    "category": [
      "sci-fi"
    ],
    "tagline": "El viaje del niño mago desde Privet Drive hasta la batalla final de Hogwarts.",
    "badge": "Saga Mágica",
    "accentColor": "from-blue-600/30 via-amber-600/20 to-stone-900",
    "aliases": [
      "potter",
      "hogwarts",
      "voldemort",
      "mago",
      "jk rowling"
    ],
    "approxMovies": 8,
    "yearRange": "2001 - 2011",
    "backdropPath": "/4gV0rKUjB1nLUdZB4zIltLvNZZr.jpg",
    "posterPath": "/pNeqCBGdEOhdaMTPlwdy1oJLG75.jpg"
  },
  {
    "id": 10,
    "name": "Star Wars (Saga Skywalker)",
    "universe": "Universo Star Wars",
    "category": [
      "sci-fi",
      "classics"
    ],
    "tagline": "Tres generaciones de Jedis, Siths y rebeldes en una galaxia muy, muy lejana.",
    "badge": "Ópera Espacial",
    "accentColor": "from-blue-600/30 via-cyan-700/20 to-black",
    "aliases": [
      "guerra de las galaxias",
      "jedi",
      "darth vader",
      "luke skywalker"
    ],
    "approxMovies": 9,
    "yearRange": "1977 - 2019",
    "backdropPath": "/iY2ujEY2m68OTTlPFTiHub9joHS.jpg",
    "posterPath": "/b8FzGmDRm8E1revfJGLbJb33BkO.jpg"
  },
  {
    "id": 726871,
    "name": "Dune",
    "universe": "Imperio de Arrakis",
    "category": [
      "sci-fi"
    ],
    "tagline": "La obra maestra de Frank Herbert adaptada a escala titánica por Denis Villeneuve.",
    "badge": "Sci-Fi Épico",
    "accentColor": "from-orange-600/30 via-amber-700/20 to-stone-900",
    "aliases": [
      "arrakis",
      "paul atreides",
      "gusano",
      "frank herbert"
    ],
    "approxMovies": 3,
    "yearRange": "2021 - 2026",
    "backdropPath": "/fahk0Fu7VUUfK6IkTt1R3waOD9F.jpg",
    "posterPath": "/kylC8ibuv4t8ch3nnq2Kp8i8p3X.jpg"
  },
  {
    "id": 87096,
    "name": "Avatar",
    "universe": "Pandora / James Cameron",
    "category": [
      "sci-fi",
      "action"
    ],
    "tagline": "La maravilla visual y tecnológica de James Cameron en el exuberante mundo de Pandora.",
    "badge": "Revolución Visual",
    "accentColor": "from-cyan-600/30 via-blue-800/20 to-stone-900",
    "aliases": [
      "pandora",
      "na'vi",
      "james cameron",
      "jake sully"
    ],
    "approxMovies": 5,
    "yearRange": "2009 - 2031",
    "backdropPath": "/4uwX70EzaWVcGUXMtXPoexlNAff.jpg",
    "posterPath": "/1Y8Khr8lyBw6Tatxlmkqs0UUOWw.jpg"
  },
  {
    "id": 2344,
    "name": "Matrix",
    "universe": "Ciberpunk / Hermanas Wachowski",
    "category": [
      "sci-fi",
      "classics",
      "action"
    ],
    "tagline": "¿Pastilla azul o pastilla roja? La revolución filosófica y de efectos visuales.",
    "badge": "Ciberpunk Mítico",
    "accentColor": "from-emerald-600/30 via-green-800/20 to-black",
    "aliases": [
      "neo",
      "morpheus",
      "trinity",
      "wachowski",
      "pastilla roja"
    ],
    "approxMovies": 4,
    "yearRange": "1999 - 2021",
    "backdropPath": "/bRm2DEgUiYciDw3myHuYFInD7la.jpg",
    "posterPath": "/roEEKejljtahGx75nYwSlYougS9.jpg"
  },
  {
    "id": 328,
    "name": "Parque Jurásico / Jurassic World",
    "universe": "Isla Nublar / Michael Crichton",
    "category": [
      "sci-fi",
      "action"
    ],
    "tagline": "La vida se abre camino. Dinosaurios genéticos que cambiaron el cine de aventuras.",
    "badge": "Aventura Jurásica",
    "accentColor": "from-amber-600/30 via-red-800/20 to-stone-900",
    "aliases": [
      "jurassic park",
      "jurassic world",
      "dinosaurios",
      "t-rex",
      "spielberg"
    ],
    "approxMovies": 8,
    "yearRange": "1993 - 2025",
    "backdropPath": "/njFixYzIxX8jsn6KMSEtAzi4avi.jpg",
    "posterPath": "/cn1D5g7dFCNCcXiO070H89JuvnE.jpg"
  },
  {
    "id": 295,
    "name": "Piratas del Caribe",
    "universe": "Jack Sparrow / Gore Verbinski",
    "category": [
      "action",
      "sci-fi"
    ],
    "tagline": "Johnny Depp al mando del Perla Negra con mitología marina, maldiciones y alta mar.",
    "badge": "Aventura Pirata",
    "accentColor": "from-cyan-700/30 via-amber-800/20 to-stone-900",
    "aliases": [
      "pirates of the caribbean",
      "jack sparrow",
      "perla negra",
      "davy jones",
      "johnny depp",
      "barbossa"
    ],
    "approxMovies": 5,
    "yearRange": "2003 - 2017",
    "backdropPath": "/wxgD3fB5lQ2sGJLog0rvXW049Pf.jpg",
    "posterPath": "/aTP6lznCDV4eF8zR9ytlPU9PjHd.jpg"
  },
  {
    "id": 173710,
    "name": "El Planeta de los Simios (Trilogía de César)",
    "universe": "Apes Saga Reboot",
    "category": [
      "sci-fi"
    ],
    "tagline": "El ascenso y la tragedia de César con la deslumbrante captura de Andy Serkis.",
    "badge": "Aclamada por la Crítica",
    "accentColor": "from-emerald-700/30 via-stone-800/20 to-stone-900",
    "aliases": [
      "planet of the apes",
      "cesar",
      "simios",
      "andy serkis"
    ],
    "approxMovies": 4,
    "yearRange": "2011 - 2024",
    "backdropPath": "/iMhm0g555HgQNIXAMvnlgOiW5Rz.jpg",
    "posterPath": "/4QUhVxQgtsUhqydkmrFob90Rtwl.jpg"
  },
  {
    "id": 1709,
    "name": "El Planeta de los Simios (Saga Clásica)",
    "universe": "Sci-Fi Clásico (1968)",
    "category": [
      "sci-fi",
      "classics"
    ],
    "tagline": "Charlton Heston y la mítica estatua de la libertad semienterrada en la playa.",
    "badge": "Clásico Inmortal",
    "accentColor": "from-amber-700/30 via-stone-800/20 to-black",
    "aliases": [
      "charlton heston",
      "simios clasico",
      "estatua de la libertad"
    ],
    "approxMovies": 5,
    "yearRange": "1968 - 1973",
    "backdropPath": "/wBiFfCAuYzuSOl0sFnkQMB5BEZx.jpg",
    "posterPath": "/umKb8njr1lZljV2UvPmiCqk7vtn.jpg"
  },
  {
    "id": 131635,
    "name": "Los Juegos del Hambre",
    "universe": "Panem / Suzanne Collins",
    "category": [
      "sci-fi",
      "action"
    ],
    "tagline": "La rebelión del Sinsajo liderada por Katniss Everdeen en una distopía brutal.",
    "badge": "Distopía Juvenil",
    "accentColor": "from-red-600/30 via-amber-700/20 to-stone-900",
    "aliases": [
      "hunger games",
      "katniss",
      "sinsajo",
      "peeta",
      "panem"
    ],
    "approxMovies": 4,
    "yearRange": "2012 - 2015",
    "backdropPath": "/Ipp7cegtub4t0mu7xaKLQkYoGc.jpg",
    "posterPath": "/83Op5HSo3oeMsxMiH0nXUcKYjNW.jpg"
  },
  {
    "id": 8650,
    "name": "Transformers",
    "universe": "Cybertron / Michael Bay",
    "category": [
      "sci-fi",
      "action"
    ],
    "tagline": "Optimus Prime y los Autobots defendiendo la Tierra contra la amenaza Decepticon.",
    "badge": "Acción & Explosiones",
    "accentColor": "from-blue-600/30 via-amber-700/20 to-stone-900",
    "aliases": [
      "optimus prime",
      "bumblebee",
      "megatron",
      "autobots",
      "michael bay"
    ],
    "approxMovies": 5,
    "yearRange": "2007 - 2017",
    "backdropPath": "/zvZBNNDWd5LcsIBpDhJyCB2MDT7.jpg",
    "posterPath": "/nTdXPi7nMefi8pUmDzQLuVlqnkz.jpg"
  },
  {
    "id": 33514,
    "name": "Crepúsculo (The Twilight Saga)",
    "universe": "Forks / Stephenie Meyer",
    "category": [
      "sci-fi"
    ],
    "tagline": "El romance inmortal entre Bella Swan y el vampiro Edward Cullen que marcó una generación.",
    "badge": "Fenómeno Fan",
    "accentColor": "from-indigo-900/30 via-red-950/20 to-black",
    "aliases": [
      "twilight",
      "bella swan",
      "edward cullen",
      "jacob black",
      "vampiros"
    ],
    "approxMovies": 5,
    "yearRange": "2008 - 2012",
    "backdropPath": "/3be0BffeZTyMbj4Ndzo6Y877SBQ.jpg",
    "posterPath": "/g3xh0HrMOxyisn7lPToIikl0O6p.jpg"
  },
  {
    "id": 420,
    "name": "Las Crónicas de Narnia",
    "universe": "Reino de Narnia (C.S. Lewis)",
    "category": [
      "sci-fi"
    ],
    "tagline": "A través del ropero mágico hacia las tierras gobernadas por el león Aslan.",
    "badge": "Fantasía Clásica",
    "accentColor": "from-amber-600/30 via-blue-700/20 to-stone-900",
    "aliases": [
      "narnia",
      "aslan",
      "el leon la bruja y el ropero",
      "cs lewis"
    ],
    "approxMovies": 3,
    "yearRange": "2005 - 2010",
    "backdropPath": "/ojjzZUQlqKTsN1T7s5OAVZSjYMH.jpg",
    "posterPath": "/fJ3b943uYNcxPNhiZqrCmygejUs.jpg"
  },
  {
    "id": 295130,
    "name": "Maze Runner (Correr o Morir)",
    "universe": "Área de Contención / James Dashner",
    "category": [
      "sci-fi",
      "action"
    ],
    "tagline": "Jóvenes atrapados en un laberinto mortal plagado de Penitentes y misterios genéticos.",
    "badge": "Distopía y Escape",
    "accentColor": "from-stone-600/30 via-emerald-800/20 to-stone-900",
    "aliases": [
      "maze runner",
      "laberinto",
      "thomas",
      "correr o morir"
    ],
    "approxMovies": 3,
    "yearRange": "2014 - 2018",
    "backdropPath": "/9BX8MUXmOa9i7oyTMx9OmbzkLev.jpg",
    "posterPath": "/5xBuWkpB1sS8rYXWMqtlyl3n5fy.jpg"
  },
  {
    "id": 86055,
    "name": "Hombres de Negro (Men in Black)",
    "universe": "División MIB / Barry Sonnenfeld",
    "category": [
      "sci-fi",
      "action"
    ],
    "tagline": "Will Smith y Tommy Lee Jones protegiendo la Tierra de la escoria del universo.",
    "badge": "Comedia Alienígena",
    "accentColor": "from-cyan-600/30 via-zinc-800/20 to-black",
    "aliases": [
      "men in black",
      "mib",
      "will smith",
      "agente j",
      "alienigenas"
    ],
    "approxMovies": 3,
    "yearRange": "1997 - 2012",
    "backdropPath": "/xKz6YaOvmnIJQ3MYIpnaa7FBaAB.jpg",
    "posterPath": "/1z9gqwqLGnnW4CltnKHzPIfhg7c.jpg"
  },
  {
    "id": 2980,
    "name": "Los Cazafantasmas (Ghostbusters)",
    "universe": "Ghostbusters / Ivan Reitman",
    "category": [
      "sci-fi",
      "classics"
    ],
    "tagline": "¿A quién vas a llamar? Armados con rayos de protones y el legendario Ecto-1.",
    "badge": "Comedia Sobrenatural",
    "accentColor": "from-red-600/30 via-amber-600/20 to-stone-900",
    "aliases": [
      "ghostbusters",
      "cazafantasmas",
      "bill murray",
      "slimer",
      "pegajoso"
    ],
    "approxMovies": 4,
    "yearRange": "1984 - 2024",
    "backdropPath": "/guigdRPHN65fsgZHmvVvBOyiArf.jpg",
    "posterPath": "/xMIU7Z0EwU3nSJM4imcFKSUJGXt.jpg"
  },
  {
    "id": 535313,
    "name": "Godzilla (Monsterverse)",
    "universe": "Monsterverse / Toho & Legendary",
    "category": [
      "sci-fi",
      "action"
    ],
    "tagline": "El rey de los monstruos titánicos colisionando contra amenazas de escala planetaria.",
    "badge": "Titanes del Cine",
    "accentColor": "from-blue-600/30 via-emerald-800/20 to-stone-900",
    "aliases": [
      "godzilla",
      "kong",
      "monsterverse",
      "titanes",
      "kaiju"
    ],
    "approxMovies": 3,
    "yearRange": "2014 - 2021",
    "backdropPath": "/psZ5CETZoaq2VRnxk95HuxOnI5D.jpg",
    "posterPath": "/bSTTJ83aJvIF7Z9Azc8jzmRllp0.jpg"
  },
  {
    "id": 86311,
    "name": "Avengers (Los Vengadores)",
    "universe": "Marvel Cinematic Universe (MCU)",
    "category": [
      "superheroes",
      "action"
    ],
    "tagline": "El clímax de la Saga del Infinito donde los héroes más poderosos de la Tierra se unen.",
    "badge": "Hito del MCU",
    "accentColor": "from-red-600/30 via-purple-700/20 to-stone-900",
    "aliases": [
      "vengadores",
      "thanos",
      "iron man",
      "capitan america",
      "endgame",
      "infinity war"
    ],
    "approxMovies": 6,
    "yearRange": "2012 - 2027",
    "backdropPath": "/2UNUv4NJdC36E5myDHACBJ99EwL.jpg",
    "posterPath": "/xRgTmIWbsLjRIfFdOS6u5FTlAI2.jpg"
  },
  {
    "id": 131292,
    "name": "Iron Man",
    "universe": "Marvel Cinematic Universe (MCU)",
    "category": [
      "superheroes",
      "action"
    ],
    "tagline": "Robert Downey Jr. como Tony Stark, el genio multimillonario que inauguró el MCU.",
    "badge": "Fundador del MCU",
    "accentColor": "from-red-600/30 via-amber-600/20 to-stone-900",
    "aliases": [
      "tony stark",
      "robert downey jr",
      "armadura",
      "marvel"
    ],
    "approxMovies": 3,
    "yearRange": "2008 - 2013",
    "backdropPath": "/rI8zOWkRQJdlAyQ6WJOSlYK6JxZ.jpg",
    "posterPath": "/18Q6tPvN0baS672jsWGTS06NELJ.jpg"
  },
  {
    "id": 131295,
    "name": "Capitán América",
    "universe": "Marvel Cinematic Universe (MCU)",
    "category": [
      "superheroes",
      "action"
    ],
    "tagline": "Steve Rogers: desde la Segunda Guerra Mundial hasta el thriller político de Winter Soldier.",
    "badge": "El Primer Vengador",
    "accentColor": "from-blue-600/30 via-red-700/20 to-stone-900",
    "aliases": [
      "captain america",
      "steve rogers",
      "winter soldier",
      "soldado del invierno"
    ],
    "approxMovies": 4,
    "yearRange": "2011 - 2025",
    "backdropPath": "/7kVucUYqz8fZkOmFtA8opDwJFXM.jpg",
    "posterPath": "/c78ZW1qaO62fLxNbaTGKp6n2PrQ.jpg"
  },
  {
    "id": 131296,
    "name": "Thor",
    "universe": "Marvel Cinematic Universe (MCU)",
    "category": [
      "superheroes",
      "sci-fi"
    ],
    "tagline": "El dios del trueno de Asgard armado con el Mjölnir a través de los Nueve Reinos.",
    "badge": "Dios del Trueno",
    "accentColor": "from-cyan-600/30 via-blue-800/20 to-stone-900",
    "aliases": [
      "thor",
      "asgard",
      "loki",
      "chris hemsworth",
      "ragnarok"
    ],
    "approxMovies": 4,
    "yearRange": "2011 - 2022",
    "backdropPath": "/3KL8UNKFWgIKXzLHjwY0uwgjzYl.jpg",
    "posterPath": "/joWrxx8EuxvbLCxjF5O0YZZpD8k.jpg"
  },
  {
    "id": 284433,
    "name": "Guardianes de la Galaxia",
    "universe": "Marvel / James Gunn",
    "category": [
      "superheroes",
      "sci-fi"
    ],
    "tagline": "La familia de inadaptados intergalácticos con los mejores soundtracks del cine.",
    "badge": "Favorita de los Fans",
    "accentColor": "from-amber-600/30 via-purple-800/20 to-stone-900",
    "aliases": [
      "guardians of the galaxy",
      "starlord",
      "groot",
      "rocket",
      "james gunn"
    ],
    "approxMovies": 3,
    "yearRange": "2014 - 2023",
    "backdropPath": "/sxyF4lVkEvOLVzr8jOF5K5nrMh3.jpg",
    "posterPath": "/qJN8LUc8MrNkAeOcFTglGLgmv1k.jpg"
  },
  {
    "id": 263,
    "name": "Batman: El Caballero de la Noche",
    "universe": "DC / Christopher Nolan",
    "category": [
      "superheroes",
      "classics",
      "action"
    ],
    "tagline": "La trilogía definitiva que redefinió el cine de superhéroes como drama criminal.",
    "badge": "Trilogía de Nolan",
    "accentColor": "from-zinc-700/40 via-blue-950/30 to-black",
    "aliases": [
      "dark knight",
      "batman",
      "joker",
      "nolan",
      "christian bale",
      "heath ledger"
    ],
    "approxMovies": 3,
    "yearRange": "2005 - 2012",
    "backdropPath": "/xyhrCEdB4XRkelfVsqXeUZ6rLHi.jpg",
    "posterPath": "/r7NQK3QhbzeKWwylMIu558T9BgR.jpg"
  },
  {
    "id": 748,
    "name": "X-Men",
    "universe": "Mutantes Marvel / 20th Century Fox",
    "category": [
      "superheroes",
      "action",
      "sci-fi"
    ],
    "tagline": "Wolverine, Charles Xavier y Magneto en la lucha por la coexistencia mutante y humana.",
    "badge": "Era Mutante",
    "accentColor": "from-blue-700/30 via-amber-600/20 to-stone-900",
    "aliases": [
      "wolverine",
      "hugh jackman",
      "magneto",
      "xavier",
      "mutantes"
    ],
    "approxMovies": 7,
    "yearRange": "2000 - 2019",
    "backdropPath": "/ykVHlrE3aSvHYeIXOrWDsYZ18vv.jpg",
    "posterPath": "/fTx4vrq48SMd4D4r8Yxk34c070b.jpg"
  },
  {
    "id": 448150,
    "name": "Deadpool",
    "universe": "Mercenario Bocazas / Marvel",
    "category": [
      "superheroes",
      "action"
    ],
    "tagline": "Ryan Reynolds rompiendo la cuarta pared con humor clasificación R y katanas.",
    "badge": "Comedia R-Rated",
    "accentColor": "from-red-600/30 via-rose-900/20 to-stone-900",
    "aliases": [
      "wade wilson",
      "ryan reynolds",
      "deadpool & wolverine",
      "mercenario"
    ],
    "approxMovies": 3,
    "yearRange": "2016 - 2024",
    "backdropPath": "/dTq7mGyAR5eAydR532feWfjJjzm.jpg",
    "posterPath": "/6dVSBlh9blLX96tyRDsYtNKpswv.jpg"
  },
  {
    "id": 556,
    "name": "Spider-Man (Trilogía Original)",
    "universe": "Marvel / Sam Raimi",
    "category": [
      "superheroes",
      "classics"
    ],
    "tagline": "Tobey Maguire como Peter Parker en la trilogía que forjó el boom moderno del cine de cómics.",
    "badge": "Clásico Nostálgico",
    "accentColor": "from-red-600/30 via-blue-800/20 to-stone-900",
    "aliases": [
      "tobey maguire",
      "sam raimi",
      "spiderman",
      "duende verde",
      "doc ock"
    ],
    "approxMovies": 3,
    "yearRange": "2002 - 2007",
    "backdropPath": "/waZqriYTuBE3WqXI3SDGi3kfDQE.jpg",
    "posterPath": "/16qe3Iu8xAivAsLN3Dhzs9TCVT8.jpg"
  },
  {
    "id": 531241,
    "name": "Spider-Man (Trilogía MCU / Tom Holland)",
    "universe": "Marvel Cinematic Universe (MCU)",
    "category": [
      "superheroes",
      "action"
    ],
    "tagline": "Homecoming, Far From Home y la reunión multiversal histórica de No Way Home.",
    "badge": "Multiverso Arácnido",
    "accentColor": "from-red-600/30 via-cyan-800/20 to-stone-900",
    "aliases": [
      "tom holland",
      "no way home",
      "homecoming",
      "far from home",
      "peter parker"
    ],
    "approxMovies": 4,
    "yearRange": "2017 - 2026",
    "backdropPath": "/AvnqpRwlEaYNVL6wzC4RN94EdSd.jpg",
    "posterPath": "/2E7Jukg8JvyJgKlql7UIWqVwOMU.jpg"
  },
  {
    "id": 125574,
    "name": "The Amazing Spider-Man",
    "universe": "Marvel / Marc Webb",
    "category": [
      "superheroes",
      "action"
    ],
    "tagline": "Andrew Garfield y Emma Stone en la visión ágil, emotiva y acrobática del trepamuros.",
    "badge": "Dúo Carismático",
    "accentColor": "from-blue-600/30 via-red-800/20 to-stone-900",
    "aliases": [
      "andrew garfield",
      "emma stone",
      "gwen stacy",
      "electro"
    ],
    "approxMovies": 2,
    "yearRange": "2012 - 2014",
    "backdropPath": "/yFGBYtzbvSKKI5qSvyUBWeq1uiJ.jpg",
    "posterPath": "/cAJoDEWcJDUFjBc7T7mYchUaNUh.jpg"
  },
  {
    "id": 573436,
    "name": "Spider-Man: Spider-Verse",
    "universe": "Multiverso Animado Sony / Marvel",
    "category": [
      "superheroes",
      "animation"
    ],
    "tagline": "Miles Morales y la cúspide de la animación revolucionaria moderna.",
    "badge": "Ganadora del Oscar",
    "accentColor": "from-pink-600/30 via-cyan-600/20 to-stone-900",
    "aliases": [
      "miles morales",
      "spider-verse",
      "across the spider-verse",
      "into the spider-verse"
    ],
    "approxMovies": 3,
    "yearRange": "2018 - 2027",
    "backdropPath": "/xLg6LRJ6VqwJX3ZiB6mRhLYAg3I.jpg",
    "posterPath": "/uBN6vdQdiPxE6qGdNJd3QKNKual.jpg"
  },
  {
    "id": 645,
    "name": "James Bond (007)",
    "universe": "MI6 / Ian Fleming",
    "category": [
      "action",
      "classics"
    ],
    "tagline": "Licencia para matar: más de medio siglo del agente secreto más elegante de la historia.",
    "badge": "Saga Legendaria (25+ films)",
    "accentColor": "from-amber-600/30 via-zinc-800/20 to-black",
    "aliases": [
      "007",
      "james bond",
      "sean connery",
      "daniel craig",
      "pierce brosnan",
      "mi6"
    ],
    "approxMovies": 27,
    "yearRange": "1962 - 2021",
    "backdropPath": "/dOSECZImeyZldoq0ObieBE0lwie.jpg",
    "posterPath": "/oqxXkwqfbsK2fGo1xNsUDieJhjV.jpg"
  },
  {
    "id": 404609,
    "name": "John Wick",
    "universe": "El Continental / Baba Yaga",
    "category": [
      "action"
    ],
    "tagline": "Keanu Reeves en la franquicia cumbre de coreografía de acción y gun-fu moderno.",
    "badge": "Acción Pura",
    "accentColor": "from-amber-500/30 via-rose-900/20 to-black",
    "aliases": [
      "john wick",
      "keanu reeves",
      "baba yaga",
      "continental"
    ],
    "approxMovies": 4,
    "yearRange": "2014 - 2023",
    "backdropPath": "/fSwYa5q2xRkBoOOjueLpkLf3N1m.jpg",
    "posterPath": "/yq0BOIp4cMfGon8n1vAqnFy7BwN.jpg"
  },
  {
    "id": 87359,
    "name": "Misión Imposible",
    "universe": "IMF / Tom Cruise",
    "category": [
      "action"
    ],
    "tagline": "Acrobacias reales sin dobles, ritmo frenético y espionaje internacional.",
    "badge": "Tom Cruise Stunts",
    "accentColor": "from-red-600/30 via-zinc-800/20 to-stone-900",
    "aliases": [
      "mission impossible",
      "tom cruise",
      "ethan hunt",
      "imposible"
    ],
    "approxMovies": 8,
    "yearRange": "1996 - 2025",
    "backdropPath": "/mroWh717g0Ah2c0rrPGW6f3EWMM.jpg",
    "posterPath": "/208jd4TkKxRkDvUHiSB1QvfiWPw.jpg"
  },
  {
    "id": 9485,
    "name": "Rápido y Furioso (Fast & Furious)",
    "universe": "La Familia Toretto",
    "category": [
      "action"
    ],
    "tagline": "De carreras callejeras ilegales a acrobacias que desafían la física en autos.",
    "badge": "Familia y Motores",
    "accentColor": "from-orange-600/30 via-red-800/20 to-stone-900",
    "aliases": [
      "fast and furious",
      "toretto",
      "vin diesel",
      "paul walker",
      "rapido y furioso"
    ],
    "approxMovies": 12,
    "yearRange": "2001 - 2028",
    "backdropPath": "/z5A5W3WYJc3UVEWljSGwdjDgQ0j.jpg",
    "posterPath": "/pCM9fXulC0fZ2sAqxOo9JlOxPmX.jpg"
  },
  {
    "id": 84,
    "name": "Indiana Jones",
    "universe": "Arqueología / Spielberg & Lucas",
    "category": [
      "action",
      "classics"
    ],
    "tagline": "Harrison Ford con el látigo y sombrero buscando las reliquias más sagradas del planeta.",
    "badge": "El Héroe Definitivo",
    "accentColor": "from-amber-700/30 via-orange-900/20 to-stone-900",
    "aliases": [
      "indiana jones",
      "harrison ford",
      "arca perdida",
      "spielberg"
    ],
    "approxMovies": 5,
    "yearRange": "1981 - 2023",
    "backdropPath": "/6kh59mZizZsttZPR0HAdXk6Ve2n.jpg",
    "posterPath": "/z1ZuPmh4gdwfDbCJmzbe8WJgZ0m.jpg"
  },
  {
    "id": 1570,
    "name": "Duro de Matar (Die Hard)",
    "universe": "John McClane / Fox",
    "category": [
      "action",
      "classics"
    ],
    "tagline": "Bruce Willis en el Nakatomi Plaza: el estándar de oro de las películas de acción.",
    "badge": "Yippee-Ki-Yay",
    "accentColor": "from-amber-600/30 via-red-900/20 to-black",
    "aliases": [
      "die hard",
      "bruce willis",
      "john mcclane",
      "nakatomi"
    ],
    "approxMovies": 5,
    "yearRange": "1988 - 2013",
    "backdropPath": "/nKShbIW0wJnSbl3t8uPje0QhTb7.jpg",
    "posterPath": "/r45z84KrvIk44Hn53TDjuMwhZtK.jpg"
  },
  {
    "id": 31562,
    "name": "Jason Bourne",
    "universe": "Operación Treadstone / Matt Damon",
    "category": [
      "action"
    ],
    "tagline": "Cámara en mano, combate visceral y la búsqueda de identidad del asesino amnésico de la CIA.",
    "badge": "Espionaje Táctico",
    "accentColor": "from-zinc-600/30 via-blue-900/20 to-stone-900",
    "aliases": [
      "bourne",
      "matt damon",
      "treadstone",
      "identidad bourne"
    ],
    "approxMovies": 5,
    "yearRange": "2002 - 2016",
    "backdropPath": "/vA5xMglyZv7yzDTj1qUTU4OvelV.jpg",
    "posterPath": "/dSYbWvzNglPaPFkmMqHotOdj4ij.jpg"
  },
  {
    "id": 8945,
    "name": "Mad Max",
    "universe": "Yermo Postapocalíptico / George Miller",
    "category": [
      "action",
      "classics"
    ],
    "tagline": "Caos vehicular, fuego y ópera mecánica en el páramo más salvaje del cine.",
    "badge": "Furia en el Yermo",
    "accentColor": "from-amber-600/30 via-orange-800/20 to-black",
    "aliases": [
      "fury road",
      "mel gibson",
      "tom hardy",
      "george miller"
    ],
    "approxMovies": 6,
    "yearRange": "1979 - 2024",
    "backdropPath": "/zI0q2ENcQOLECbe0gAEGlncVh2j.jpg",
    "posterPath": "/pk5CE0GbxKom47ePGIa8yE2ALvv.jpg"
  },
  {
    "id": 1575,
    "name": "Rocky & Creed",
    "universe": "Boxeo / Sylvester Stallone",
    "category": [
      "action",
      "classics"
    ],
    "tagline": "El semental italiano y el legado de Apollo: superación, sudor y corazón.",
    "badge": "Inspiración Deportiva",
    "accentColor": "from-red-600/30 via-blue-900/20 to-stone-900",
    "aliases": [
      "rocky",
      "creed",
      "stallone",
      "balboa",
      "apolo creed"
    ],
    "approxMovies": 6,
    "yearRange": "1976 - 2006",
    "backdropPath": "/yaXXemxz3ePNSrqNtc4ZAbuxJRv.jpg",
    "posterPath": "/lfVbfFIvlaSsm2KqW3YVdmP9tVM.jpg"
  },
  {
    "id": 5039,
    "name": "Rambo",
    "universe": "Veterano de Guerra / Stallone",
    "category": [
      "action",
      "classics"
    ],
    "tagline": "Sylvester Stallone como la máquina de supervivencia humana más temida del cine bélico.",
    "badge": "Ícono Ochentero",
    "accentColor": "from-emerald-700/30 via-stone-800/20 to-stone-900",
    "aliases": [
      "rambo",
      "stallone",
      "primera sangre",
      "first blood"
    ],
    "approxMovies": 5,
    "yearRange": "1982 - 2019",
    "backdropPath": "/ecvVwlK75evrAlsEE96V14KN6MN.jpg",
    "posterPath": "/bAB4f27dtioQokZesx28x1sqmXA.jpg"
  },
  {
    "id": 14890,
    "name": "Bad Boys (Dos Policías Rebeldes)",
    "universe": "Miami PD / Will Smith & Martin Lawrence",
    "category": [
      "action"
    ],
    "tagline": "Comedia policial, tiroteos explosivos y la química inigualable de Mike y Marcus.",
    "badge": "Buddy Cop Clásico",
    "accentColor": "from-cyan-600/30 via-orange-700/20 to-stone-900",
    "aliases": [
      "bad boys",
      "will smith",
      "martin lawrence",
      "dos policias rebeldes"
    ],
    "approxMovies": 4,
    "yearRange": "1995 - 2024",
    "backdropPath": "/r8kZJbi6UNhilLhM5WhauYELIR8.jpg",
    "posterPath": "/vpnAElpSww3nUdCLcFatC2Jb2Gc.jpg"
  },
  {
    "id": 391860,
    "name": "Kingsman",
    "universe": "Agencia Secreta / Matthew Vaughn",
    "category": [
      "action"
    ],
    "tagline": "Trajes a medida, paraguas antibalas y acción estilizada con espíritu británico.",
    "badge": "Espionaje Estilizado",
    "accentColor": "from-amber-600/30 via-blue-900/20 to-stone-900",
    "aliases": [
      "kingsman",
      "colin firth",
      "taron egerton",
      "matthew vaughn"
    ],
    "approxMovies": 3,
    "yearRange": "2015 - 2021",
    "backdropPath": "/i8SLS8XFbjiUheIObBxZDvk0MtJ.jpg",
    "posterPath": "/avTOATIGKsce6sN0vK5eZ1HWSo6.jpg"
  },
  {
    "id": 304,
    "name": "La Gran Estafa (Ocean's)",
    "universe": "Golpe a los Casinos / Steven Soderbergh",
    "category": [
      "action",
      "classics"
    ],
    "tagline": "George Clooney y Brad Pitt liderando los robos más elegantes e ingeniosos de Las Vegas.",
    "badge": "Robo Perfecto",
    "accentColor": "from-amber-600/30 via-stone-800/20 to-stone-900",
    "aliases": [
      "oceans eleven",
      "george clooney",
      "brad pitt",
      "la gran estafa"
    ],
    "approxMovies": 3,
    "yearRange": "2001 - 2007",
    "backdropPath": "/7WUSrq8DqSkVgv1vmhBvav5bPoB.jpg",
    "posterPath": "/rgJO6n10ZFdzVyXrnePptmZPP9O.jpg"
  },
  {
    "id": 102322,
    "name": "Sherlock Holmes",
    "universe": "Detective de Baker Street / Guy Ritchie",
    "category": [
      "action"
    ],
    "tagline": "Robert Downey Jr. y Jude Law en la versión más dinámica, deductiva y pugilística del detective.",
    "badge": "Deducción & Acción",
    "accentColor": "from-amber-700/30 via-stone-800/20 to-stone-900",
    "aliases": [
      "sherlock",
      "watson",
      "robert downey jr",
      "guy ritchie"
    ],
    "approxMovies": 2,
    "yearRange": "2009 - 2011",
    "backdropPath": "/ub7gaxUghGF0r4INAy0Upx9gMCa.jpg",
    "posterPath": "/4befCF6w7OdpJjrB6JJEzy9z0g0.jpg"
  },
  {
    "id": 2883,
    "name": "Kill Bill",
    "universe": "La Novia / Quentin Tarantino",
    "category": [
      "action",
      "classics"
    ],
    "tagline": "Uma Thurman con el chándal amarillo y la espada Hanzo en una sangrienta sinfonía de venganza.",
    "badge": "Obra de Tarantino",
    "accentColor": "from-yellow-500/30 via-amber-700/20 to-black",
    "aliases": [
      "kill bill",
      "tarantino",
      "uma thurman",
      "la novia",
      "hanzo"
    ],
    "approxMovies": 2,
    "yearRange": "2003 - 2004",
    "backdropPath": "/voSMLsbi3f0YMGuC8DvflOEB3lo.jpg",
    "posterPath": "/1kbyjKvNPOgefBun8eHQIGyXFin.jpg"
  },
  {
    "id": 313086,
    "name": "El Conjuro (The Conjuring Universe)",
    "universe": "Expedientes Warren / James Wan",
    "category": [
      "horror"
    ],
    "tagline": "Ed y Lorraine Warren investigando las posesiones demoníacas más aterradoras.",
    "badge": "Terror Moderno",
    "accentColor": "from-red-950/40 via-stone-900/30 to-black",
    "aliases": [
      "conjuring",
      "warren",
      "annabelle",
      "la monja",
      "james wan"
    ],
    "approxMovies": 4,
    "yearRange": "2013 - 2025",
    "backdropPath": "/kHZaX0vuhZdbuq0WKU3BpA9WIQ0.jpg",
    "posterPath": "/zKseh0hk46w1cKWDOA1e3smMhyv.jpg"
  },
  {
    "id": 656,
    "name": "Saw (El Juego del Miedo)",
    "universe": "Jigsaw / James Wan & Leigh Whannell",
    "category": [
      "horror"
    ],
    "tagline": "¿Quieres jugar a un juego? Trampas mortales, dilemas morales y giros legendarios.",
    "badge": "Rey del Torture Porn",
    "accentColor": "from-red-700/30 via-stone-900/40 to-black",
    "aliases": [
      "saw",
      "jigsaw",
      "juego del miedo",
      "tobin bell"
    ],
    "approxMovies": 10,
    "yearRange": "2004 - 2023",
    "backdropPath": "/q6XF2qbrxdv3OwZPnXgecDRft1O.jpg",
    "posterPath": "/gfw1wl8KW0j71XcR9r3xKCJ0wKs.jpg"
  },
  {
    "id": 8091,
    "name": "Alien (El Octavo Pasajero)",
    "universe": "Xenomorfo / Ridley Scott & Cameron",
    "category": [
      "horror",
      "sci-fi",
      "classics"
    ],
    "tagline": "En el espacio nadie puede oír tus gritos. Ellen Ripley contra la forma de vida perfecta.",
    "badge": "Terror Espacial",
    "accentColor": "from-emerald-700/30 via-zinc-900/40 to-black",
    "aliases": [
      "alien",
      "xenomorfo",
      "sigourney weaver",
      "ridley scott",
      "facehugger"
    ],
    "approxMovies": 4,
    "yearRange": "1979 - 1997",
    "backdropPath": "/6X42JnSMdo3dPAswOHUuvebdTq7.jpg",
    "posterPath": "/jIAKsVHZA210iSesqoy8pUAvLql.jpg"
  },
  {
    "id": 399,
    "name": "Depredador (Predator)",
    "universe": "Yautja / Cazador Intergaláctico",
    "category": [
      "horror",
      "action",
      "sci-fi"
    ],
    "tagline": "Si sangra, podemos matarlo. El cazador alienígena invisible con visión térmica.",
    "badge": "Cacería Sangrienta",
    "accentColor": "from-emerald-600/30 via-amber-900/20 to-black",
    "aliases": [
      "predator",
      "depredador",
      "arnold",
      "schwarzenegger",
      "prey"
    ],
    "approxMovies": 6,
    "yearRange": "1987 - 2025",
    "backdropPath": "/u1CTqTYRUVyLwlEd1z1VJrVBp0J.jpg",
    "posterPath": "/quykbxNIbJsQUIqC8TmKbN8iJdE.jpg"
  },
  {
    "id": 2602,
    "name": "Scream",
    "universe": "Ghostface / Wes Craven",
    "category": [
      "horror"
    ],
    "tagline": "¿Cuál es tu película de terror favorita? El slasher metanarrativo por excelencia.",
    "badge": "Rey del Slasher",
    "accentColor": "from-red-600/30 via-rose-950/20 to-black",
    "aliases": [
      "ghostface",
      "wes craven",
      "slasher",
      "sidney prescott"
    ],
    "approxMovies": 8,
    "yearRange": "1996 - 2026",
    "backdropPath": "/fG6GzZAwtsW3v2mhB4EyQLMRjUV.jpg",
    "posterPath": "/fotNDKHjiACk7bvxKIRByYJur5W.jpg"
  },
  {
    "id": 91361,
    "name": "Halloween",
    "universe": "Michael Myers / John Carpenter",
    "category": [
      "horror",
      "classics"
    ],
    "tagline": "La noche en que él volvió a casa: el origen del mal puro con la máscara blanca.",
    "badge": "Clásico del Terror",
    "accentColor": "from-orange-600/30 via-stone-900/40 to-black",
    "aliases": [
      "michael myers",
      "john carpenter",
      "laurie strode",
      "slasher"
    ],
    "approxMovies": 11,
    "yearRange": "1978 - 2022",
    "backdropPath": "/hUa3JDVZ1L0U7jSfFu4uvzoCJxs.jpg",
    "posterPath": "/zI6WrYCrrAOuivze2XLu5IIQJK2.jpg"
  },
  {
    "id": 9735,
    "name": "Viernes 13 (Friday the 13th)",
    "universe": "Campamento Crystal Lake / Jason",
    "category": [
      "horror",
      "classics"
    ],
    "tagline": "Jason Voorhees con la máscara de hockey acechando en las sombras del lago.",
    "badge": "Ícono del Terror",
    "accentColor": "from-blue-900/30 via-stone-900/40 to-black",
    "aliases": [
      "jason voorhees",
      "crystal lake",
      "viernes 13",
      "friday the 13th"
    ],
    "approxMovies": 11,
    "yearRange": "1980 - 2003",
    "backdropPath": "/yz9EdlfKU8bpN0hbdJMy6QkFBoN.jpg",
    "posterPath": "/iM3cFlQg1D9f9rjBkd51UfVNfQo.jpg"
  },
  {
    "id": 8581,
    "name": "Pesadilla en Elm Street",
    "universe": "Freddy Krueger / Wes Craven",
    "category": [
      "horror",
      "classics"
    ],
    "tagline": "Uno, dos, Freddy viene por ti... El asesino de los sueños con garras de acero.",
    "badge": "Terror Onírico",
    "accentColor": "from-red-700/30 via-amber-950/30 to-black",
    "aliases": [
      "freddy krueger",
      "nightmare on elm street",
      "pesadilla",
      "wes craven"
    ],
    "approxMovies": 7,
    "yearRange": "1984 - 1994",
    "backdropPath": "/7UcPLgNneoemYmZcyUo5r3nwBbE.jpg",
    "posterPath": "/58uXfu5QtRY9yXWlUNy0gY0rdcV.jpg"
  },
  {
    "id": 8864,
    "name": "Destino Final (Final Destination)",
    "universe": "Diseño de la Muerte / New Line",
    "category": [
      "horror"
    ],
    "tagline": "No puedes burlar a la muerte: muertes ingeniosas en cadena y paranoia total.",
    "badge": "Terror Ineludible",
    "accentColor": "from-blue-700/30 via-stone-900/40 to-black",
    "aliases": [
      "final destination",
      "destino final",
      "la muerte",
      "premonicion"
    ],
    "approxMovies": 7,
    "yearRange": "2000 - 2028",
    "backdropPath": "/y3aWOInifbGKXM34KjtcMITrZRZ.jpg",
    "posterPath": "/yrQjtYmEsnc1hlDlXQZ29EMSFbp.jpg"
  },
  {
    "id": 228446,
    "name": "La Noche del Demonio (Insidious)",
    "universe": "El Más Allá / James Wan",
    "category": [
      "horror"
    ],
    "tagline": "Viajes astrales hacia la dimensión de sombras donde habitan espectros aterradores.",
    "badge": "Terror Paranormal",
    "accentColor": "from-red-900/30 via-zinc-900/40 to-black",
    "aliases": [
      "insidious",
      "james wan",
      "el mas alla",
      "patrick wilson"
    ],
    "approxMovies": 6,
    "yearRange": "2011 - 2026",
    "backdropPath": "/5FrPZHgbbmTIq0oxpwSGqu5HyXC.jpg",
    "posterPath": "/fct5wsWu6niDIGRIC4aWEsN5Npa.jpg"
  },
  {
    "id": 521226,
    "name": "Un Lugar en Silencio (A Quiet Place)",
    "universe": "Criaturas Ciegas / John Krasinski",
    "category": [
      "horror",
      "sci-fi"
    ],
    "tagline": "Si te escuchan, te cazan: tensión asfixiante donde el mínimo susurro es letal.",
    "badge": "Suspenso Sensorial",
    "accentColor": "from-amber-600/30 via-stone-900/40 to-black",
    "aliases": [
      "a quiet place",
      "un lugar en silencio",
      "john krasinski",
      "emily blunt"
    ],
    "approxMovies": 3,
    "yearRange": "2018 - 2027",
    "backdropPath": "/aYIWZ8SmnZt6rDCuIvXzzcnxjWC.jpg",
    "posterPath": "/dPaJQ7syeONt8aSZFor41QXpm7g.jpg"
  },
  {
    "id": 1960,
    "name": "Evil Dead (Posesión Infernal)",
    "universe": "Necronomicón / Sam Raimi",
    "category": [
      "horror",
      "classics"
    ],
    "tagline": "Ash Williams armado con una motosierra contra los demonios del libro de los muertos.",
    "badge": "Culto Sangriento",
    "accentColor": "from-red-700/30 via-stone-900/40 to-black",
    "aliases": [
      "posasion infernal",
      "evil dead",
      "ash williams",
      "necronomicon",
      "sam raimi"
    ],
    "approxMovies": 3,
    "yearRange": "1983 - 1992",
    "backdropPath": "/377E9KSoUGxKWuvyR1Zu9aXcU4I.jpg",
    "posterPath": "/qcAltryXUfqtRJ4jluA2ic268Uk.jpg"
  },
  {
    "id": 10455,
    "name": "Chucky (El Muñeco Diabólico)",
    "universe": "Charles Lee Ray / Don Mancini",
    "category": [
      "horror",
      "classics"
    ],
    "tagline": "El muñeco Good Guy poseído por el alma de un asesino en serie armado con un cuchillo.",
    "badge": "Muñeco Asesino",
    "accentColor": "from-red-600/30 via-blue-900/20 to-stone-900",
    "aliases": [
      "chucky",
      "childs play",
      "muñeco diabolico",
      "tiffany"
    ],
    "approxMovies": 7,
    "yearRange": "1988 - 2017",
    "backdropPath": "/x8rEmL5lmMKcBFcYa1FgAv25PHr.jpg",
    "posterPath": "/4nkjIjahYVvcHE16pJYfWrWQOLI.jpg"
  },
  {
    "id": 230,
    "name": "El Padrino (The Godfather)",
    "universe": "Familia Corleone / Coppola",
    "category": [
      "classics"
    ],
    "tagline": "La cúspide del cine criminal y la tragedia dinástica del siglo XX.",
    "badge": "Obra Maestra Universal",
    "accentColor": "from-amber-700/30 via-stone-800/20 to-black",
    "aliases": [
      "godfather",
      "corleone",
      "marlon brando",
      "al pacino",
      "coppola"
    ],
    "approxMovies": 3,
    "yearRange": "1972 - 1990",
    "backdropPath": "/28eqCQ51SuLfkbzhQE7jCmTfYfy.jpg",
    "posterPath": "/1eXdkw2e5flhOZfphUe8XByVacz.jpg"
  },
  {
    "id": 264,
    "name": "Volver al Futuro (Back to the Future)",
    "universe": "Viajes en el Tiempo / Robert Zemeckis",
    "category": [
      "classics",
      "sci-fi"
    ],
    "tagline": "Marty McFly y el Doc Brown en el DeLorean a 88 millas por hora.",
    "badge": "Trilogía Perfecta",
    "accentColor": "from-orange-500/30 via-amber-600/20 to-stone-900",
    "aliases": [
      "back to the future",
      "delorean",
      "marty mcfly",
      "doc brown",
      "volver al futuro"
    ],
    "approxMovies": 3,
    "yearRange": "1985 - 1990",
    "backdropPath": "/c9C9Pg2QctyjZHRmS0P8rZg1OTA.jpg",
    "posterPath": "/bskJYliib0AFJ1fDu5tQAVUlpgh.jpg"
  },
  {
    "id": 528,
    "name": "Terminator",
    "universe": "Skynet / James Cameron",
    "category": [
      "classics",
      "sci-fi",
      "action"
    ],
    "tagline": "Cyborgs asesinos que viajan en el tiempo para exterminar a la resistencia humana.",
    "badge": "Sci-Fi Ochentero",
    "accentColor": "from-red-600/30 via-blue-900/20 to-black",
    "aliases": [
      "terminator",
      "schwarzenegger",
      "hasta la vista baby",
      "sarah connor",
      "skynet"
    ],
    "approxMovies": 6,
    "yearRange": "1984 - 2019",
    "backdropPath": "/sCnBEw2Yu6foEjs4Xb4eMddYHRo.jpg",
    "posterPath": "/2DdRQER3D5QjBFAXXgVG7QgBYp2.jpg"
  },
  {
    "id": 123800,
    "name": "Antes de... (Trilogía Before)",
    "universe": "Viena, París & Grecia / Linklater",
    "category": [
      "classics"
    ],
    "tagline": "Ethan Hawke y Julie Delpy en la cumbre del romance reflexivo y la conversación cinematográfica.",
    "badge": "Trilogía Romántica de Culto",
    "accentColor": "from-rose-600/30 via-amber-700/20 to-stone-900",
    "aliases": [
      "before sunrise",
      "before sunset",
      "before midnight",
      "linklater",
      "ethan hawke"
    ],
    "approxMovies": 3,
    "yearRange": "1995 - 2013",
    "backdropPath": "/cgnAVaq85tsCFr4IbNPACIuGCwP.jpg",
    "posterPath": "/9GsII97YfVSWA5okakX98BqA7ry.jpg"
  },
  {
    "id": 4246,
    "name": "Scary Movie",
    "universe": "Hermanos Wayans / Parodia",
    "category": [
      "classics"
    ],
    "tagline": "Las parodias hilarantes y sin filtro que deconstruyeron los grandes clichés del terror.",
    "badge": "Comedia de Culto",
    "accentColor": "from-emerald-600/30 via-stone-900/30 to-black",
    "aliases": [
      "scary movie",
      "cindy campbell",
      "brenda",
      "parodia"
    ],
    "approxMovies": 6,
    "yearRange": "2000 - 2026",
    "backdropPath": "/4YFCPV5KXWgIfQ8oTEeIJvtuxVj.jpg",
    "posterPath": "/kxHEd7OGYx9OizI6QNVGNsvstQf.jpg"
  },
  {
    "id": 10194,
    "name": "Toy Story",
    "universe": "Pixar Animation Studios",
    "category": [
      "animation"
    ],
    "tagline": "Al infinito y más allá: la entrañable amistad de Woody y Buzz a lo largo de las décadas.",
    "badge": "Oro de Pixar",
    "accentColor": "from-sky-600/30 via-amber-600/20 to-stone-900",
    "aliases": [
      "woody",
      "buzz lightyear",
      "pixar",
      "juguetes"
    ],
    "approxMovies": 5,
    "yearRange": "1995 - 2026",
    "backdropPath": "/hApclyB9NEZEQujAVajzi5iWE4a.jpg",
    "posterPath": "/ss7QQlifXEiDVE4krmCsNHuIovh.jpg"
  },
  {
    "id": 2150,
    "name": "Shrek",
    "universe": "DreamWorks Animation",
    "category": [
      "animation"
    ],
    "tagline": "El ogro del pantano que deconstruyó los cuentos de hadas con humor irreverente.",
    "badge": "Clásico DreamWorks",
    "accentColor": "from-emerald-600/30 via-lime-700/20 to-stone-900",
    "aliases": [
      "shrek",
      "burro",
      "fiona",
      "gato con botas",
      "pantano"
    ],
    "approxMovies": 5,
    "yearRange": "2001 - 2027",
    "backdropPath": "/lhsd1zCsq5UquvcNalmhuddV3tI.jpg",
    "posterPath": "/kbZ0L9Jx44ObEltogQ6gkLo7dFL.jpg"
  },
  {
    "id": 89137,
    "name": "Cómo Entrenar a tu Dragón",
    "universe": "Isla de Berk / DreamWorks",
    "category": [
      "animation",
      "sci-fi"
    ],
    "tagline": "Hipo y Chimuelo en una emocionante aventura de amistad, vuelo y lealtad vikinga.",
    "badge": "Obra Maestra DreamWorks",
    "accentColor": "from-cyan-600/30 via-emerald-800/20 to-stone-900",
    "aliases": [
      "how to train your dragon",
      "chimuelo",
      "toothless",
      "hipo",
      "vikingos"
    ],
    "approxMovies": 3,
    "yearRange": "2010 - 2019",
    "backdropPath": "/mvcfPkOvgDJG2lEAxTz0NKqoQLo.jpg",
    "posterPath": "/4tivUzSDcUDm3fbomwPxiEiztIM.jpg"
  },
  {
    "id": 86066,
    "name": "Mi Villano Favorito & Minions",
    "universe": "Illumination Entertainment",
    "category": [
      "animation"
    ],
    "tagline": "Gru, sus hijas adoptivas y el ejército de Minions amarillos conquistando el mundo.",
    "badge": "Fenómeno Global",
    "accentColor": "from-yellow-500/30 via-blue-700/20 to-stone-900",
    "aliases": [
      "despicable me",
      "minions",
      "gru",
      "banana"
    ],
    "approxMovies": 4,
    "yearRange": "2010 - 2024",
    "backdropPath": "/37xamYKRUGCRux532lKcZdVGYuR.jpg",
    "posterPath": "/xiA6S0XNwMCMERS18ekGQPohIYr.jpg"
  },
  {
    "id": 77816,
    "name": "Kung Fu Panda",
    "universe": "Valle de la Paz / DreamWorks",
    "category": [
      "animation",
      "action"
    ],
    "tagline": "Po, el Guerrero Dragón, dominando el kung fu entre fideos, sabiduría y grandes combates.",
    "badge": "Acción Animada",
    "accentColor": "from-red-600/30 via-amber-600/20 to-stone-900",
    "aliases": [
      "po",
      "panda",
      "shifu",
      "guerrero dragon",
      "dreamworks"
    ],
    "approxMovies": 4,
    "yearRange": "2008 - 2024",
    "backdropPath": "/2nbtv33hEk2CTnuMhTGZgsFdi3K.jpg",
    "posterPath": "/fbgmC0eQJ8KNRwBrjMJgtG9POdn.jpg"
  },
  {
    "id": 8354,
    "name": "La Era de Hielo (Ice Age)",
    "universe": "Blue Sky Studios",
    "category": [
      "animation"
    ],
    "tagline": "Manny, Sid, Diego y la incansable Scrat con su bellota en el gélido pleistoceno.",
    "badge": "Aventura Glacial",
    "accentColor": "from-cyan-600/30 via-sky-800/20 to-stone-900",
    "aliases": [
      "ice age",
      "manny",
      "sid",
      "scrat",
      "diego",
      "era de hielo"
    ],
    "approxMovies": 7,
    "yearRange": "2002 - 2027",
    "backdropPath": "/2aMEn3wawIXva2xFFlQ2NClLEeW.jpg",
    "posterPath": "/p9CeKvb8jbdoGYiceFA8Kt1XlAo.jpg"
  },
  {
    "id": 14740,
    "name": "Madagascar",
    "universe": "Zoológico Central Park / DreamWorks",
    "category": [
      "animation"
    ],
    "tagline": "Alex, Marty, Melman, Gloria y los astutos pingüinos en su escape a la vida salvaje.",
    "badge": "Comedia Salvaje",
    "accentColor": "from-amber-600/30 via-orange-700/20 to-stone-900",
    "aliases": [
      "alex el leon",
      "pinguinos de madagascar",
      "julien",
      "dreamworks"
    ],
    "approxMovies": 3,
    "yearRange": "2005 - 2012",
    "backdropPath": "/lzTIAbvMeGWB7PUrmBZXulGA28M.jpg",
    "posterPath": "/ymjnyrSAfdS2n4lcCW28E0WR3fy.jpg"
  },
  {
    "id": 87118,
    "name": "Cars",
    "universe": "Radiador Springs / Pixar",
    "category": [
      "animation"
    ],
    "tagline": "El Rayo McQueen descubriendo que la gloria de la Copa Pistón no es lo único en la vida.",
    "badge": "Clásico Pixar",
    "accentColor": "from-red-600/30 via-amber-600/20 to-stone-900",
    "aliases": [
      "rayo mcqueen",
      "mate",
      "copa piston",
      "pixar"
    ],
    "approxMovies": 3,
    "yearRange": "2006 - 2017",
    "backdropPath": "/A8DqaTGwZ8iCEjWMNRsZumzfKLw.jpg",
    "posterPath": "/80jF2zPsWdr2RE00UUQwGXQVUce.jpg"
  }
];

// In-memory cache for saga detail requests during session
const sagaDetailsCache = new Map<number, { data: TMDBCollectionDetails; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export async function getCachedSagaDetails(id: number): Promise<TMDBCollectionDetails | null> {
  const cached = sagaDetailsCache.get(id);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const data = await getCollectionDetails(id);
    if (data && data.parts) {
      // Sort parts chronologically by release_date
      data.parts.sort((a, b) => {
        const dateA = a.release_date || "9999";
        const dateB = b.release_date || "9999";
        return dateA.localeCompare(dateB);
      });
      sagaDetailsCache.set(id, { data, timestamp: Date.now() });
      return data;
    }
    return null;
  } catch (err) {
    console.warn(`Error cargando detalles de saga ${id}:`, err);
    return null;
  }
}

export * from "./secondarySagas";

