export interface SecondarySaga {
  id: number;
  name: string;
  fullName: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview?: string;
  partIds: number[];
  totalMovies: number;
  yearRange?: string;
  totalVotes?: number;
}

export const SECONDARY_SAGAS: SecondarySaga[] = [
  {
    "id": 453993,
    "name": "Wolverine",
    "fullName": "Wolverine - Colección",
    "poster_path": "/9RaDz9aX9CPqN1h9QqpMiQdvlaY.jpg",
    "backdrop_path": "/1RCXCJzxCiw95qpZWaHHc4ctU1u.jpg",
    "overview": "Una serie de películas de superhéroes basada en el personaje de cómic del mismo nombre publicado por Marvel Comics. La serie se centra en Wolverine, un mutante que posee sentidos de animal, capacidades físicas mejoradas, una poderosa capacidad regenerativa conocida como factor de curación, y tres garras retráctiles en cada mano. El alter ego de Wolverine es James Howlett y también es conocido como Logan o Arma X.",
    "partIds": [
      2080,
      76170,
      263115
    ],
    "totalMovies": 3,
    "yearRange": "2009 - 2017",
    "totalVotes": 43197
  },
  {
    "id": 422834,
    "name": "Ant-Man",
    "fullName": "Ant-Man - Colección",
    "poster_path": "/xB3aMpyK190oEkvOgFxvhVaqD7k.jpg",
    "backdrop_path": "/2KjtWUBiksmN8LsUouaZnxocu5N.jpg",
    "overview": "Una serie de películas de superhéroes basada en el personaje de Marvel Comics, Ant-Man, y parte de la serie Universo Cinematográfico Marvel (UCM). La serie se centra en Scott Lang, un exconvicto que robó un traje que le permite cambiar su talla. Hank Pym, el Ant-Man original, descubrió las partículas subatómicas que hacen posible la transformación. Hank aconseja a Scott que se haga cargo del alias de superhéroe.",
    "partIds": [
      102899,
      363088,
      640146
    ],
    "totalMovies": 3,
    "yearRange": "2015 - 2023",
    "totalVotes": 42119
  },
  {
    "id": 86119,
    "name": "¿Qué pasó ayer?",
    "fullName": "¿Qué pasó ayer? - Colección",
    "poster_path": "/yXucgmWc6dyIDhEYq1gG9BYrbFI.jpg",
    "backdrop_path": "/9tpB49XNPEvxEkdsIkJWP0sZWtf.jpg",
    "overview": "¿Qué pasó ayer? es una película de comedia estadounidense de 2009, coproducida y dirigida por Todd Phillips y escrita por Jon Lucas y Scott Moore. Es la primera película de la franquicia The Hangover. La película está protagonizada por Bradley Cooper, Ed Helms, Zach Galifianakis, Heather Graham, Justin Bartha y Jeffrey Tambor. The Hangover cuenta la historia de Phil Wenneck, Stu Price y Alan Garner, quienes viajan a Las Vegas para una despedida de soltero para celebrar el inminente matrimonio de su amigo Doug Billings. Sin embargo, Phil, Stu y Alan no recuerdan los eventos de la noche anterior y deben encontrar a Doug antes de la boda. Le siguieron 2 secuelas.",
    "partIds": [
      18785,
      45243,
      109439
    ],
    "totalMovies": 3,
    "yearRange": "2009 - 2013",
    "totalVotes": 39739
  },
  {
    "id": 435259,
    "name": "Animales Fantásticos",
    "fullName": "Animales Fantásticos - Colección",
    "poster_path": "/vQo7HFK0Ix6S2ZApefYZel66FAi.jpg",
    "backdrop_path": "/oTAuBBcUiUBNKxurftOmEAoye0a.jpg",
    "overview": "Las películas de Animales Fantásticos son una serie fantástica basada e inspirada en el libro de texto mencionado en las novelas de Harry Potter de la escritora británica J. K. Rowling. Establecido en la misma franquicia de Wizarding World, siguen las aventuras de Newt Scamander, un autoproclamado magizoólogo, junto con Porpentina «Tina» Goldstein un auror de MACUSA.",
    "partIds": [
      259316,
      338952,
      338953
    ],
    "totalMovies": 3,
    "yearRange": "2016 - 2022",
    "totalVotes": 37099
  },
  {
    "id": 495527,
    "name": "Jumanji",
    "fullName": "Jumanji - Colección",
    "poster_path": "/tFxNyzeDRXd3k0NIJA82n0uodx0.jpg",
    "backdrop_path": "/lk1rUYIZZ8yBIfkPhr0Llwdda28.jpg",
    "overview": "Una serie de películas basadas en un libro ilustrado infantil de 1981 del mismo nombre, escrito e ilustrado por el autor estadounidense Chris Van Allsburg. Siguen las aventuras de varias personas que se encuentran en peligro al jugar un juego de mesa mágico llamado Jumanji que atrapará a los jugadores dentro de su peligroso mundo selvático o desatará sus amenazas en el mundo real. La única forma de escapar es terminar el juego mientras soporta los peligros restantes con cada movimiento.",
    "partIds": [
      8844,
      353486,
      512200,
      1260649
    ],
    "totalMovies": 4,
    "yearRange": "1995 - 2026",
    "totalVotes": 36119
  },
  {
    "id": 209131,
    "name": "El Hombre de Acero",
    "fullName": "El Hombre de Acero - Colección",
    "poster_path": "/p3aMbHfdrzoJaEnRZ7HAyCLXBc6.jpg",
    "backdrop_path": "/rPaqhsSMCky0UXVW4qmNOJq5Orp.jpg",
    "overview": "El Hombre de Acero es una película de superhéroes británico-estadounidense de 2013 que presenta al personaje de DC Comics Superman. Fue coproducida por Legendary Pictures y Syncopy Films, y distribuida por Warner Bros. Pictures. Es la primera entrega del DC Extended Universe. Dirigida por Zack Snyder y escrita por David S. Goyer, la película está protagonizada por Henry Cavill como personaje principal. Es un reinicio de la serie de películas de Superman. Batman v Superman: Dawn of Justice, una secuela de 2016, es la primera película de acción en vivo que presenta a Batman y Superman juntos.",
    "partIds": [
      49521,
      209112
    ],
    "totalMovies": 2,
    "yearRange": "2013 - 2016",
    "totalVotes": 36147
  },
  {
    "id": 618529,
    "name": "Doctor Strange",
    "fullName": "Doctor Strange - Colección",
    "poster_path": "/bS2ck2fPtMjCfUSCegCu6SwuWmB.jpg",
    "backdrop_path": "/t7Xl8fNVuETzrbpmf6dGosjIHPN.jpg",
    "overview": "",
    "partIds": [
      284052,
      453395
    ],
    "totalMovies": 2,
    "yearRange": "2016 - 2022",
    "totalVotes": 35023
  },
  {
    "id": 558216,
    "name": "Venom",
    "fullName": "Venom - Colección",
    "poster_path": "/lzQgrRH0xkhlY0eTg8kFXlKd7KT.jpg",
    "backdrop_path": "/vq340s8DxA5Q209FT8PHA6CXYOx.jpg",
    "overview": "",
    "partIds": [
      335983,
      580489,
      912649
    ],
    "totalMovies": 3,
    "yearRange": "2018 - 2024",
    "totalVotes": 33769
  },
  {
    "id": 137697,
    "name": "Buscando a Nemo",
    "fullName": "Buscando a Nemo - Colección",
    "poster_path": "/uWZOw40cP3hc6v985pTxqBUogz0.jpg",
    "backdrop_path": "/yzqaKAhglTrkeOfuIXYYArf0WnA.jpg",
    "overview": "Buscando a Nemo (Buscando a Nemo) es una película de animación de Pixar Animation Studios de 2003, ganadora del Premio de la Academia 2004 a la Mejor Película de Animación. La película está dedicada al animador Glenn McQueen, quien murió de melanoma antes del final de la película en octubre de 2002, a la edad de 41 años. En abril de 2013, se anunció una secuela titulada Finding Dory que se estrenó en los cines de EE. UU. El 17 de junio de 2016 y en los cines italianos el 15 de septiembre de 2016. [4] La película también es un derivado, ya que se centra en Dory y ya no en Nemo.",
    "partIds": [
      12,
      127380
    ],
    "totalMovies": 2,
    "yearRange": "2003 - 2016",
    "totalVotes": 34001
  },
  {
    "id": 468222,
    "name": "Los Increíbles",
    "fullName": "Los Increíbles - Colección",
    "poster_path": "/ihIasSnTG1fUz274Omy4dEjx1rQ.jpg",
    "backdrop_path": "/6oi6V1O9MJRNnfV8E9JMntmFqBD.jpg",
    "overview": "La colección Los Increíbles es una serie de películas de animación norteamericanas producidas por Disney y creadas por Pixar Animation Studios.",
    "partIds": [
      9806,
      260513,
      1327821
    ],
    "totalMovies": 3,
    "yearRange": "2004 - 2028",
    "totalVotes": 33420
  },
  {
    "id": 531242,
    "name": "Escuadrón suicida",
    "fullName": "Escuadrón suicida - Colección",
    "poster_path": "/qIWrWjm01lYjKrmjnefdXKtPGeV.jpg",
    "backdrop_path": "/e0uUxFdhdGLcvy9eC7WlO2eLusr.jpg",
    "overview": "Serie cinematográfica basada en el equipo de personajes antihéroes de DC Comics, Escuadrón Suicida.",
    "partIds": [
      297761,
      436969
    ],
    "totalMovies": 2,
    "yearRange": "2016 - 2021",
    "totalVotes": 32488
  },
  {
    "id": 137696,
    "name": "Monsters, Inc.",
    "fullName": "Monsters, Inc. - Colección",
    "poster_path": "/szLXxjxpO5OqmdXCTbzyDmPtqnl.jpg",
    "backdrop_path": "/x4Mq7gDRhbqDjw4SkemLvd1yzF3.jpg",
    "overview": "Los monstruos necesitan de los gritos para electrificar su mundo. Películas animadas de comedia/aventura producidas por Pixar Animation Studios.",
    "partIds": [
      585,
      62211
    ],
    "totalMovies": 2,
    "yearRange": "2001 - 2013",
    "totalVotes": 31977
  },
  {
    "id": 529892,
    "name": "Pantera Negra",
    "fullName": "Pantera Negra - Colección",
    "poster_path": "/v9bjbRXf6Du06QYpDNvteQovXLN.jpg",
    "backdrop_path": "/nsiBzWsmmerBMuD8TKHpYBTnfhD.jpg",
    "overview": "La serie de películas de Marvel Pantera Negra.",
    "partIds": [
      284054,
      505642,
      1386618
    ],
    "totalMovies": 3,
    "yearRange": "2018 - 2028",
    "totalVotes": 31945
  },
  {
    "id": 283579,
    "name": "Divergente",
    "fullName": "Divergente - Colección",
    "poster_path": "/kqEMWO8wGrXmW6HQ9GohTwV10hE.jpg",
    "backdrop_path": "/51XPQ6WXQDRUu9YoujqSc10OQp2.jpg",
    "overview": "Divergent (en español: Divergente) es una trilogía para jóvenes-adultos de aventura y ciencia ficción, escrita por Veronica Roth. La trilogía se compone de Divergente, Insurgente y Leal.1​ Ha sido comparada con libros para adultos jóvenes similares, tales como Los juegos del hambre, por su temática y el público al que se dirige. Roth dijo que la idea para la serie nació mientras estudiaba en la universidad.",
    "partIds": [
      157350,
      262500,
      262504
    ],
    "totalMovies": 3,
    "yearRange": "2014 - 2016",
    "totalVotes": 31568
  },
  {
    "id": 422837,
    "name": "Blade Runner",
    "fullName": "Blade Runner - Colección",
    "poster_path": "/52G5Zwa07sq9Hu7ZcNZ9SNYJYar.jpg",
    "backdrop_path": "/li3buIx57ph3RX5XlbpMzJPewZ0.jpg",
    "overview": "Una serie de películas de ciencia ficción neo-noir estadounidense ambientada en un distópico Los Ángeles, que describe un futuro en el que los humanos sintéticos conocidos como \"replicantes\" son bio-diseñados por la poderosa Tyrell Corporation, para trabajar en colonias fuera del mundo. Basadas en la novela de Philip K. Dick: ¿Sueñan los androides con ovejas eléctricas?",
    "partIds": [
      78,
      335984
    ],
    "totalMovies": 2,
    "yearRange": "1982 - 2017",
    "totalVotes": 31353
  },
  {
    "id": 382685,
    "name": "Los ilusionistas",
    "fullName": "Los ilusionistas - Colección",
    "poster_path": "/3eCFw7XtnYbdKcrbuMepKnKWBby.jpg",
    "backdrop_path": "/scBzORmLqP00h8hPKS19TLtyRQm.jpg",
    "overview": "Es una serie de películas de suspenso estadounidenses dirigidas por Louis Leterrier y Jon M. Chu (Solo la segunda película). Las películas cuentan con un elenco que incluye a Jesse Eisenberg, Daniel Radcliffe, Mark Buffalo, Woody Harrelson, Melanie Laurent, Isla Fisher, Dave Franco, Michael Caine y Morgan Freeman.",
    "partIds": [
      75656,
      291805,
      425274,
      1457735
    ],
    "totalMovies": 4,
    "yearRange": "2013 - 2025",
    "totalVotes": 30992
  },
  {
    "id": 477962,
    "name": "IT",
    "fullName": "IT - Colección",
    "poster_path": "/v6RMLOVILBB7JpKkXjmf2oKgg0p.jpg",
    "backdrop_path": "/zTlvziOLzdUqUqQ3KZ4W9ex4sBD.jpg",
    "overview": "Películas dirigidas por Andy Muschietti. El payaso Pennywise es interpretado por Bill Skarsgård. La primer película abarca los eventos de la infancia de los protagonistas aunque reambientada a fines de la década de 1980. La segunda parte abarca la historia de los niños, pero ahora en sus versiones adultas.",
    "partIds": [
      346364,
      474350
    ],
    "totalMovies": 2,
    "yearRange": "2017 - 2019",
    "totalVotes": 30678
  },
  {
    "id": 468552,
    "name": "Mujer Maravilla",
    "fullName": "Mujer Maravilla - Colección",
    "poster_path": "/dTpuMhFUMVnvrSKxn6nDmheljdN.jpg",
    "backdrop_path": "/n9KlvCOBFDmSyw3BgNrkUkxMFva.jpg",
    "overview": "Una serie de películas basada en la superheroína de DC Comics, Wonder Woman.",
    "partIds": [
      297762,
      464052
    ],
    "totalMovies": 2,
    "yearRange": "2017 - 2020",
    "totalVotes": 30589
  },
  {
    "id": 17255,
    "name": "Resident Evil",
    "fullName": "Resident Evil - Colección",
    "poster_path": "/2rOr1CPnC5fuTbVIKH0UkqJJjjw.jpg",
    "backdrop_path": "/3hqSP5YGsbOjNZ4ymcg3wnGPgSW.jpg",
    "overview": "La serie de películas Resident Evil se basa libremente en los videojuegos de Capcom del mismo nombre. Las películas siguen a la protagonista Alice, un personaje creado para las películas. Umbrella Corporation actúa como el principal antagonista, una empresa farmacéutica de bioingeniería responsable del apocalipsis zombi como resultado de la fundación del virus T.",
    "partIds": [
      1576,
      1577,
      7737,
      35791,
      71679,
      173897
    ],
    "totalMovies": 6,
    "yearRange": "2002 - 2016",
    "totalVotes": 29548
  },
  {
    "id": 344830,
    "name": "Cincuenta Sombras",
    "fullName": "Cincuenta Sombras - Colección",
    "poster_path": "/psdNMAHcEYHKtLqL4PH5oQa9qPk.jpg",
    "backdrop_path": "/f7F56YyMX9G6L4ffqNpA9zlG6fm.jpg",
    "overview": "\"Cincuenta sombras de Grey\" es una colección de películas estadounidense de 2015, del género drama romántico erótico dirigida por Sam Taylor-Johnson, con guión de Kelly Marcel. La película se basa en la novela homónima del escritor británico E. L. James y esta protagonizada por la estrella Dakota Johnson como Anastasia Steele, una graduada universitaria que comienza una relación sadomasoquista con el joven magnate de los negocios Christian Grey, interpretado por Jamie Dornan. Es la primera película de la serie cinematográfica \"Cincuenta sombras de Grey\". Sus secuelas, \"Cincuenta sombras más oscuras\" fue lanzado el 10 de febrero de 2017 y \"Cincuenta sombras liberadas\" está programado para ser lanzado el 9 de febrero de 2018.",
    "partIds": [
      216015,
      341174,
      337167
    ],
    "totalMovies": 3,
    "yearRange": "2015 - 2018",
    "totalVotes": 29065
  },
  {
    "id": 256322,
    "name": "12 Horas para sobrevivir (La Purga)",
    "fullName": "12 Horas para sobrevivir (La Purga) - Colección",
    "poster_path": "/4M3jliqWFbGErsrFc7oJEaj3HBf.jpg",
    "backdrop_path": "/zLx0VxpzJt3E0cb4GodV10Wp0Lt.jpg",
    "overview": "\"La Purga\" es una película de acción y terror norteamericana del 2013 escrita y dirigida por James DeMonaco y la primera entrega de una saga de películas sobre la purga de DeMonaco. La película protagonizada por Ethan Hawke, Lena Headey, Adelaide Kane y Max Burkholder como un rehén de la familia durante \"The Purge\", un evento en el que se formaliza el crimen durante 12 horas. Una secuela, titulada \"12 Horas para sobrevivir\", fue estrenada mundialmente el 18 de julio de 2014 y tuvo un éxito aún mayor. Una tercera película, titulada \"12 horas para sobrevivir: El año de la elección\", se estrenó el 1 de julio de 2016.",
    "partIds": [
      158015,
      238636,
      316727,
      442249,
      602223
    ],
    "totalMovies": 5,
    "yearRange": "2013 - 2021",
    "totalVotes": 28580
  },
  {
    "id": 9743,
    "name": "Hannibal Lecter - La Antología",
    "fullName": "Hannibal Lecter - La Antología",
    "poster_path": "/dhXQvL1rkShIP5dpoevZliIONsA.jpg",
    "backdrop_path": "/yiwhEr1BV3K9fCsZuFxUHtZezHZ.jpg",
    "overview": "Una serie de películas de suspenso psicológico estadounidense, adaptada de la novela de Thomas Harris del mismo nombre. Hannibal es una secuela de la película ganadora de un Oscar en 1991, El silencio de los corderos, que devuelve a Anthony Hopkins a su papel icónico como asesino en serie de Hannibal Lecter. Julianne Moore es co-protagonista, sustituyendo a Jodie Foster en el papel de la agente del FBI Clarice Starling. La precuela del Dragón Rojo protagonizada por Edward Norton como agente del FBI, Will Graham. Original Manhunter y Hannibal Rising sin Hopkins.",
    "partIds": [
      274,
      9740,
      9533
    ],
    "totalMovies": 3,
    "yearRange": "1991 - 2002",
    "totalVotes": 28926
  },
  {
    "id": 386382,
    "name": "Frozen",
    "fullName": "Frozen - Colección",
    "poster_path": "/uU80Pu8BhEHzZ5Z1ZLjzFe4KnE3.jpg",
    "backdrop_path": "/s3vdRkK7KZFUDC8HEJo2GRKyVhW.jpg",
    "overview": "Frozen presenta el amor fraternal entre la intrépida optimista Anna, su misteriosa hermana Elsa y el muñeco de nieve Olaf",
    "partIds": [
      109445,
      330457,
      1024604,
      1205983
    ],
    "totalMovies": 4,
    "yearRange": "2013 - 2027",
    "totalVotes": 28478
  },
  {
    "id": 94032,
    "name": "El rey león",
    "fullName": "El rey león - Colección",
    "poster_path": "/ziOlEr5aYVlNTYz4mpXdKAEzJZl.jpg",
    "backdrop_path": "/A9IEaj9cPAwEgFnTmteB70oxgJY.jpg",
    "overview": "La franquicia cinematográfica gira principalmente sobre un orgullo de leones que supervisan una gran franja de sabana africana como su \"reino\" conocido como las Tierras del Orgullo, con su líder Simba vigilándolo como \"rey\". En la película original, Simba fue engañado para que pensara que había matado a su padre, un cachorro de león lleno de culpa huye al exilio y abandona su identidad como el futuro Rey.",
    "partIds": [
      8587,
      9732,
      11430
    ],
    "totalMovies": 3,
    "yearRange": "1994 - 2004",
    "totalVotes": 28273
  },
  {
    "id": 115575,
    "name": "Star Trek: La realidad alternativa",
    "fullName": "Star Trek: La realidad alternativa - Colección",
    "poster_path": "/xVAWvH5izpy1frt5vxjLPF1g8Ka.jpg",
    "backdrop_path": "/gWl5pN2FplE709aVtA4lakwsE6t.jpg",
    "overview": "La reinterpretación cinematográfica de J.J. Abrams del universo de Star Trek retratado por un nuevo reparto, y ambientado en una realidad alternativa de películas y series anteriores (conocida como la línea temporal «Kelvin»).",
    "partIds": [
      13475,
      54138,
      188927
    ],
    "totalMovies": 3,
    "yearRange": "2009 - 2016",
    "totalVotes": 28015
  },
  {
    "id": 120794,
    "name": "Batman Antologia",
    "fullName": "Batman Antologia  - Colección",
    "poster_path": "/mdg6YKzq4KeBiekFw4KF92LjnAb.jpg",
    "backdrop_path": "/4UHZWw5lV3ZoadTjXuVOakdH32L.jpg",
    "overview": "La serie de películas de la tetralogía de Tim Burton y Joel Schumacher del personaje de DC Comics Batman.",
    "partIds": [
      268,
      364,
      414,
      415
    ],
    "totalMovies": 4,
    "yearRange": "1989 - 1997",
    "totalVotes": 27578
  },
  {
    "id": 135483,
    "name": "Búsqueda implacable",
    "fullName": "Búsqueda implacable - Colección",
    "poster_path": "/pr7Lyx5z7CPuGNBSHMadGB3qouB.jpg",
    "backdrop_path": "/kv2zhXfePOrk5fKrkYn38MoBCUg.jpg",
    "overview": "Buqueda Implacable es una colección francesa de películas de acción, con Liam Neeson como Bryan Mills, un ex agente de la CIA, que está siendo erradicado en Europa. La saga tiene tres películas, llamadas Implacable Search 1, 2 y 3, estrenadas en 2008, 2012 y 2015 respectivamente..",
    "partIds": [
      8681,
      82675,
      260346
    ],
    "totalMovies": 3,
    "yearRange": "2008 - 2014",
    "totalVotes": 26116
  },
  {
    "id": 85943,
    "name": "Una noche en el museo",
    "fullName": "Una noche en el museo - Colección",
    "poster_path": "/6LoqD57pBU2Mqwbtd7qfVcdlMuV.jpg",
    "backdrop_path": "/9YJLEgVVzEvGRJ0IzYf7RBnYx1k.jpg",
    "overview": "La serie de películas protagonizadas por Ben Stiller como guardia nocturno del Museo de Historia Natural de Nueva York.",
    "partIds": [
      1593,
      18360,
      181533
    ],
    "totalMovies": 3,
    "yearRange": "2006 - 2014",
    "totalVotes": 25144
  },
  {
    "id": 722971,
    "name": "Knives Out",
    "fullName": "Knives Out - Colección",
    "poster_path": "/69ixb1MTgFu1W0a69V9BXzQLVpJ.jpg",
    "backdrop_path": "/G7qYINSq5xyDd0I0zn3DpAssA0.jpg",
    "overview": "",
    "partIds": [
      546554,
      661374,
      812583
    ],
    "totalMovies": 3,
    "yearRange": "2019 - 2025",
    "totalVotes": 24859
  },
  {
    "id": 2326,
    "name": "Inframundo",
    "fullName": "Inframundo - Colección",
    "poster_path": "/21D5C0b2VGQf0SDdqy3d07qJGar.jpg",
    "backdrop_path": "/m0Jk59DluTL3oFUu7FVSuLKQz7c.jpg",
    "overview": "Una serie de películas de acción y terror centradas en vampiros y licántropos. En el siglo V, un hombre llamado Alexander Corvinus fue el único sobreviviente de una plaga que acabó con su aldea. De alguna manera, el cuerpo de Alexander pudo convertir la enfermedad en su propio beneficio y así se convirtió en el primer Inmortal verdadero. Más tarde, tuvo dos hijos que se convirtieron en el primer vampiro y licántropo al ser mordido por un murciélago y un lobo.",
    "partIds": [
      277,
      834,
      12437,
      52520,
      346672
    ],
    "totalMovies": 5,
    "yearRange": "2003 - 2016",
    "totalVotes": 23972
  },
  {
    "id": 2806,
    "name": "American Pie",
    "fullName": "American Pie - Colección",
    "poster_path": "/qaAOP492juk4z5dRJ8qsvOapNG2.jpg",
    "backdrop_path": "/cshrhPYDGfyZz2EcN0HgFklaKdB.jpg",
    "overview": "American Pie es una serie de películas de comedia sexual. La primera película de la serie fue estrenada en 1999, por Universal Pictures, y se convirtió en un fenómeno de cultura pop mundial, un culto entre los jóvenes. La segunda y tercera película se estrenaron a intervalos de dos años, mientras que la cuarta película se estrenó en 2012. Entre 2005 y 2009 se estrenó una serie de películas derivadas titulada American Pie Presents, que incluye cuatro películas directas al vídeo",
    "partIds": [
      2105,
      2770,
      8273,
      71552
    ],
    "totalMovies": 4,
    "yearRange": "1999 - 2012",
    "totalVotes": 23818
  },
  {
    "id": 185103,
    "name": "Hotel Transylvania",
    "fullName": "Hotel Transylvania - Colección",
    "poster_path": "/i0exOA4VmE4YcK4CkbdsDAg68mu.jpg",
    "backdrop_path": "/5MJt6g7k9gADQH4xHn5mOEMa3Vr.jpg",
    "overview": "Hotel Transylvania es una película de animación por computadora en 3D producida por Sony Pictures Animation y distribuida por Columbia Pictures que fue estrenada el 28 de septiembre de 2012.\r Después de la trágica muerte de su esposa Marta, Drácula construye el Hotel Transilvania, un establecimiento de cinco estrellas, con el fin de que los monstruos del mundo puedan estar a salvo de la civilización humana.\r En la secuela , Hotel Transylvania 2, tiene lugar siete años después de la primera película, con el hotel ahora abierto a los huéspedes humanos. Mavis y Johnny tienen un hijo pequeño llamado Dennis, cuya falta de habilidades de vampiro preocupan a su abuelo Drácula.",
    "partIds": [
      76492,
      159824,
      400155,
      585083,
      1615938
    ],
    "totalMovies": 5,
    "yearRange": "2012 - 2027",
    "totalVotes": 23639
  },
  {
    "id": 126125,
    "name": "Los Indestructibles",
    "fullName": "Los Indestructibles - Colección",
    "poster_path": "/yT83YSZqtEPWSB7CpA6sqfdvBIE.jpg",
    "backdrop_path": "/bNMIrbzIIkGfkdNbMrCUuVYZGNp.jpg",
    "overview": "Una serie de películas de acción sobre un grupo de mercenarios de élite. La serie rinde homenaje a las películas de acción de gran éxito de la década de 1980 y principios de 1990, y está protagonizada por una serie de veteranos de acción de esas décadas.",
    "partIds": [
      27578,
      76163,
      138103,
      299054
    ],
    "totalMovies": 4,
    "yearRange": "2010 - 2023",
    "totalVotes": 23354
  },
  {
    "id": 1733,
    "name": "La Momia",
    "fullName": "La Momia - Colección",
    "poster_path": "/k4LMa9UBVJwJyOLBkuc1BJJblJ8.jpg",
    "backdrop_path": "/nm2pU4RJ2vR61vYh93QmqeMPpr1.jpg",
    "overview": "Franquicia que sigue las emocionantes aventuras de un intrépido grupo de exploradores que se enfrentan a antiguas maldiciones, monstruos y peligros sobrenaturales mientras buscan tesoros perdidos y luchan por sobrevivir en un mundo lleno de secretos y peligros ancestrales. De esta serie de tres películas derivaron dos adaptaciones de cómic, tres videojuegos, una serie televisiva animada y una montaña rusa.",
    "partIds": [
      564,
      1734,
      1735,
      1574840
    ],
    "totalMovies": 4,
    "yearRange": "1999 - 2027",
    "totalVotes": 23418
  },
  {
    "id": 531330,
    "name": "Top Gun",
    "fullName": "Top Gun - Colección",
    "poster_path": "/wNUt0VHJ3fVa8EtDMko0kBKyjfB.jpg",
    "backdrop_path": "/10PdtglnvJM2bAv5qeyezzrgUTH.jpg",
    "overview": "",
    "partIds": [
      744,
      361743,
      1229934
    ],
    "totalMovies": 3,
    "yearRange": "1986 - 2022",
    "totalVotes": 21703
  },
  {
    "id": 266672,
    "name": "Ted",
    "fullName": "Ted - Colección",
    "poster_path": "/yPE203RZX7RtbY6GNnzo2jDDjAC.jpg",
    "backdrop_path": "/dGrNuWhapf8T0WH98xTC4LXgk1G.jpg",
    "overview": "Ted es una película de comedia estadounidense de 2012 dirigida por Seth MacFarlane. El guión de MacFarlane, Alec Sulkin y Wellesley Wild es de la historia de MacFarlane. La película está protagonizada por MacFarlane, Mark Wahlberg, Mila Kunis y con Joel McHale y Giovanni Ribisi en papeles secundarios, con MacFarlane como voz del personaje principal. La película cuenta la historia de John Bennett, un nativo de Boston cuyo deseo de infancia da vida a su amigo el oso de peluche Ted. Sin embargo, Ted evita que John y su interés amoroso Lori Collins sigan adelante con sus vidas. Una secuela, Ted 2, fue lanzada el 26 de junio de 2015.",
    "partIds": [
      72105,
      214756
    ],
    "totalMovies": 2,
    "yearRange": "2012 - 2015",
    "totalVotes": 21768
  },
  {
    "id": 404825,
    "name": "Ralph",
    "fullName": "Ralph - Colección",
    "poster_path": "/bPtIXfLAbJOv6dYgNCx8l5msdUo.jpg",
    "backdrop_path": "/8eow0LLABdSYBPIge9TOQgINfT9.jpg",
    "overview": "Una serie de películas de comedia de acción y aventura animada por computadora que sigue las aventuras de los personajes de videojuegos del Litwak's Family Fun Center & Arcade: Wreck-It Ralph, el antagonista del juego arcade Fix-It Felix Jr; Vanellope von Schweetz, un corredor / falla en Sugar Rush; Fix-It Felix Jr., un reparador que es el héroe de Fix-It Felix Jr; Sargento Tamora Jean Calhoun, el personaje principal de Hero's Duty y muchos otros personajes que se presentan a lo largo del camino.",
    "partIds": [
      82690,
      404368
    ],
    "totalMovies": 2,
    "yearRange": "2012 - 2018",
    "totalVotes": 21713
  },
  {
    "id": 523855,
    "name": "El Justiciero",
    "fullName": "El Justiciero - Colección",
    "poster_path": "/iFUJ4RL96NtbNQM2GuBcEYaB0kp.jpg",
    "backdrop_path": "/wac5llYhh0lC24yNWljrcOe4sR9.jpg",
    "overview": "El Justiciero es una película de suspenso de acción y vigilancia estadounidense de 2014, basada libremente en la serie de televisión del mismo nombre de los años ochenta. Una secuela fue lanzada el 20 de julio de 2018, con Washington y Fuqua retornando a la franquicia.",
    "partIds": [
      156022,
      345887,
      926393
    ],
    "totalMovies": 3,
    "yearRange": "2014 - 2023",
    "totalVotes": 20478
  },
  {
    "id": 720879,
    "name": "Sonic",
    "fullName": "Sonic - Colección",
    "poster_path": "/fx5ap8o1RDwSoiEJho98jyussY3.jpg",
    "backdrop_path": "/ggDVF2DhqIQjJI0zUqsWMS2WTcF.jpg",
    "overview": "Sigue las aventuras de Sonic, un erizo antropomórfico nacido con la capacidad de correr más rápido que la velocidad del sonido, de ahí su nombre, y posee reflejos ultrarrápidos para igualar su velocidad.",
    "partIds": [
      454626,
      675353,
      939243,
      1401586
    ],
    "totalMovies": 4,
    "yearRange": "2020 - 2027",
    "totalVotes": 20167
  },
  {
    "id": 212562,
    "name": "Comando Especial",
    "fullName": "Comando Especial - Colección",
    "poster_path": "/6F97MIsw2DgfAk7Gd4cBOmRcoOs.jpg",
    "backdrop_path": "/3fkhNqG2i6dlWZmjg100PFEpbWW.jpg",
    "overview": "Una serie de películas basadas en la vida del programa Jump Street, una unidad policial encubierta en la que detectives de aspecto joven se infiltran en escuelas y entornos similares atendidos por menores para investigar delitos.",
    "partIds": [
      64688,
      187017,
      1712303
    ],
    "totalMovies": 3,
    "yearRange": "2012 - 2027",
    "totalVotes": 20139
  },
  {
    "id": 537982,
    "name": "Tierra de zombies",
    "fullName": "Tierra de zombies - Colección",
    "poster_path": "/6DRKz2e6ADjAXxpKCbMLyDuvLuv.jpg",
    "backdrop_path": "/xND97nArZixB25GxyKtYN7gCpk7.jpg",
    "overview": "Una serie de películas centradas en un grupo de supervivientes que se abren camino a través de un apocalipsis zombi que resultó de una cepa de la enfermedad de las vacas locas que mutó en la «enfermedad de los locos» que se convirtió en la «enfermedad de los zombis locos». Los supervivientes de la epidemia de zombis han aprendido que no es aconsejable apegarse a otros supervivientes porque podrían morir en cualquier momento, por lo que muchos han optado por utilizar su ciudad de origen como apodos.",
    "partIds": [
      19908,
      338967
    ],
    "totalMovies": 2,
    "yearRange": "2009 - 2019",
    "totalVotes": 20071
  },
  {
    "id": 1565,
    "name": "Exterminio",
    "fullName": "Exterminio - Colección",
    "poster_path": "/qJ37LI5D5rDjlPIjRT4PXfqP2nh.jpg",
    "backdrop_path": "/liImaqVpPGo3ddLWkJPeJxvaqCI.jpg",
    "overview": "Una serie de películas de terror post-apocalíptico británicas centradas en los sobrevivientes de una enfermedad transmitida por la sangre llamado Rage después de que la enfermedad hubiera diezmado Gran Bretaña.",
    "partIds": [
      170,
      1562,
      1100988,
      1272837,
      1273002
    ],
    "totalMovies": 5,
    "yearRange": "2002 - 2026",
    "totalVotes": 19791
  },
  {
    "id": 702624,
    "name": "After",
    "fullName": "After - Colección",
    "poster_path": "/4AzJqAKC2FTgFrUEwERgwG3sHr5.jpg",
    "backdrop_path": "/zZTy8G3sEVZNv0yGssgc7DvPUQJ.jpg",
    "overview": "",
    "partIds": [
      537915,
      613504,
      744275,
      744276,
      820525
    ],
    "totalMovies": 5,
    "yearRange": "2019 - 2023",
    "totalVotes": 19300
  },
  {
    "id": 179892,
    "name": "Kick-Ass",
    "fullName": "Kick-Ass - Colección",
    "poster_path": "/77MnvUqDFIlMsRHOUFiyQ3GwVtI.jpg",
    "backdrop_path": "/fYMsCXEMguNlSORJIHydfBgOnty.jpg",
    "overview": "Kick-Ass es una película de superhéroes británico-estadounidense de acción-comedia de 2010 basada en el cómic de Marvel del mismo nombre de Mark Millar y John Romita, Jr. La película fue dirigida por Matthew Vaughn, quien coprodujo con Brad Pitt y co-escribió el guión con Jane Goldman. Es la primera entrega de la serie de películas Kick-Ass. A pesar de haber generado cierta controversia por su profanidad y la violencia ejercida por un niño, Kick-Ass fue bien recibido tanto por los críticos como por el público. En agosto de 2013 se estrenó una secuela titulada Kick-Ass 2 escrita y dirigida por Jeff Wadlow (con el regreso de Vaughn como productor solamente), en la que Taylor-Johnson, Mintz-Plasse y Moretz repitieron sus papeles.",
    "partIds": [
      23483,
      59859
    ],
    "totalMovies": 2,
    "yearRange": "2010 - 2013",
    "totalVotes": 19476
  },
  {
    "id": 363369,
    "name": "Titanes del Pacifico",
    "fullName": "Titanes del Pacifico - Colección",
    "poster_path": "/yzp0XU6S7IeKAOioJ419oX7sddo.jpg",
    "backdrop_path": "/zg60Lc8JJm7j2lAlTtm0jvK6nZO.jpg",
    "overview": "Una serie de películas estadounidenses de acción, mechas y ciencia ficción que sigue a la humanidad en su lucha contra los Kaiju, monstruos gigantes decididos a destruir el mundo.",
    "partIds": [
      68726,
      268896
    ],
    "totalMovies": 2,
    "yearRange": "2013 - 2018",
    "totalVotes": 19445
  },
  {
    "id": 573693,
    "name": "Aquaman",
    "fullName": "Aquaman - Colección",
    "poster_path": "/4OeWL0TgPqaReJo3WtnX215g4Fl.jpg",
    "backdrop_path": "/ieX3uWD8G1OFkATC1LCi5Xw2YlX.jpg",
    "overview": "Serie de películas centrada en el personaje de DC Comics, Aquaman.",
    "partIds": [
      297802,
      572802
    ],
    "totalMovies": 2,
    "yearRange": "2018 - 2023",
    "totalVotes": 18980
  },
  {
    "id": 8580,
    "name": "Karate Kid",
    "fullName": "Karate Kid - Colección",
    "poster_path": "/zymeg72VtbAeFdMzr2f1MfumH9X.jpg",
    "backdrop_path": "/vG9eCvIfSoucQZ9EFEOrSXhesws.jpg",
    "overview": "Las primeras tres películas de la serie siguen a Daniel LaRusso, quien aprende a dominar el karate para siempre a través de la excéntrica tutoría de un conserje llamado Sr. Miyagi. En la cuarta y última película de la serie original, el Sr. Miyagi se convierte en el cuidador de la nieta de su amigo en un intento de alejarla de los problemas.",
    "partIds": [
      1885,
      8856,
      10495,
      11231,
      38575,
      1011477
    ],
    "totalMovies": 6,
    "yearRange": "1984 - 2025",
    "totalVotes": 18697
  },
  {
    "id": 9744,
    "name": "Los 4 Fantásticos",
    "fullName": "Los 4 Fantásticos - Colección",
    "poster_path": "/upUu24JdUHhz8DvLNaYi86pct0T.jpg",
    "backdrop_path": "/u3gPzjUY0iJr8ecZGVwChdSRFZt.jpg",
    "overview": "Películas de superhéroes basadas en el equipo de Marvel Comics del mismo nombre. Cuatro individuos obtuvieron superpoderes después de la exposición a los rayos cósmicos durante una misión científica al espacio exterior: el Señor Fantástico (Reed Richards), la Mujer Invisible (Susan \"Sue\" Storm), la Antorcha Humana (Johnny Storm) y la monstruosa Cosa (Ben Grimm).",
    "partIds": [
      9738,
      1979
    ],
    "totalMovies": 2,
    "yearRange": "2005 - 2007",
    "totalVotes": 18889
  },
  {
    "id": 86027,
    "name": "Aladdín",
    "fullName": "Aladdín - Colección",
    "poster_path": "/pD8EkzcSdtbfqE20mHmAmXFMlH8.jpg",
    "backdrop_path": "/kUHyN9PzQ59e2n3CwqMG99yxBvh.jpg",
    "overview": "Serie de películas portagonizadas por Aladdín y Jasmín, así como Genio y  Abú a lo Iargo de sus aventuras por El medio Oriente.",
    "partIds": [
      812,
      15969,
      11238
    ],
    "totalMovies": 3,
    "yearRange": "1992 - 1996",
    "totalVotes": 17837
  },
  {
    "id": 1241984,
    "name": "Moana",
    "fullName": "Moana - Colección",
    "poster_path": "/vOZT1x1mepn499xyMBbLpkK35o1.jpg",
    "backdrop_path": "/7rgHEYy23gAmxTyxivGXBTBikA1.jpg",
    "overview": "La colección original de Disney se desarrolla en la antigua Polinesia y cuenta la historia de Vaiana, la hija de voluntad fuerte de un jefe de un pueblo costero, que es elegida por el propio océano para reunir una reliquia mística con la diosa Te Fiti.",
    "partIds": [
      277834,
      1241982,
      1647287
    ],
    "totalMovies": 3,
    "yearRange": "2016 - 2024",
    "totalVotes": 17407
  },
  {
    "id": 304378,
    "name": "Día de la Independencia",
    "fullName": "Día de la Independencia - Colección",
    "poster_path": "/1doONb75E7H04yGsrQ21bN2Qiqi.jpg",
    "backdrop_path": "/p7oqa94XgNGVMazXwR49QfyGgtx.jpg",
    "overview": "Independence Day (a veces llamado ID4) es una película de ciencia ficción épica estadounidense de 1996. Dirigida y escrita por Roland Emmerich, se considera un importante punto de inflexión en la historia de la superproducción de Hollywood. La película se centra en grupos dispares de personas que convergen en el desierto de Nevada a raíz de un ataque mortífero de una raza extraterrestre ostensiblemente poderosa de origen desconocido. Junto con el resto de la población humana, lanzan un contraataque de última hora el 4 de julio, la misma fecha que el Día de la Independencia en los Estados Unidos. Una secuela, Independence Day: Contraataque, fue estrenada el 24 de junio de 2016.",
    "partIds": [
      602,
      47933
    ],
    "totalMovies": 2,
    "yearRange": "1996 - 2016",
    "totalVotes": 17456
  },
  {
    "id": 735,
    "name": "Blade",
    "fullName": "Blade - Colección",
    "poster_path": "/8UBmQQsaGxHYWyrGP80Amlr3lDO.jpg",
    "backdrop_path": "/d7h60yRgP6US9VYenEPzFGW9saY.jpg",
    "overview": "Blade es una franquicia cinematográfica basada en el personaje ficticio de Marvel Comics del mismo nombre, interpretado por Wesley Snipes. Fueron escritos por David S. Goyer, basados ​​en los cómics de Marv Wolfman y Gene Colan. Las tres películas fueron dirigidas por Stephen Norrington, Guillermo del Toro y Goyer respectivamente y distribuidas por New Line Cinema.  El personaje fue creado en 1973 para Marvel Comics por el escritor Marv Wolfman y el artista Gene Colan y fue un personaje secundario en la tumba cómica de Drácula de la década de 1970. En el cómic, la madre de Blade fue mordida por un vampiro mientras estaba de parto con Blade.",
    "partIds": [
      36647,
      36586,
      36648
    ],
    "totalMovies": 3,
    "yearRange": "1998 - 2004",
    "totalVotes": 16966
  },
  {
    "id": 41437,
    "name": "Actividad Paranormal",
    "fullName": "Actividad Paranormal - Colección",
    "poster_path": "/uXN5Cz3Q0eD0b1J2StL7fUcygrD.jpg",
    "backdrop_path": "/hqKCM2q3ceEzFQJSDUcDmMvd9VS.jpg",
    "overview": "Paranormal Activity es una franquicia de terror sobrenatural y de metraje encontrado estadounidense creado por el director y guionista israelí Oren Peli, la película original se estrenó en 2007.",
    "partIds": [
      23827,
      41436,
      72571,
      82990,
      227348,
      146301,
      609972
    ],
    "totalMovies": 7,
    "yearRange": "2009 - 2021",
    "totalVotes": 16813
  },
  {
    "id": 2366,
    "name": "Tiburón",
    "fullName": "Tiburón - Colección",
    "poster_path": "/jfwoHtkqvwuwHw8qStrFaKInGmC.jpg",
    "backdrop_path": "/1e2QvI2u7Q4d2admK6Xw0AjLjVp.jpg",
    "overview": "Las clásicas películas de terror sobre un gran tiburón blanco que ha estado atacando a la gente de la costa de Nueva Inglaterra y trayendo terror a sus vacaciones en la playa. La primera película fue un gran éxito de taquilla que atrajo a casi 500 millones en todo el mundo y generó el fenómeno cinematográfico de gran éxito y tres secuelas.",
    "partIds": [
      578,
      579,
      17692,
      580
    ],
    "totalMovies": 4,
    "yearRange": "1975 - 1987",
    "totalVotes": 16814
  },
  {
    "id": 402074,
    "name": "Annabelle",
    "fullName": "Annabelle - Colección",
    "poster_path": "/9ry4q9MmCKRo4p5vP2FrC2om2UD.jpg",
    "backdrop_path": "/9e4RfbKBCrQIPKL8Ix8OgibxwJa.jpg",
    "overview": "Una serie de películas de terror sobrenaturales que forma parte de The Conjuring Universe y se inspiró en la historia de una muñeca llamada Annabelle contada por Ed y Lorraine Warren.",
    "partIds": [
      250546,
      396422,
      521029
    ],
    "totalMovies": 3,
    "yearRange": "2014 - 2019",
    "totalVotes": 16765
  },
  {
    "id": 386534,
    "name": "Bajo Fuego",
    "fullName": "Bajo Fuego - Colección",
    "poster_path": "/gm4wax7UCaSqgnAnfcZY57w68tC.jpg",
    "backdrop_path": "/kLGF2qFYVuETxMtHZJgaSGmXK1c.jpg",
    "overview": "",
    "partIds": [
      117263,
      267860,
      423204,
      762409
    ],
    "totalMovies": 4,
    "yearRange": "2013 - 2019",
    "totalVotes": 16519
  },
  {
    "id": 1539140,
    "name": "Godzilla y Kong",
    "fullName": "Godzilla y Kong - Colección",
    "poster_path": "/m4JJ0c2vFu5QDGaMNnhjOLFgkJh.jpg",
    "backdrop_path": "/nB5NgrPi7h1EsFCHUvbzGBXqZ2Z.jpg",
    "overview": "Una colección de películas del MonsterVerse que presentan los encuentros entre Godzilla y Kong.",
    "partIds": [
      293167,
      823464,
      1288438
    ],
    "totalMovies": 3,
    "yearRange": "2017 - 2027",
    "totalVotes": 16305
  },
  {
    "id": 306031,
    "name": "Notas perfectas",
    "fullName": "Notas perfectas - Colección",
    "poster_path": "/7wy7eVv53jAPDUMaR0VcPgyQVYp.jpg",
    "backdrop_path": "/wHrrrxGosHAyPqRZyghyN8pz2dv.jpg",
    "overview": "Una serie de películas de comedia musical siguen al grupo femenino a capella de la Universidad de Barden, Las Barden Bellas.",
    "partIds": [
      114150,
      254470,
      353616
    ],
    "totalMovies": 3,
    "yearRange": "2012 - 2017",
    "totalVotes": 16151
  },
  {
    "id": 945,
    "name": "Arma Mortal",
    "fullName": "Arma Mortal - Colección",
    "poster_path": "/my2y91hz818lRWr3vte4BgCRyOn.jpg",
    "backdrop_path": "/jSslTHuJS86fp4SVJKP9oBhE4s6.jpg",
    "overview": "Arma Mortal es una serie de películas sobre una pareja de policías protagonizada por Mel Gibson y Danny Glover. Se han realizado un total de cuatro películas desde la primera en 1987, y todas han sido un éxito en la taquilla.",
    "partIds": [
      941,
      942,
      943,
      944,
      1528550
    ],
    "totalMovies": 5,
    "yearRange": "1987 - 1998",
    "totalVotes": 15657
  },
  {
    "id": 51509,
    "name": "Los Fockers",
    "fullName": "Los Fockers - Colección",
    "poster_path": "/qCULeI14SuGcDScEoAOxa1bI4b4.jpg",
    "backdrop_path": "/9mNfoET5NlXDVqW2UhJAJp6DR7k.jpg",
    "overview": "Pobre Gaylord Focker. Justo cuando pensó que había hecho lo correcto, al convencer al señor Byrnes (Robert De Niro) de que era el marido ideal para la hija de este primero, las cosas se complicaron mucho. La saga Mi padrastro y yo analiza de cerca las diferencias entre una familia judía liberal y una familia católica militar. El resultado es una variedad de películas divertidas (aunque predecibles) y tiernas. Robert De Niro es excelente en el papel de Jack y Ben Stiller brilla. En definitiva, una saga para ver.",
    "partIds": [
      1597,
      693,
      39451,
      1400336
    ],
    "totalMovies": 4,
    "yearRange": "2000 - 2026",
    "totalVotes": 15484
  },
  {
    "id": 726619,
    "name": "El Stand de los Besos",
    "fullName": "El Stand de los Besos - Colección",
    "poster_path": "/xpWZzEoPtgE7dPV7QqxNDrBnK9c.jpg",
    "backdrop_path": "/6o99Ld3NBMBGbLXWoUWWm8Pq9LA.jpg",
    "overview": "Esta saga sigue las aventuras de Elle Evans, Noah Flynn y Lee Flynn durante sus años de escuela secundaria.",
    "partIds": [
      454983,
      583083,
      727745
    ],
    "totalMovies": 3,
    "yearRange": "2018 - 2021",
    "totalVotes": 14765
  },
  {
    "id": 90863,
    "name": "Una Pareja Explosiva",
    "fullName": "Una Pareja Explosiva - Colección",
    "poster_path": "/cMdX0uhaUfi67m20G889ziOYz2o.jpg",
    "backdrop_path": "/Atik4QqBg8IrTPiCzaj9AcI9p1i.jpg",
    "overview": "La serie de películas Hora Punta es una serie de películas de comedia de artes marciales / acción protagonizada por Jackie Chan y Chris Tucker, dirigida por Brett Ratner y distribuida por New Line Cinema. La trama principal se centra en un par de detectives de la policía: un inspector de la policía china y un detective estadounidense del Departamento de Policía de Los Ángeles que se embarcan en una serie de desventuras que a menudo involucran figuras delictivas corruptas.",
    "partIds": [
      2109,
      5175,
      5174,
      1059776
    ],
    "totalMovies": 4,
    "yearRange": "1998 - 2007",
    "totalVotes": 14682
  },
  {
    "id": 724848,
    "name": "Shazam!",
    "fullName": "Shazam! - Colección",
    "poster_path": "/9So2uWTWLaHYUOLNvgijUiR8XV8.jpg",
    "backdrop_path": "/8yak06wMUWUip8TdDMYc7NpntgR.jpg",
    "overview": "",
    "partIds": [
      287947,
      594767
    ],
    "totalMovies": 2,
    "yearRange": "2019 - 2023",
    "totalVotes": 14329
  },
  {
    "id": 496796,
    "name": "Sicario",
    "fullName": "Sicario - Colección",
    "poster_path": "/5v7ogcZ8b3wRM54q0wEiZMK48yk.jpg",
    "backdrop_path": "/1v5AHV0LXaOrCe0ZJBUbvGeu3BT.jpg",
    "overview": "Un grupo de historias que siguen las operaciones secretas de la CIA en la lucha contra los cárteles de la droga.",
    "partIds": [
      273481,
      400535,
      1786818
    ],
    "totalMovies": 3,
    "yearRange": "2015 - 2018",
    "totalVotes": 14214
  },
  {
    "id": 2794,
    "name": "Las crónicas de Riddick",
    "fullName": "Las crónicas de Riddick - Colección",
    "poster_path": "/f6aRMYXDhkATpds4goCcleAoFMj.jpg",
    "backdrop_path": "/n5jED8ITkX9VgFCZXsznhk9ERbA.jpg",
    "overview": "Riddick, es un criminal espacial de origen \"Furian\", una raza humana en particular conocida por sus inusuales habilidades de fuerza, resistencia, supervivencia y adaptación. Buscado por muchos mercenarios por la rica recompensa que pende sobre su cabeza, se ve obligado a trabajar con ellos para sobrevivir.",
    "partIds": [
      2787,
      2789,
      87421
    ],
    "totalMovies": 3,
    "yearRange": "2000 - 2013",
    "totalVotes": 14232
  },
  {
    "id": 9518,
    "name": "El Transportador",
    "fullName": "El Transportador - Colección",
    "poster_path": "/rhYitEV2F7ob2HYQbqNZOtHPZXX.jpg",
    "backdrop_path": "/zCblZYRAIwNcXx3WxtO0iOyTl8o.jpg",
    "overview": "Sigue las hazañas de Frank Martin, un mensajero profesional independiente conocido como \"el transportador\" (un chofer a sueldo) que entrega paquetes sin hacer preguntas.",
    "partIds": [
      4108,
      9335,
      13387
    ],
    "totalMovies": 3,
    "yearRange": "2002 - 2008",
    "totalVotes": 13990
  },
  {
    "id": 425164,
    "name": "Dragon Ball Z",
    "fullName": "Dragon Ball Z  - Colección",
    "poster_path": "/1hvjfSJzyvXjBVl37fIp1ZisA6m.jpg",
    "backdrop_path": "/7PcbijxTfwi9vjWEfXdS0ReAw8q.jpg",
    "overview": "Dragon Ball Z sigue desde el final de Dragon Ball y cuenta el siguiente capítulo en la vida del guerrero Son-Goku, que ahora está casado y tiene un hijo, a saber, Gohan. En total, la serie de anime consta de cuatro sagas, comenzando con la saga Saiyan, pasando por la saga Freezer y la saga Cell, hasta la saga Boo. Nuevamente se trata de la lucha entre el bien y el mal. Las fuerzas oscuras solo quieren ver arder el mundo. La Z-Troop, dirigida por Goku, se enfrenta a los villanos desagradables y se asegura de que haya paz. Además, Dragon Ball Z cuenta la historia familiar desde Goku hasta el punto en que Gohan da a luz a su hija Pan.",
    "partIds": [
      28609,
      39100,
      39101,
      39102,
      24752,
      39103,
      39104,
      34433,
      39105,
      44251,
      39106,
      39107,
      39108,
      126963,
      303857
    ],
    "totalMovies": 15,
    "yearRange": "1989 - 2015",
    "totalVotes": 13562
  },
  {
    "id": 762512,
    "name": "El rey león (Reinicio)",
    "fullName": "El rey león (Reinicio) - Colección",
    "poster_path": "/sU7piNWqf6KKtQEWPUz2GjqhSkM.jpg",
    "backdrop_path": "/1KeXF239BkqLChcAcF8gKl1stZz.jpg",
    "overview": "Utilizando tecnología avanzada de imágenes generadas por computadora (CGI) en 3D, Disney reimagina la clásica historia de Simba, Mufasa y Scar con una animación fotorrealista.",
    "partIds": [
      420818,
      762509
    ],
    "totalMovies": 2,
    "yearRange": "2019 - 2024",
    "totalVotes": 13751
  },
  {
    "id": 544670,
    "name": "Sing",
    "fullName": "Sing - Colección",
    "poster_path": "/vkN8hzu5eTypmFvgTbAAbzJQd1o.jpg",
    "backdrop_path": "/z9ft5HYHzWcasR6SGcgeluxTznB.jpg",
    "overview": "Serie de películas animadas «Sing» de Universal Pictures.",
    "partIds": [
      335797,
      438695,
      1108794
    ],
    "totalMovies": 3,
    "yearRange": "2016 - 2021",
    "totalVotes": 13548
  },
  {
    "id": 43072,
    "name": "La máscara",
    "fullName": "La máscara - Colección",
    "poster_path": "/sUFfvcO7og8CvcwlJR7wmVqrkrR.jpg",
    "backdrop_path": "/ucDNm5TJW1ji7kIjnX2SZYm7ATM.jpg",
    "overview": "La Máscara es una serie de películas de comedia fantástica americana basada en una serie de cómics publicados por Dark Horse Comics sobre la máscara de Loki. La película original está protagonizada por Jim Carrey como Stanley Ipkiss.",
    "partIds": [
      854,
      10214
    ],
    "totalMovies": 2,
    "yearRange": "1994 - 2005",
    "totalVotes": 13679
  },
  {
    "id": 12263,
    "name": "El Exorcista",
    "fullName": "El Exorcista - Colección",
    "poster_path": "/b5LtKjicF2mWaOYo6r0mbjHtT6S.jpg",
    "backdrop_path": "/pgxFa9jkfOaopuw5kGZ7KgVkhwW.jpg",
    "overview": "La película de 1973 Exorcist, del género de terror, dirigida por William Friedkin. El guión es de William Peter Blatty, basado en un libro del mismo nombre. La película aborda la posesión demoníaca de una niña de 12 años por el demonio Pazuzu. El libro de Blatty se inspiró en un exorcismo de un niño de 14 años documentado en 1949.  La película se convirtió en una de las películas de terror más lucrativas de todos los tiempos, siendo la primera de una serie de películas, ninguna en su apogeo.",
    "partIds": [
      9552,
      11586,
      11587,
      11026,
      12700,
      807172
    ],
    "totalMovies": 6,
    "yearRange": "1973 - 2023",
    "totalVotes": 13381
  },
  {
    "id": 569738,
    "name": "A todos los chicos",
    "fullName": "A todos los chicos - Colección",
    "poster_path": "/x3p6DPEXVerVarv4P2Oh5oPWjBC.jpg",
    "backdrop_path": "/rXBWUDyoujPMcznBsqpetZvWjDF.jpg",
    "overview": "",
    "partIds": [
      466282,
      565426,
      614409
    ],
    "totalMovies": 3,
    "yearRange": "2018 - 2021",
    "totalVotes": 13641
  },
  {
    "id": 403374,
    "name": "Jack Reacher",
    "fullName": "Jack Reacher - Colección",
    "poster_path": "/1HE8zKm7SutPLzAaaPC4ufLZpL6.jpg",
    "backdrop_path": "/vViRXFnSyGJ2fzMbcc5sqTKswcd.jpg",
    "overview": "Una serie de películas de acción, crimen y suspenso basada en las novelas del autor Lee Child sobre Jack Reacher. Reacher viaja por todo Estados Unidos aceptando trabajos temporales e investigando situaciones sospechosas y frecuentemente peligrosas.",
    "partIds": [
      75780,
      343611
    ],
    "totalMovies": 2,
    "yearRange": "2012 - 2016",
    "totalVotes": 13446
  },
  {
    "id": 135179,
    "name": "Sin City",
    "fullName": "Sin City - Colección",
    "poster_path": "/tpexlF1tCpTM49yoXEnKN9DMrHf.jpg",
    "backdrop_path": "/nrn5Uogru1UPhnGZdc0g5Kvkyni.jpg",
    "overview": "La serie de la películas Sin City son películas del género suspense, neo-noir, basadas en la serie de novelas gráficas del mismo nombre creadas por Frank Miller.",
    "partIds": [
      187,
      189
    ],
    "totalMovies": 2,
    "yearRange": "2005 - 2014",
    "totalVotes": 13431
  },
  {
    "id": 179919,
    "name": "Percy Jackson",
    "fullName": "Percy Jackson - Colección",
    "poster_path": "/aqhOdw2tBNLeAuFeLu4BAOPXL7J.jpg",
    "backdrop_path": "/oO0GV9c75uIY42hw8JnOKYBfOek.jpg",
    "overview": "Percy Jackson y los Dioses del Olimpo: El ladrón del rayo (también conocido como Percy Jackson y el ladrón del rayo) es una película de fantasía de 2010 dirigida por Chris Columbus. La película se basa libremente en el ladrón del rayo, la primera novela de la Percy Jackson y la serie de los atletas olímpicos por Rick Riordan. Está protagonizada por Logan Lerman como Percy Jackson junto a un reparto que incluye a Brandon T. Jackson, Alexandra Daddario, Jake Abel, Rosario Dawson, Steve Coogan, Uma Thurman, Catherine Keener, Kevin McKidd, Sean Bean y Pierce Brosnan. Fue lanzado a los cines el 12 de febrero de 2010. Una secuela, Percy Jackson:. Sea of ​​Monsters, fue puesto en libertad el 7 de agosto de 2013.",
    "partIds": [
      32657,
      76285
    ],
    "totalMovies": 2,
    "yearRange": "2010 - 2013",
    "totalVotes": 13463
  },
  {
    "id": 17235,
    "name": "Hellboy",
    "fullName": "Hellboy - Colección",
    "poster_path": "/f1TiCw7t2IagYQSQ6jIa9D3L1qS.jpg",
    "backdrop_path": "/qpFCHvjPCEGDW6RPBCdV9iq1yI4.jpg",
    "overview": "El personaje Hellboy es un demonio que lucha por el gobierno de Estados Unidos y por sí mismo contra fuerzas oscuras como los nazis y Baba Yaga, en una serie de cuentos cuya historia es una amalgama de mitos y folklore, desde la mitología nórdica hasta la griega o rusa incluyendo además muchas referencias a la mitología de Lovecraft.",
    "partIds": [
      1487,
      11253
    ],
    "totalMovies": 2,
    "yearRange": "2004 - 2008",
    "totalVotes": 13451
  },
  {
    "id": 86105,
    "name": "Psicópata Americano",
    "fullName": "Psicópata Americano - Colección",
    "poster_path": "/ko4O9lcRGYOZAF5Hh79Mfsgjpun.jpg",
    "backdrop_path": "/z5cYtp6jrS23RrQPBiJMJpIMwjc.jpg",
    "overview": "",
    "partIds": [
      1359,
      10726
    ],
    "totalMovies": 2,
    "yearRange": "2000 - 2002",
    "totalVotes": 13354
  },
  {
    "id": 87236,
    "name": "Mulan",
    "fullName": "Mulan - Colección",
    "poster_path": "/vj9aNcb3AVDpsPK9KeskcKSJzKQ.jpg",
    "backdrop_path": "/1KkIBhX5MTwVoNJzD0JMv059Ck0.jpg",
    "overview": "La historia tiene lugar en China durante la dinastía Han. Los hunos, liderados por el temido Shan Yu, lanzan una invasión por toda China. El emperador chino está preparando una movilización general de las fuerzas del país, lo que significa que todos los hombres de todas las familias del país están obligados a unirse al ejército chino. Cuando Fa Mulan se entera de que su padre Fa Zhou se está uniendo al ejército, decide ocupar su lugar.",
    "partIds": [
      10674,
      12242
    ],
    "totalMovies": 2,
    "yearRange": "1998 - 2004",
    "totalVotes": 13298
  },
  {
    "id": 119674,
    "name": "Psicosis",
    "fullName": "Psicosis - Colección",
    "poster_path": "/oSsAYKJgQXzVAx342FAmVaSp15u.jpg",
    "backdrop_path": "/qawcCCyJNcdOpDRuXo5aJJycecY.jpg",
    "overview": "Una serie de películas de terror estadounidense protagonizada por Anthony Perkins como el propietario de un motel aislado, Norman Bates.",
    "partIds": [
      539,
      10576,
      12662,
      40377
    ],
    "totalMovies": 4,
    "yearRange": "1960 - 1990",
    "totalVotes": 12880
  },
  {
    "id": 63043,
    "name": "TRON",
    "fullName": "TRON - Colección",
    "poster_path": "/dlaKxCCkax6ZGteNRMpHFuob25I.jpg",
    "backdrop_path": "/4INQEOQ96EvYmANsCZaad9VvRWW.jpg",
    "overview": "TRON es una franquicia de medios estadounidense de ciencia ficción. Comenzó en 1982 con la película Tron de Walt Disney Pictures. Fue seguida por varios productos derivados, una miniserie de cómics, la película secuela de 2010 TRON: El legado y la película secuela de 2025 TRON: Ares.",
    "partIds": [
      97,
      20526,
      533533
    ],
    "totalMovies": 3,
    "yearRange": "1982 - 2025",
    "totalVotes": 12784
  },
  {
    "id": 52984,
    "name": "La Leyenda del Tesoro Perdido",
    "fullName": "La Leyenda del Tesoro Perdido - Colección",
    "poster_path": "/kAjoo0o7thpCPsnH7QZiIChavmu.jpg",
    "backdrop_path": "/a0GLVfaDSf5GNZKK5H4FgGCD2VW.jpg",
    "overview": "La colección de películas de misterio de acción y aventuras protagonizadas por Nicolas Cage como Benjamin Gates, un cazador de tesoros que, con la ayuda de su padre, Patrick Henry Gates (Jon Voight), su novia, Abigail Chase (Diane Kruger) y su leal compañera, Riley Poole (Justin Bartha), descubre tesoros ocultos y secretos del pasado de Estados Unidos.",
    "partIds": [
      2059,
      6637,
      1646437
    ],
    "totalMovies": 3,
    "yearRange": "2004 - 2007",
    "totalVotes": 12828
  },
  {
    "id": 948485,
    "name": "The Batman",
    "fullName": "The Batman - Colección",
    "poster_path": "/gdA2adAPXR7kVTCVZCbXdJMHJag.jpg",
    "backdrop_path": "/6IX81STHKPsSFVCN57sJ3ljwXI5.jpg",
    "overview": "Una versión más oscura, realista y aterrizada de Batman a cargo de Matt Reeves.",
    "partIds": [
      414906,
      806704
    ],
    "totalMovies": 2,
    "yearRange": "2022 - 2028",
    "totalVotes": 12668
  },
  {
    "id": 742536,
    "name": "Megalodón",
    "fullName": "Megalodón - Colección",
    "poster_path": "/yKfXD2fvqvt66Y7K3Sq9hgXBH5N.jpg",
    "backdrop_path": "/rNoyJmjdhgn30bVbvd8n3DJMocB.jpg",
    "overview": "Las aventuras de Jonas Taylor, un buzo de aguas profundas que se enfrenta a un tiburón prehistórico que se cree extinto.",
    "partIds": [
      345940,
      615656
    ],
    "totalMovies": 2,
    "yearRange": "2018 - 2023",
    "totalVotes": 12586
  },
  {
    "id": 153010,
    "name": "La bella y la bestia",
    "fullName": "La bella y la bestia - Colección",
    "poster_path": "/33fO9tGIxUdK33jJrgIlu842it4.jpg",
    "backdrop_path": "/bXCm94g4TXKmACRj02ZlvmKp09m.jpg",
    "overview": "\"La Bella y la Bestia\" es la trigésima película animada de Walt Disney Company. Se estrenó el 22 de noviembre de 1991 en los cines estadounidenses. La película es una adaptación del cuento de hadas del mismo nombre de Jeanne-Marie Leprince de Beaumont sobre una hermosa niña encarcelada en un castillo por un terrible monstruo. Esta película es la primera película de animación nominada al Oscar a la Mejor Película.",
    "partIds": [
      10020,
      13313,
      20235
    ],
    "totalMovies": 3,
    "yearRange": "1991 - 1998",
    "totalVotes": 12579
  },
  {
    "id": 8936,
    "name": "Bridget Jones",
    "fullName": "Bridget Jones - Colección",
    "poster_path": "/x9dkcbLL2jzK0SGONiwjZ5ZE63.jpg",
    "backdrop_path": "/9WuJ3iHkCEm5jtxIRwRAp45QZjL.jpg",
    "overview": "Bridget Jones es una franquicia basada en el columnista de ficción con el mismo nombre. La escritora inglesa Helen Fielding comenzó su columna del Diario de Bridget Jones en The Independent en 1995, relatando la vida de Bridget Jones como una mujer soltera de treinta y tantos años en Londres mientras intenta dar sentido a la vida y al amor con la ayuda de una «familia urbana» sustituta de sus amigos en la década de 1990.",
    "partIds": [
      634,
      9801,
      95610,
      1272149
    ],
    "totalMovies": 4,
    "yearRange": "2001 - 2025",
    "totalVotes": 12497
  },
  {
    "id": 167613,
    "name": "Alvin y las Ardillas",
    "fullName": "Alvin y las Ardillas - Colección",
    "poster_path": "/acaJ890GscojTar8hiLJ9UUo0iF.jpg",
    "backdrop_path": "/oLbsrl70GSwntrXxRxusfeLid0F.jpg",
    "overview": "Alvin y las Ardillas es una película de comedia de acción en vivo estadounidense de 2007 dirigida por Tim Hill. Basada en los personajes del mismo nombre creados por Ross Bagdasarian, Sr., la película está protagonizada por Jason Lee, David Cross y Cameron Richardson con las voces de Justin Long, Matthew Gray Gubler y Jesse McCartney. A la primera película le siguieron tres secuelas: Alvin and the Chipmunks: The Squeakquel, estrenada el 23 de diciembre de 2009, Alvin and the Chipmunks: Chipwrecked, estrenada el 16 de diciembre de 2011 y Alvin and the Chipmunks: The Road Chip, estrenada en diciembre. 18, 2015.",
    "partIds": [
      6477,
      23398,
      55301,
      258509
    ],
    "totalMovies": 4,
    "yearRange": "2007 - 2015",
    "totalVotes": 12263
  },
  {
    "id": 37139,
    "name": "¿Y dónde está el policía?",
    "fullName": "¿Y dónde está el policía? - Colección",
    "poster_path": "/gWg2VOreSC28UGj3qqwfAN3c2tK.jpg",
    "backdrop_path": "/patl2k4AK0S6wVo1DwOp4nmvNLm.jpg",
    "overview": "The Naked Gun es una serie de películas de comedia criminal estadounidense, creada por Zucker, Abrahams y Zucker. Las tres películas están basadas en su serie de televisión anterior Police Squad!",
    "partIds": [
      37136,
      37137,
      36593,
      1035259
    ],
    "totalMovies": 4,
    "yearRange": "1988 - 2025",
    "totalVotes": 12294
  },
  {
    "id": 945475,
    "name": "Beetlejuice",
    "fullName": "Beetlejuice - Colección",
    "poster_path": "/jxp9sLEcIIuuxEm0olA33LAM8JF.jpg",
    "backdrop_path": "/fosuzKaLA43tcW9gzmW5Tc354hf.jpg",
    "overview": "Una serie de películas de comedia y fantasía protagonizadas por el alocado personaje de Beetlejuice, un bioexorcista que ayuda a una pareja de recién fallecidos a espantar a la familia que se mudó a su casa.",
    "partIds": [
      4011,
      917496,
      1428221
    ],
    "totalMovies": 3,
    "yearRange": "1988 - 2024",
    "totalVotes": 12132
  },
  {
    "id": 427084,
    "name": "La vida secreta de tus mascotas",
    "fullName": "La vida secreta de tus mascotas - Colección",
    "poster_path": "/sHSg4kxv8PcoDhLys00equxlv33.jpg",
    "backdrop_path": "/fAibj0DIT8gk5jQtsEor66QKCsR.jpg",
    "overview": "La vida de un grupo de mascotas en Manhattan.",
    "partIds": [
      328111,
      412117
    ],
    "totalMovies": 2,
    "yearRange": "2016 - 2019",
    "totalVotes": 12132
  },
  {
    "id": 14563,
    "name": "El Aro",
    "fullName": "El Aro - Colección",
    "poster_path": "/yxrGLRXF5qiawsgD2aGBce4B9bA.jpg",
    "backdrop_path": "/jXlFymc442CEMB5h3d62GeJefnW.jpg",
    "overview": "Al principio era solo otra leyenda: la existencia de una cinta de video que causaría la muerte del espectador siete días después de su visualización. Pero cuando cuatro adolescentes mueren misteriosamente, solo una semana después de ver una cinta similar, la reportera de investigación Rachel Keller encuentra el video ... y lo ve. La leyenda ahora se convierte en realidad, el tiempo corre y Rachel solo tiene siete días para desentrañar el misterio.",
    "partIds": [
      565,
      10320,
      14564
    ],
    "totalMovies": 3,
    "yearRange": "2002 - 2017",
    "totalVotes": 12128
  },
  {
    "id": 464577,
    "name": "Los Croods",
    "fullName": "Los Croods - Colección",
    "poster_path": "/6uu6UWQzzelyUYcR5GuhrR0oJLf.jpg",
    "backdrop_path": "/8MjzBahFKCuQbwytpPPds7qboQa.jpg",
    "overview": "",
    "partIds": [
      49519,
      529203
    ],
    "totalMovies": 2,
    "yearRange": "2013 - 2020",
    "totalVotes": 12000
  },
  {
    "id": 400700,
    "name": "Buenos vecinos",
    "fullName": "Buenos vecinos - Colección",
    "poster_path": "/ymmExpmp9BLigz8h6nH9VwUuzon.jpg",
    "backdrop_path": "/x5S20jb15ruRQd0gY1ZST9dJP7b.jpg",
    "overview": "Una serie de películas de comedia que sigue a una pareja, Mac y Kelly Radner, que entran en conflicto con una fraternidad, dirigida por Teddy Sanders que se ha mudado recientemente a la casa de al lado. Más tarde entran en conflicto con una nueva hermandad, dirigida por Shelby que alquila al lado.",
    "partIds": [
      195589,
      325133
    ],
    "totalMovies": 2,
    "yearRange": "2014 - 2016",
    "totalVotes": 12161
  },
  {
    "id": 180546,
    "name": "Son como niños",
    "fullName": "Son como niños - Colección",
    "poster_path": "/tGLlcpz4MdD4pWdND3Um7p3OZee.jpg",
    "backdrop_path": "/ahlmYgIHI6oye76bgoUtC01mcrC.jpg",
    "overview": "Son Como Niños es una película de comedia de amigos estadounidense de 2010 dirigida por Dennis Dugan, escrita por Adam Sandler y protagonizada por Sandler, Kevin James, Chris Rock, David Spade y Rob Schneider. Sandler y Fred Wolf escribieron el guión. La película fue producida por la productora de Sandler, Happy Madison Productions y distribuida por Columbia Pictures. Sandler, Rock, Schneider y Spade se unieron al elenco de Saturday Night Live en la temporada 1990-1991; El elenco de apoyo que incluye a Colin Quinn, Maya Rudolph, Tim Meadows y Norm Macdonald también han sido miembros del elenco de SNL. Una secuela, Grown Ups 2, fue lanzada el 12 de julio de 2013.",
    "partIds": [
      38365,
      109418,
      1566991
    ],
    "totalMovies": 3,
    "yearRange": "2010 - 2013",
    "totalVotes": 11781
  },
  {
    "id": 111751,
    "name": "La masacre de Texas",
    "fullName": "La masacre de Texas - Colección",
    "poster_path": "/72stX8QmAXgMdMgW0UIaexDdeS9.jpg",
    "backdrop_path": "/wvBx1Q1FcQE1BPLfBbgA3y9aaS1.jpg",
    "overview": "El original de Tobe Hooper de 1974 cuenta la historia de una familia de antiguos carniceros que degeneraron en caníbales y que persiguen a viajeros desprevenidos. El foco de la serie es siempre el hijo de la familia, llamado Leatherface, que usa máscaras hechas de piel humana y atormenta a sus víctimas con una motosierra eléctrica. La serie original incluye las cuatro primeras películas (1974-1994). En 2003, el exitoso productor Michael Bay filmó un remake de la primera parte. La precuela adjunta de 2006 revela los orígenes de la familia y su hijo psicopático. En 2013, la serie de películas se amplió para incluir una película en 3D.",
    "partIds": [
      30497,
      16337,
      25018,
      16780,
      76617,
      300665,
      632727
    ],
    "totalMovies": 7,
    "yearRange": "1974 - 2022",
    "totalVotes": 11612
  },
  {
    "id": 85861,
    "name": "Un detective suelto en Hollywood",
    "fullName": "Un detective suelto en Hollywood - Colección",
    "poster_path": "/jSWQF1rruhSESCgDfpupiO06xWW.jpg",
    "backdrop_path": "/k0DEUZqbB9bVcm2NsVaMkdd4Vs8.jpg",
    "overview": "Un detective suelto en Hollywood es una serie de películas de acción y comedia protagonizadas por Eddie Murphy como Axel Foley, un policía de Detroit inteligente que viaja a Beverly Hills, California, para investigar delitos fuera de su jurisdicción y ayudar a sus amigos, los detectives locales Rosewood y Taggart. Resolver crimenes.",
    "partIds": [
      90,
      96,
      306,
      280180
    ],
    "totalMovies": 4,
    "yearRange": "1984 - 2024",
    "totalVotes": 11486
  },
  {
    "id": 3167,
    "name": "Ace Ventura",
    "fullName": "Ace Ventura - Colección",
    "poster_path": "/5Tmxq1OtaLTj7cMo3jI5fkRXts3.jpg",
    "backdrop_path": "/dmnZETSqg0HGbEuydbbjluJ15P0.jpg",
    "overview": "Una serie de películas de comedia con Ace Ventura, un excéntrico detective privado con sede en Miami que se especializa en la recuperación de animales domésticos y cautivos.",
    "partIds": [
      3049,
      9273,
      15338
    ],
    "totalMovies": 3,
    "yearRange": "1994 - 2009",
    "totalVotes": 11581
  },
  {
    "id": 96665,
    "name": "Una pareja de idiotas",
    "fullName": "Una pareja de idiotas - Colección",
    "poster_path": "/bkAhPglWif1eTwyReOqEDwOe005.jpg",
    "backdrop_path": "/saUnj5K6buVafDfLfTozDH2eqdC.jpg",
    "overview": "",
    "partIds": [
      8467,
      10152,
      100042
    ],
    "totalMovies": 3,
    "yearRange": "1994 - 2014",
    "totalVotes": 11481
  },
  {
    "id": 33085,
    "name": "La sirenita",
    "fullName": "La sirenita - Colección",
    "poster_path": "/ynX9lPSNLtbwCktU38BgfKW0WY5.jpg",
    "backdrop_path": "/gt7ccJrOgeOTWggy1PubLhWxX9g.jpg",
    "overview": "La Sirenita es una película de fantasía musical animada estadounidense de 1989 producida por Walt Disney Feature Animation y lanzada por Walt Disney Pictures. Basado en el cuento de hadas danés del mismo nombre de Hans Christian Andersen, La Sirenita 2: Regreso al mar es una secuela directa a video de la primera película. Fue lanzado por Walt Disney Studios Home Entertainment en VHS en los Estados Unidos el 19 de septiembre de 2000. La Sirenita: Los comienzos de Ariel es una precuela directa a video de la primera película. La película fue lanzada en el DVD de la Región 1 en los Estados Unidos el 26 de agosto de 2008, y en el DVD de la Región 2 en Europa el 22 de septiembre de 2008.",
    "partIds": [
      10144,
      10898,
      13676
    ],
    "totalMovies": 3,
    "yearRange": "1989 - 2008",
    "totalVotes": 11531
  },
  {
    "id": 280588,
    "name": "Quiero matar a mi jefe",
    "fullName": "Quiero matar a mi jefe - Colección",
    "poster_path": "/nUzSnyRrwXi4VqbUoyqLig6WnKR.jpg",
    "backdrop_path": "/kGvdIEuzy0rHnbIJ0qmnIjRGSKW.jpg",
    "overview": "Dale, Kurt y Nick tienen una suerte horrible cuando se trata de jefes",
    "partIds": [
      51540,
      227159
    ],
    "totalMovies": 2,
    "yearRange": "2011 - 2014",
    "totalVotes": 11526
  },
  {
    "id": 2467,
    "name": "Tomb Raider",
    "fullName": "Tomb Raider - Colección",
    "poster_path": "/psaUpusAidBptNoZSCFn7BCgZHV.jpg",
    "backdrop_path": "/dY55rtfQMOMGHJXGDNfSEyuHPGG.jpg",
    "overview": "Serie de películas que siguen las aventuras de Lara Croft, una intrépida arqueóloga y aventurera que se embarca en emocionantes misiones para desentrañar antiguos misterios y enfrentarse a peligrosos enemigos. Ambas películas exploran el carácter valiente y decidido de Lara Croft, así como su habilidad para enfrentarse a desafíos imposibles mientras lucha por proteger reliquias antiguas y salvar al mundo de fuerzas oscuras.",
    "partIds": [
      1995,
      1996
    ],
    "totalMovies": 2,
    "yearRange": "2001 - 2003",
    "totalVotes": 11361
  },
  {
    "id": 325470,
    "name": "LEGO",
    "fullName": "LEGO - Colección",
    "poster_path": "/oqz0HbsbERCOJtMr7hpSBZm2RSt.jpg",
    "backdrop_path": "/vAyMNou7M2SOXjPIzLhltTvAqD1.jpg",
    "overview": "",
    "partIds": [
      137106,
      280217
    ],
    "totalMovies": 2,
    "yearRange": "2014 - 2019",
    "totalVotes": 11314
  },
  {
    "id": 1006,
    "name": "Austin Powers",
    "fullName": "Austin Powers - Colección",
    "poster_path": "/9STIdyi9GkxP66XH2uc1OgLqv04.jpg",
    "backdrop_path": "/2YHoBMDWa2IwEssDlUs6G2qWVpR.jpg",
    "overview": "Austin Powers es una serie de películas de comedia dirigida por Jay Roach y distribuida por New Line Cinema, y escrita, producida y protagonizada por Mike Myers como el personaje titular. Las películas siguen a Austin Powers, un espía británico, y su búsqueda para llevar al villano Dr. Evil a la justicia. La serie, principalmente parodia de las franquicias de James Bond, Derek Flint, Jason King y Matt Helm, incorporan una miríada de otros elementos de la cultura popular.",
    "partIds": [
      816,
      817,
      818
    ],
    "totalMovies": 3,
    "yearRange": "1997 - 2002",
    "totalVotes": 11366
  },
  {
    "id": 401562,
    "name": "Tortugas Ninja (Remake)",
    "fullName": "Tortugas Ninja (Remake) - Colección",
    "poster_path": "/kTqCDpj3YYchSqiVtVjFexxeTjp.jpg",
    "backdrop_path": "/uzCsSNd3ImvH7Q6DIHAYrG0Q11Q.jpg",
    "overview": "Serie de películas de superhéroes estadounidenses basada en el equipo de superhéroes ficticio del mismo nombre creado por Kevin Eastman y Peter Laird. Estas películas sirvieron como reinicio de las películas de acción real originales.",
    "partIds": [
      98566,
      308531
    ],
    "totalMovies": 2,
    "yearRange": "2014 - 2016",
    "totalVotes": 11252
  },
  {
    "id": 229932,
    "name": "Río",
    "fullName": "Río - Colección",
    "poster_path": "/9oA6WCS66O67YSggUXihoGCVHAm.jpg",
    "backdrop_path": "/kiugUedTheHifkqWyD55IF6I5Zp.jpg",
    "overview": "",
    "partIds": [
      46195,
      172385,
      1523207
    ],
    "totalMovies": 3,
    "yearRange": "2011 - 2014",
    "totalVotes": 11245
  },
  {
    "id": 748919,
    "name": "No respires",
    "fullName": "No respires - Colección",
    "poster_path": "/z7BWNfXoZp2XkiK5dz4dLkQQkt7.jpg",
    "backdrop_path": "/dItuxD2MjMyrMykhHkLDHdZR7Ei.jpg",
    "overview": "Una serie de películas centradas en un exmilitar ciego con un pasado trágico y vengativo.",
    "partIds": [
      300669,
      482373,
      1781980
    ],
    "totalMovies": 3,
    "yearRange": "2016 - 2021",
    "totalVotes": 11140
  },
  {
    "id": 90306,
    "name": "Ghost Rider",
    "fullName": "Ghost Rider - Colección",
    "poster_path": "/2H0amGBlBaH40JOyh2PWMwXI72R.jpg",
    "backdrop_path": "/cNRAWtbItigb2oFwXpcDi6mjMQm.jpg",
    "overview": "Ghost Rider es una serie de películas de terror de superhéroes basada en el personaje del mismo nombre que apareció en Marvel Comics, las películas están protagonizadas por Nicolas Cage como Johnny Blaze, un motociclista acrobático que vende su alma al diablo y se transforma en el vigilante Ghost Rider.",
    "partIds": [
      1250,
      71676
    ],
    "totalMovies": 2,
    "yearRange": "2007 - 2011",
    "totalVotes": 10926
  },
  {
    "id": 70068,
    "name": "Ip Man",
    "fullName": "Ip Man - Colección",
    "poster_path": "/pte0QVZ3OMOHhyDrgihe8us4FbZ.jpg",
    "backdrop_path": "/rVdFzHgzvUcp0lJPGG3Cewy9hgs.jpg",
    "overview": "",
    "partIds": [
      14756,
      37472,
      365222,
      449924
    ],
    "totalMovies": 4,
    "yearRange": "2008 - 2019",
    "totalVotes": 11068
  },
  {
    "id": 722961,
    "name": "Space Jam",
    "fullName": "Space Jam Collection",
    "poster_path": "/2eOB99jzmF1VYJsmDKR6LWqkOKo.jpg",
    "backdrop_path": "/kKIej57OVpFwsOUdn0KooJdJuDg.jpg",
    "overview": "",
    "partIds": [
      2300,
      379686
    ],
    "totalMovies": 2,
    "yearRange": "1996 - 2021",
    "totalVotes": 10907
  },
  {
    "id": 135468,
    "name": "G.I. Joe (Live-Action)",
    "fullName": "G.I. Joe (Live-Action) - Colección",
    "poster_path": "/uSOUMiKk6a7YiEdvOJjOlRc33Jt.jpg",
    "backdrop_path": "/m3ip0ci0TnX0ATUxpweqElYCeq4.jpg",
    "overview": "Una serie de películas de acción de ciencia ficción basada en G.I. Franquicia Joe Toy, inspirada en el cómic y la serie de dibujos animados.",
    "partIds": [
      14869,
      72559
    ],
    "totalMovies": 2,
    "yearRange": "2009 - 2013",
    "totalVotes": 10959
  },
  {
    "id": 9338,
    "name": "Loca Academia de Policía",
    "fullName": "Loca Academia de Policía - Colección",
    "poster_path": "/fKYioUeHRlKtrIx2bzx37OgxW0p.jpg",
    "backdrop_path": "/dEkJGGXnUlH6xEOjE4NYpgf378H.jpg",
    "overview": "Police Academy es una serie de películas de comedia estadounidenses, las primeras seis de las cuales se realizaron en la década de 1980. La séptima y hasta la fecha última entrega, Misión a Moscú, se estrenó en 1994. La nueva película está programada para su producción en 2014. La serie se abrió con Police Academy (1984), que comenzó con la premisa de que un nuevo alcalde había anunciado una política que requería el departamento de policía para aceptar a todos los reclutas dispuestos. La película siguió a un grupo de reclutas inadaptados en sus intentos de demostrar que son capaces de ser agentes de policía. El personaje principal, Carey Mahoney (Steve Guttenberg), era un reincidente que se vio obligado a unirse a la academia de policía como castigo.",
    "partIds": [
      9336,
      10157,
      12118,
      10587,
      11825,
      11895,
      11546
    ],
    "totalMovies": 7,
    "yearRange": "1984 - 1994",
    "totalVotes": 10725
  },
  {
    "id": 458558,
    "name": "Mamma Mia!",
    "fullName": "Mamma Mia! - Colección",
    "poster_path": "/xRbDA4Ys0Y2Bvbnme02fVBwMWFe.jpg",
    "backdrop_path": "/8lmFjt0Lord5vl6iGx3fRlZrBuN.jpg",
    "overview": "Una joven que ha crecido en una pequeña isla griega, ha sido educada por una madre rebelde y poco convencional, que siempre se ha negado a revelarle la identidad de su padre. Cuando, por fin, parece que la joven está a punto de saberlo, aparecen tres posibles candidatos.",
    "partIds": [
      11631,
      458423
    ],
    "totalMovies": 2,
    "yearRange": "2008 - 2018",
    "totalVotes": 10838
  },
  {
    "id": 151,
    "name": "Star Trek: La serie original",
    "fullName": "Star Trek: La serie original - Colección",
    "poster_path": "/eNzMNttF06ndvLqOdHOqSB66TBe.jpg",
    "backdrop_path": "/qM8q2gWAeQF0XUpZ4XZc4CMX87a.jpg",
    "overview": "Nacido de la imaginación del gran Gene Roddenberry, el mundo de Star Trek escribió la historia de la pantalla chica, un éxito que habría dado paso a una saga cinematográfica, paralela a la televisiva, capaz de consagrar Star Trek al Olimpo de la ciencia ficción. Ya a finales de los 70, cuando el mundo se volvió loco por el primer capítulo (perdón, el cuarto ...) de Star Wars.",
    "partIds": [
      152,
      154,
      157,
      168,
      172,
      174
    ],
    "totalMovies": 6,
    "yearRange": "1979 - 1991",
    "totalVotes": 10450
  },
  {
    "id": 8537,
    "name": "Superman",
    "fullName": "Superman - Colección",
    "poster_path": "/l2WfFVl8PoEvLskxowo7k62tywZ.jpg",
    "backdrop_path": "/la0EhOrgVAiY8sf3ILz3wgoaNXH.jpg",
    "overview": "Esta colección incluye la serie original de películas de superhéroes del personaje de DC Comics Superman protagonizada por Christopher Reeve y la quinta y última entrega, Superman Returns, de 2006. La serie se centra en Clark Kent, un kryptoniano del planeta Krypton cuyo nombre de nacimiento es Kal- El. Superman reside en la ciudad de Metrópolis, donde trabaja como periodista para el periódico Daily Planet.",
    "partIds": [
      1924,
      8536,
      9531,
      11411
    ],
    "totalMovies": 4,
    "yearRange": "1978 - 1987",
    "totalVotes": 10521
  },
  {
    "id": 23616,
    "name": "Naruto",
    "fullName": "Naruto - Colección",
    "poster_path": "/ycTVGD8tHOy2eAe9giFC2SQhA70.jpg",
    "backdrop_path": "/prLI2SNNkd9wcQkFh9iWXzQtR5D.jpg",
    "overview": "Naruto es un manga para niños creado para el artista de manga japonés Masashi Kishimoto que gira en torno a dos rivales en el mundo ninja, Naruto Uzumaki y Sasuke Uchinami, y sus experiencias con otros personajes. El manga ha sido serializado en la revista Shonen Manga de Shueisha \"Weekly Shonen Jump\" desde 1999. En 2002, la versión anime para televisión de \"Naruto\" basada en el manga del estudio de anime japonés Studio Pierrot comenzó a transmitirse en TV Tokyo. En 2004, el manga se adaptó a una película. \"Naruto\", que fue serializado durante 15 años, concluyó el 10 de noviembre de 2014 con el episodio 700 del 50º Weekly Shonen Jump del mismo año. \"Naruto the Movie\" es una serie de anime teatral basada en el manga \"Naruto\" de Masashi Kishimoto.",
    "partIds": [
      16907,
      16910,
      18861,
      20982,
      17581,
      36728,
      50723,
      75624,
      118406,
      317442,
      347201
    ],
    "totalMovies": 11,
    "yearRange": "2004 - 2015",
    "totalVotes": 10342
  },
  {
    "id": 86117,
    "name": "Johnny English",
    "fullName": "Johnny English - Colección",
    "poster_path": "/4ICdnU5ieFquD2kIs9Mwt4NGZcR.jpg",
    "backdrop_path": "/pMHHhMKu2iQichL6Eym4ApCvIEB.jpg",
    "overview": "Johnny English es una serie de películas de comedia de acción británicas que parodia el género de agentes secretos de James Bond. Cuenta con Rowan Atkinson como el personaje principal, basado en el guión escrito por Neal Purvis, Robert Wade y William Davies. La serie incluye tres entregas. La serie está impregnada de comedia similar al personaje de Mr. Bean de Atkinson, y ha recaudado 477,8 millones de dólares en todo el mundo.",
    "partIds": [
      9486,
      58233,
      463272,
      1241132
    ],
    "totalMovies": 4,
    "yearRange": "2003 - 2018",
    "totalVotes": 10512
  },
  {
    "id": 526380,
    "name": "Feliz día de tu muerte",
    "fullName": "Feliz día de tu muerte - Colección",
    "poster_path": "/qL9RqxXcguCXUC78UcfDOYBMNqT.jpg",
    "backdrop_path": "/arJ8VLhhp0QrGZ4kQcDXB2Im1vA.jpg",
    "overview": "Feliz día de tu muerte es una película de comedia negra estadounidense de 2017 dirigida por Christopher Landon. La secuela titulada Feliz día de tu muerte 2 fue lanzada el 13 de febrero de 2019.",
    "partIds": [
      440021,
      512196,
      774079
    ],
    "totalMovies": 3,
    "yearRange": "2017 - 2019",
    "totalVotes": 10500
  },
  {
    "id": 74508,
    "name": "REC",
    "fullName": "REC - Colección",
    "poster_path": "/4dMROKV4sAyIHX8PfJhhPs73nGt.jpg",
    "backdrop_path": "/txIG3D9UrvF4QRo8AEjhAeRMYSm.jpg",
    "overview": "Serie de películas de terror españolas creadas por Jaume Balagueró y Paco Plaza. Las películas se centran en una posesión demoníaca viral originada por una joven llamada Tristana Medeiros que fue agredida sexualmente por un grupo de sacerdotes. La serie ha recibido una gran aclamación crítica en todo el mundo.",
    "partIds": [
      8329,
      10664,
      80280,
      185341
    ],
    "totalMovies": 4,
    "yearRange": "2007 - 2014",
    "totalVotes": 10309
  },
  {
    "id": 177467,
    "name": "Lluvia de Hamburguesas",
    "fullName": "Lluvia de Hamburguesas - Colección",
    "poster_path": "/livyEFiUDbRaQ9xDH0rFBjX9bdN.jpg",
    "backdrop_path": "/eANL41F9Zp1xHMD6VnHnD3QS7ui.jpg",
    "overview": "La ciudad de Boca Grande atraviesa tiempos difíciles y sus habitantes solo tienen dinero suficiente para comprar sardinas. Flint Lockwood, un inventor fracasado, cree que tiene la solución a la crisis. Construye una máquina que convierte el agua en comida, convirtiéndose en el héroe de la región. Tuvo una secuencia en 2014.",
    "partIds": [
      22794,
      109451
    ],
    "totalMovies": 2,
    "yearRange": "2009 - 2013",
    "totalVotes": 10270
  },
  {
    "id": 89151,
    "name": "Gremlins",
    "fullName": "Gremlins - Colección",
    "poster_path": "/vkx2ew7u8PQDKt8hf0eyJfg6cxN.jpg",
    "backdrop_path": "/otza3wkQmttOfBLDMc4g1gIfSLT.jpg",
    "overview": "Gremlins es una película de comedia de terror estadounidense de 1984 dirigida por Joe Dante, Steven Spielberg fue el productor ejecutivo de la película y el guión fue escrito por Chris Columbus. La película trata sobre un joven que recibe a una extraña criatura llamada Mogwai como mascota, que luego genera otras criaturas que se transforman en monstruos pequeños, destructivos y malvados. Esta historia continuó con una secuela, Gremlins 2: The New Batch, lanzada en 1990. A diferencia de la secuela más ligera, Gremlins original opta por más comedia negra, que se equilibra con un escenario navideño. Ambas películas fueron el centro de grandes campañas de merchandising.",
    "partIds": [
      927,
      928,
      1423577
    ],
    "totalMovies": 3,
    "yearRange": "1984 - 2028",
    "totalVotes": 10223
  },
  {
    "id": 968052,
    "name": "La monja",
    "fullName": "La monja - Colección",
    "poster_path": "/oeRNXs6iZkiERBTL7BcCLp1n62s.jpg",
    "backdrop_path": "/bKpqH9y3SjovMM3VqzezBbJtuf7.jpg",
    "overview": "Estas películas nos llevan a un oscuro mundo de terror sobrenatural donde una presencia demoníaca amenaza con desencadenar el caos en el mundo. Las películas exploran temas de fe, redención y el eterno conflicto entre el bien y el mal, sumergiendo al espectador en un viaje aterrador a través de los rincones más oscuros de la existencia humana y la lucha contra fuerzas demoníacas insondables.",
    "partIds": [
      439079,
      968051
    ],
    "totalMovies": 2,
    "yearRange": "2018 - 2023",
    "totalVotes": 9958
  },
  {
    "id": 605516,
    "name": "Viaje",
    "fullName": "Viaje - Colección",
    "poster_path": "/ony1wLjVtp9ZOqj51kfM0k8qNMe.jpg",
    "backdrop_path": "/sK2254GsBZIEVIEChbrkyXzvlTm.jpg",
    "overview": "Colección de películas de ciencia ficción basadas en los libros de Julio Verne.",
    "partIds": [
      88751,
      72545
    ],
    "totalMovies": 2,
    "yearRange": "2008 - 2012",
    "totalVotes": 9976
  },
  {
    "id": 86486,
    "name": "Mini espías",
    "fullName": "Mini espías - Colección",
    "poster_path": "/v3zjL4nOh8RWbi7hf84xCL7oCo8.jpg",
    "backdrop_path": "/oxjNAfQJ1OrySttZSeLayky6T9k.jpg",
    "overview": "",
    "partIds": [
      10054,
      9488,
      12279,
      56288
    ],
    "totalMovies": 4,
    "yearRange": "2001 - 2011",
    "totalVotes": 9765
  },
  {
    "id": 5547,
    "name": "RoboCop",
    "fullName": "RoboCop - Colección",
    "poster_path": "/8n1z2sdjQyphvEANQl0sizGtCA1.jpg",
    "backdrop_path": "/w3bJ67cDfdRqQPenb84eHUBbeys.jpg",
    "overview": "RoboCop es una película de acción cyberpunk estadounidense de 1987 dirigida por Paul Verhoeven y escrita por Edward Neumeier y Michael Miner. La película está protagonizada por Peter Weller, Nancy Allen, Dan O'Herlihy, Kurtwood Smith, Miguel Ferrer y Ronny Cox. RoboCop, ambientado en un Detroit, Michigan, plagado de crímenes, en un futuro cercano, se centra en el oficial de policía Alex Murphy, quien es brutalmente asesinado a tiros por una banda de delincuentes y posteriormente revivido por la megacorporación Omni Consumer Products (OCP) como una ley cyborg sobrehumana. ejecutor conocido como \"RoboCop\". La colección incluye 2 secuelas.",
    "partIds": [
      5548,
      5549,
      5550
    ],
    "totalMovies": 3,
    "yearRange": "1987 - 1993",
    "totalVotes": 9751
  },
  {
    "id": 52985,
    "name": "Camino hacia el terror",
    "fullName": "Camino hacia el terror - Colección",
    "poster_path": "/sjdqRkMdWJl7ReNhENN908EBR28.jpg",
    "backdrop_path": "/soWEzM8FooUK30RMcD16ryWrfil.jpg",
    "overview": "Un grupo de personas luchan por su supervivencia contra una familia de caníbales endogámicas horriblemente deformadas que planean matarlos sin piedad.",
    "partIds": [
      9902,
      13186,
      23823,
      71672,
      125509,
      259072
    ],
    "totalMovies": 6,
    "yearRange": "2003 - 2014",
    "totalVotes": 9513
  },
  {
    "id": 106768,
    "name": "Tarzán (Animación)",
    "fullName": "Tarzán (Animación) - Colección",
    "poster_path": "/ju3N8uUtggRaup6AVTI0cnlmrgY.jpg",
    "backdrop_path": "/sNNtardgmbifJggic9dKwvDopz9.jpg",
    "overview": "Películas de Disney de la serie Tarzán.",
    "partIds": [
      37135,
      13683,
      15657
    ],
    "totalMovies": 3,
    "yearRange": "1999 - 2005",
    "totalVotes": 9512
  },
  {
    "id": 575987,
    "name": "La Chica Millennium",
    "fullName": "La Chica Millennium - Colección",
    "poster_path": "/1ZdDykzxmFSA1RbkLq1hECgL8iM.jpg",
    "backdrop_path": "/oCInm8wwTCIk6ElzHiXuhL2K7om.jpg",
    "overview": "",
    "partIds": [
      65754,
      446807
    ],
    "totalMovies": 2,
    "yearRange": "2011 - 2018",
    "totalVotes": 9435
  },
  {
    "id": 298820,
    "name": "American Pie presenta",
    "fullName": "American Pie presenta - Colección",
    "poster_path": "/e1o0B26atPv7HXfQFp4KRXnV1Eb.jpg",
    "backdrop_path": "/yeeOZEgFWES1pBdvbQJIeWwOjxy.jpg",
    "overview": "American Pie es una saga de ocho películas estadounidenses de comedia sexual estrenadas entre 1999 y 2012. La primera película de la serie, estrenada por Universal Pictures en 1999, se convirtió en un fenómeno de la cultura pop mundial y se ganó un culto entre los jóvenes.",
    "partIds": [
      8274,
      8275,
      8277,
      26123,
      660982
    ],
    "totalMovies": 5,
    "yearRange": "2005 - 2020",
    "totalVotes": 9246
  },
  {
    "id": 747168,
    "name": "Borat Moviefilms",
    "fullName": "Borat Moviefilms Collection",
    "poster_path": "/gnni4MADEHog2GuxFatqEAbbNE9.jpg",
    "backdrop_path": "/3Ysvp4ODDC6sucdQ9quHWkMiKED.jpg",
    "overview": "",
    "partIds": [
      496,
      740985
    ],
    "totalMovies": 2,
    "yearRange": "2006 - 2020",
    "totalVotes": 9229
  },
  {
    "id": 43064,
    "name": "Máxima Velocidad",
    "fullName": "Máxima Velocidad - Colección",
    "poster_path": "/jni2OfLxrWnA5gCIhpHBUKCDHZH.jpg",
    "backdrop_path": "/waNV7lQsnMzjQKelCgvF3T927LL.jpg",
    "overview": "Máxima Velocidad ​​es una película de suspenso y acción estadounidense de 1994 dirigida por Jan de Bont. El oficial de LAPD Jack Traven se convierte en el centro de atención de un terrorista y extorsionador, el sargento retirado del escuadrón de bombas de Atlanta Howard Payne. La película tiene lugar en Los Ángeles en 1993. En 1997, se estrenó una secuela, Speed ​​2: Cruise Control. Sandra Bullock acordó volver a interpretar a Annie, como respaldo financiero para otro proyecto, pero Keanu Reeves rechazó la oferta de regresar como Jack. Como resultado, Jason Patric fue incluido en la historia como Alex Shaw, el nuevo novio de Annie, y ella y Jack rompieron debido a su preocupación por el peligroso estilo de vida de Jack. Willem Dafoe interpretó al villano John Geiger, y Glenn Plummer (quien interpretó a la víctima del robo de autos de Reeves) también hizo cameos como conductor de bote. La película es considerada una de las peores secuelas de todos los tiempos.",
    "partIds": [
      1637,
      1639
    ],
    "totalMovies": 2,
    "yearRange": "1994 - 1997",
    "totalVotes": 8997
  },
  {
    "id": 64750,
    "name": "La bruja de Blair",
    "fullName": "La bruja de Blair - Colección",
    "poster_path": "/3HkueDu6wumqsbNI7zTbviFwOF.jpg",
    "backdrop_path": "/e5GwLq0zBer3SuSJZodcNROnT6Z.jpg",
    "overview": "Una serie de películas de terror psicológico en formato metraje encontrado sobre una leyenda local conocida como la bruja de Blair.",
    "partIds": [
      2667,
      11531,
      351211,
      1122220
    ],
    "totalMovies": 4,
    "yearRange": "1999 - 2027",
    "totalVotes": 8780
  },
  {
    "id": 11716,
    "name": "Los locos Addams",
    "fullName": "Los locos Addams - Colección",
    "poster_path": "/baebHDC8txK1zA61VVAWFLVmgjR.jpg",
    "backdrop_path": "/jYIY5lqbFStLuqcwi0d1GtKA4p6.jpg",
    "overview": "Los locos Addams es una serie de películas de comedia de fantasía estadounidense basadas en los personajes de la caricatura del mismo nombre creada por el dibujante Charles Addams y dirigida por Barry Sonnenfeld.",
    "partIds": [
      2907,
      2758
    ],
    "totalMovies": 2,
    "yearRange": "1991 - 1993",
    "totalVotes": 8665
  },
  {
    "id": 357173,
    "name": "Siniestro",
    "fullName": "Siniestro - Colección",
    "poster_path": "/Qyy2g7g3oFRTMNj2sbtI6P52ae.jpg",
    "backdrop_path": "/4JASyGk5suaz4xwMp6irzg334k6.jpg",
    "overview": "Una serie estadounidense de películas de terror sobrenatural que comienza con el escritor ficticio de crímenes reales Ellison Oswalt, quien descubre una caja de películas caseras en su ático que pone a su familia en peligro. Una secuela sigue a James Ransone, el diputado, y una madre cuyos hijos son atormentados por los niños fantasmales que Bughuul se llevó en su granja rural.",
    "partIds": [
      82507,
      283445
    ],
    "totalMovies": 2,
    "yearRange": "2012 - 2015",
    "totalVotes": 8662
  },
  {
    "id": 8917,
    "name": "Hellraiser",
    "fullName": "Hellraiser - Colección",
    "poster_path": "/wAIhVfsgOxk3emQBrxxyuI9K6KB.jpg",
    "backdrop_path": "/g0XtsgbwFcFHNZGarpk6qAOPX7T.jpg",
    "overview": "Hellraiser es una franquicia británica de películas de terror basada en la novela The Hellbound Heart de Clive Barker. Las películas presentan continuamente la cabeza de alfiler Cenobite. La historia de la serie se centra en una caja de rompecabezas que abre una puerta de entrada al reino de los Cenobitas, un orden de monstruos humanos que cosechan almas humanas para torturarlas en experimentos sadomasoquistas.",
    "partIds": [
      9003,
      9064,
      11569,
      8766,
      12597,
      11246,
      17455,
      12699,
      70584,
      444149
    ],
    "totalMovies": 10,
    "yearRange": "1987 - 2018",
    "totalVotes": 8415
  },
  {
    "id": 525891,
    "name": "Plan de Escape",
    "fullName": "Plan de Escape - Colección",
    "poster_path": "/40x4eM5C7FDUh67UcJ7tkztoDVV.jpg",
    "backdrop_path": "/zQao2h92RYNmhqCvmiReIHcz3Xp.jpg",
    "overview": "La serie de películas Escape Plan está compuesta por películas de acción y suspenso basadas en personajes creados por Miles Chapman y Arnell Jesko. Las películas se centran en un hombre de negocios y un hábil ingeniero de estructuras llamado Ray Breslin, mejor conocido por ser el mejor artista del escape del mundo. Breslin también ayuda a diseñar centros de detención con los niveles más intensos de seguridad. La serie está protagonizada por Sylvester Stallone, con un elenco de apoyo que incluye a Arnold Schwarzenegger, Dave Bautista y Curtis \"50 Cent\" Jackson como miembros del equipo de Breslin.",
    "partIds": [
      107846,
      440471,
      480042
    ],
    "totalMovies": 3,
    "yearRange": "2013 - 2019",
    "totalVotes": 8381
  },
  {
    "id": 488924,
    "name": "Paddington",
    "fullName": "Paddington - Colección",
    "poster_path": "/dysBFeRafGUzFJWUiE54kJh4PFS.jpg",
    "backdrop_path": "/cpmSe7SerOiI1dRgQG328OaHNBl.jpg",
    "overview": "",
    "partIds": [
      116149,
      346648,
      516729,
      1670528
    ],
    "totalMovies": 4,
    "yearRange": "2014 - 2024",
    "totalVotes": 8082
  },
  {
    "id": 86029,
    "name": "Los ángeles de Charlie",
    "fullName": "Los ángeles de Charlie - Colección",
    "poster_path": "/we2xaGKxdrWtMF2auFLVki8cMAd.jpg",
    "backdrop_path": "/jfKqvbZqU3LcNcwj4N8Q1ZJ7fSv.jpg",
    "overview": "Los ángeles de Charlie es una película de comedia de acción estadounidense de 2000 dirigida por McG, protagonizada por Cameron Díaz, Drew Barrymore y Lucy Liu como tres mujeres que trabajan para una agencia de investigación privada. La película está basada en la serie de televisión del mismo nombre de finales de la década de 1970, que fue adaptada por los guionistas Ryan Rowe, Ed Solomon y John August. La película fue seguida con la secuela de 2003, Los ángeles de Charlie: Al limite.",
    "partIds": [
      4327,
      9471
    ],
    "totalMovies": 2,
    "yearRange": "2000 - 2003",
    "totalVotes": 8052
  },
  {
    "id": 727761,
    "name": "Terrifier",
    "fullName": "Terrifier - Colección",
    "poster_path": "/26VVgGiXZfjR9DlPNCVE4OOuqOA.jpg",
    "backdrop_path": "/xGl7uzt0JX8u2WCIKK4e9Sk5Rat.jpg",
    "overview": "Terrifier es una franquicia estadounidense de medios de terror compuesta por películas de tipo slasher-splatter, cómics y varios otros medios. La franquicia se centra principalmente en Sienna Shaw, una joven destinada a derrotar al enigmático Art el Payaso, un asesino serial demoníaco que habita en el ficticio condado de Miles, Nueva York. Además, la serie sigue a Victoria Heyes, una sobreviviente desfigurada que lucha con su salud mental, y a la Niña Pálida, una entidad siniestra que acompaña a Art.",
    "partIds": [
      420634,
      663712,
      1034541,
      1320786
    ],
    "totalMovies": 4,
    "yearRange": "2018 - 2024",
    "totalVotes": 7777
  },
  {
    "id": 17178,
    "name": "Jackass",
    "fullName": "Jackass - Colección",
    "poster_path": "/gi1Ygc102Lw1R9gTNG7cJznSaev.jpg",
    "backdrop_path": "/lidPLbyE1JCUacEDOzkTCncCPBL.jpg",
    "overview": "De 2000 a 2002, la cadena de televisión estadounidense MTV produjo la serie \"Jackass\", que mostraba a un grupo de jóvenes en estilo videoclip realizando peligrosas acrobacias y repugnantes pruebas de valentía. Después del final de la serie de televisión, el concepto se amplió a largometrajes con los mismos actores.",
    "partIds": [
      9012,
      12094,
      14158,
      16290,
      65851,
      656663,
      828853,
      1612018
    ],
    "totalMovies": 8,
    "yearRange": "2002 - 2026",
    "totalVotes": 7781
  },
  {
    "id": 99727,
    "name": "Stuart Little",
    "fullName": "Stuart Little - Colección",
    "poster_path": "/zuwImUNqsBnP5jouAiASV7IEKA3.jpg",
    "backdrop_path": "/r74LzQMN1EdvdCvbIqHA95TvEKt.jpg",
    "overview": "La Colección Stuart Little comprende las 3 películas de Stuart Little.",
    "partIds": [
      10137,
      10996,
      30178
    ],
    "totalMovies": 3,
    "yearRange": "1999 - 2005",
    "totalVotes": 7921
  },
  {
    "id": 86860,
    "name": "Scooby-Doo",
    "fullName": "Scooby-Doo - Colección",
    "poster_path": "/qUOVZ2JqU8vYo76HvThSKvQ9w79.jpg",
    "backdrop_path": "/crBcWcmfSwM1FaFr7s3dOyzSF9m.jpg",
    "overview": "Series de películas basada en la serie animada del mismo nombre producida por Hanna-Barbera. El elenco incluye al gran danés que habla, Scooby-Doo, y cuatro detectives: Fred Jones, Daphne Blake, Vilma Dinkley y Norville \"Shaggy\" Rogers. Misterio a la Orden, que consta de estos cinco personajes, recorre el mundo en su camioneta, la Máquina Misteriosa. Su trabajo es resolver eventos desconcertantes, por lo que a menudo se convierten en observadores de apariciones de fantasmas y otros fenómenos sobrenaturales.",
    "partIds": [
      9637,
      11024
    ],
    "totalMovies": 2,
    "yearRange": "2002 - 2004",
    "totalVotes": 7934
  },
  {
    "id": 86578,
    "name": "Hostal",
    "fullName": "Hostal - Colección",
    "poster_path": "/vXans5HFBhJY1znIxwtHerveEaj.jpg",
    "backdrop_path": "/dF6GNQ0TnZkr1t4wBt36Xc0Pccd.jpg",
    "overview": "Hostal es una película de terror estadounidense de 2005 escrita y dirigida por Eli Roth. Está protagonizada por Jay Hernández y fue producida por Mike Fleiss, Eli Roth y Chris Briggs, con Boaz Yakin, Scott Spiegel y Quentin Tarantino como productores ejecutivos. Es la primera entrega de la trilogía de Hostel, seguida de Hostel: Part II (2007) y Hostel: Part III (2011). La película cuenta la historia de dos estudiantes universitarios que viajan por Europa, que se ven atrapados por un grupo misterioso que tortura y mata a las víctimas secuestradas.",
    "partIds": [
      1690,
      1691,
      71670
    ],
    "totalMovies": 3,
    "yearRange": "2006 - 2011",
    "totalVotes": 7766
  },
  {
    "id": 64751,
    "name": "Crank",
    "fullName": "Crank Collection",
    "poster_path": "/doZuipyWmAFEIB7yWWjNqd0W2iK.jpg",
    "backdrop_path": "/g49FylpoLi9aUPWOqvPCIEezCHN.jpg",
    "overview": "",
    "partIds": [
      1948,
      15092
    ],
    "totalMovies": 2,
    "yearRange": "2006 - 2009",
    "totalVotes": 7716
  },
  {
    "id": 1657,
    "name": "Zorro",
    "fullName": "Zorro - Colección",
    "poster_path": "/okGYfwrkJ4GN8tqwv4op4dn4plR.jpg",
    "backdrop_path": "/iZJjoWP7GUCIxqZ3b9AvyjivGEk.jpg",
    "overview": "",
    "partIds": [
      9342,
      1656
    ],
    "totalMovies": 2,
    "yearRange": "1998 - 2005",
    "totalVotes": 7662
  },
  {
    "id": 93791,
    "name": "El Reportero",
    "fullName": "El Reportero - Colección",
    "poster_path": "/ojFvw2rSQWZ53sXLagjM4zluTy9.jpg",
    "backdrop_path": "/eUU6edsZcr7I0AO8rHcB3vQwcOH.jpg",
    "overview": "",
    "partIds": [
      8699,
      109443
    ],
    "totalMovies": 2,
    "yearRange": "2004 - 2013",
    "totalVotes": 7717
  },
  {
    "id": 136214,
    "name": "Pocahontas",
    "fullName": "Pocahontas - Colección",
    "poster_path": "/5MnC3c0lqapuOt6kmSoJ3To4W3m.jpg",
    "backdrop_path": "/or6DYoMtttpgs0g7cTBE5DgeUUf.jpg",
    "overview": "Una serie de películas animadas de Walt Disney basada en un personaje histórico real, basada en la historia conocida y también en el folklore y la leyenda que rodean a la mujer nativa americana Pocahontas, y presenta un relato ficticio de su encuentro con el inglés John Smith y los colonos que llegaron de La Compañía de Virginia.",
    "partIds": [
      10530,
      13761
    ],
    "totalMovies": 2,
    "yearRange": "1995 - 1998",
    "totalVotes": 7696
  },
  {
    "id": 280504,
    "name": "El Especialista",
    "fullName": "El Especialista - Colección",
    "poster_path": "/nAgPp5KNPzfQsSPGUQhGCnPJGoH.jpg",
    "backdrop_path": "/vexuvLnuX6MD2A9A8CZ5dxczmgp.jpg",
    "overview": "Una serie de películas centrada en Arthur Bishop, el \"mecánico\", un asesino de élite con un código estricto y un talento único para eliminar objetivos limpiamente; haciendo que sus golpes parezcan accidentes, suicidios o actos de pequeños delincuentes. Es un trabajo que requiere perfección profesional y desprendimiento total, y Bishop es el mejor en el negocio.",
    "partIds": [
      27582,
      278924
    ],
    "totalMovies": 2,
    "yearRange": "2011 - 2016",
    "totalVotes": 7525
  },
  {
    "id": 769423,
    "name": "Escape Room",
    "fullName": "Escape Room - Colección",
    "poster_path": "/zdgt4NhbhJqFQOKDRD6L2Jmh7tx.jpg",
    "backdrop_path": "/adCkjAt5Hc4uv0gouVslziGmB9d.jpg",
    "overview": "Escape Room es una película estadounidense de terror psicológico de 2019 que sigue a un grupo de personas enviadas a superar una serie de salas de escape mortales. Una secuela, Escape Room: Torneo de Campeones, fue lanzada el 16 de julio de 2021.",
    "partIds": [
      522681,
      585216
    ],
    "totalMovies": 2,
    "yearRange": "2019 - 2021",
    "totalVotes": 7582
  },
  {
    "id": 352789,
    "name": "Zoolander",
    "fullName": "Zoolander - Colección",
    "poster_path": "/87GRd4SsTueSQZUqmp0iOinNB0O.jpg",
    "backdrop_path": "/xNTvMy84w8wnrEEzWBiTWL08fVo.jpg",
    "overview": "",
    "partIds": [
      9398,
      329833
    ],
    "totalMovies": 2,
    "yearRange": "2001 - 2016",
    "totalVotes": 7591
  },
  {
    "id": 91799,
    "name": "Terror bajo la Tierra",
    "fullName": "Terror bajo la Tierra - Colección",
    "poster_path": "/pnPkvHp75tSomDWnzU1iLhgyFMV.jpg",
    "backdrop_path": "/wZeBvDh9lpGpqHB0FyltARuMSmK.jpg",
    "overview": "La franquicia Tremors es una serie de películas de monstruos centrada en los ataques viciosos de criaturas subterráneas parecidas a gusanos conocidas como Graboids. Comenzó en 1990 con el lanzamiento exitoso de Tremors, que generó seis secuelas directas a video. Además de la serie de películas, Tremors: The Series, una serie de televisión que se estrenó en Syfy, fue producida, solo para ser cancelada después de 13 episodios. En 2018 se produjo un piloto para otra serie, para la cual la estrella original Kevin Bacon regresaría, pero la serie no avanzó. Michael Gross es el único miembro del reparto que ha aparecido en todas las películas, así como en la serie de televisión.",
    "partIds": [
      9362,
      11069,
      10829,
      10891,
      339530,
      496704,
      670266
    ],
    "totalMovies": 7,
    "yearRange": "1990 - 2020",
    "totalVotes": 7394
  },
  {
    "id": 10456,
    "name": "Harry el sucio",
    "fullName": "Harry el sucio - Colección",
    "poster_path": "/ffZKx4IIZuhVcLgObX0HiMgnaCB.jpg",
    "backdrop_path": "/al3OAbumr6sUZPYyJCvufGOQkkK.jpg",
    "overview": "Harry el sucio es el nombre de una serie de películas y novelas que presentan al inspector ficticio de la División de Homicidios del Departamento de Policía de San Francisco \"Dirty\" Harry Callahan, interpretado por Clint Eastwood. El personaje de Eastwood también ayudó a popularizar el .44 Magnum, ya que se muestra a Harry Callahan empuñando su revólver Smith & Wesson Modelo 29.",
    "partIds": [
      984,
      10648,
      10649,
      10650,
      10651
    ],
    "totalMovies": 5,
    "yearRange": "1971 - 1988",
    "totalVotes": 7231
  },
  {
    "id": 1198581,
    "name": "It Follows",
    "fullName": "It Follows Collection",
    "poster_path": "/yt3pAIULJmmD8JoZzm3235hD0bq.jpg",
    "backdrop_path": "/15kULhhtb8Fm6q3Rm2uycCH566i.jpg",
    "overview": "",
    "partIds": [
      270303,
      1198577
    ],
    "totalMovies": 2,
    "yearRange": "2015",
    "totalVotes": 7200
  },
  {
    "id": 9649,
    "name": "El mariachi",
    "fullName": "El mariachi - Colección",
    "poster_path": "/t0Hlojkn1r8HC3pupZ73kr1zF2u.jpg",
    "backdrop_path": "/6p1OzuIKWnTDfDea7IpB9xra5J.jpg",
    "overview": "La Trilogía de México es una serie de películas: El Mariachi, Desperado y Érase una vez en México, todas escritas, producidas y dirigidas por Robert Rodríguez, comenzando en 1992 y terminando en 2003 y distribuidas por Columbia Tristar que cuentan la historia continua de personaje principal de las películas, \"El Mariachi\".",
    "partIds": [
      9367,
      8068,
      1428
    ],
    "totalMovies": 3,
    "yearRange": "1993 - 2003",
    "totalVotes": 7126
  },
  {
    "id": 19163,
    "name": "En busca del valle encantado",
    "fullName": "En busca del valle encantado  - Colección",
    "poster_path": "/17gjyP0KNJWXsAVo0uDhBo7ntFg.jpg",
    "backdrop_path": "/zDkQ0BPPhsmepLGZJx0aXVAuKG6.jpg",
    "overview": "",
    "partIds": [
      12144,
      15997,
      19004,
      19164,
      19165,
      17337,
      24102,
      25587,
      25556,
      24554,
      24556,
      31933,
      39961,
      339526
    ],
    "totalMovies": 14,
    "yearRange": "1988 - 2016",
    "totalVotes": 6710
  },
  {
    "id": 86116,
    "name": "La Carrera de la Muerte",
    "fullName": "La Carrera de la Muerte - Colección",
    "poster_path": "/gdtiLzRSKXJtS0xkcmTt8aqZ5AC.jpg",
    "backdrop_path": "/fS7da7VlfUcXQsZIB0KL9P5gWmh.jpg",
    "overview": "Basado en el combate automovilístico que abarca una serie de películas y otros medios centrados en un reality show ambientado en una prisión, donde los reclusos compiten entre sí para ganar su libertad.",
    "partIds": [
      10483,
      51620,
      156717,
      401478
    ],
    "totalMovies": 4,
    "yearRange": "2008 - 2018",
    "totalVotes": 6810
  },
  {
    "id": 1100788,
    "name": "Sonríe",
    "fullName": "Sonríe - Colección",
    "poster_path": "/nf7EkuB6T94H9FqG17gVzbAkHti.jpg",
    "backdrop_path": "/fKhwWPMFuUbbMBD7mgZMbHKa6aw.jpg",
    "overview": "",
    "partIds": [
      882598,
      1100782
    ],
    "totalMovies": 2,
    "yearRange": "2022 - 2024",
    "totalVotes": 6722
  },
  {
    "id": 86115,
    "name": "Garfield",
    "fullName": "Garfield - Colección",
    "poster_path": "/e3RLNXHqiFajVOMEsc7vLGuE5b1.jpg",
    "backdrop_path": "/qHF9Qnzz5zu5AQm3mqnrMfc7w9P.jpg",
    "overview": "Serie de películas basadas en la historieta del mismo nombre creada por Jim Davis.",
    "partIds": [
      8920,
      9513
    ],
    "totalMovies": 2,
    "yearRange": "2004 - 2006",
    "totalVotes": 6733
  },
  {
    "id": 24761,
    "name": "Millennium - Colección Original",
    "fullName": "Millennium - Colección Original",
    "poster_path": "/sLeE5pwX9cle1v1TpBylT9MeYJ2.jpg",
    "backdrop_path": "/9wLsZPhI7ZafO4fh1MhwCjvkclN.jpg",
    "overview": "En su Millennium Trilogy, Stieg Larsson creó un personaje emocionante para la nueva década que ha capturado los corazones y las mentes de los lectores de todo el mundo. A su vez, las tres películas basadas en los más vendidos han cautivado a los espectadores de todo el mundo. Su viaje se ha convertido en una sensación internacional ... sus secretos han cautivado a millones.  La colección consta de  La chica con el tatuaje de dragón,  La chica que jugaba con fuego,  La chica que pateó el avispero",
    "partIds": [
      15472,
      24253,
      33613
    ],
    "totalMovies": 3,
    "yearRange": "2009",
    "totalVotes": 6764
  },
  {
    "id": 3601,
    "name": "Se lo que hicieron el verano pasado",
    "fullName": "Se lo que hicieron el verano pasado - Colección",
    "poster_path": "/pb5kFCOPm1ZcZblJ9bJ2CCUBmCW.jpg",
    "backdrop_path": "/guXWsiQYpzEJ832Kebd72Qp1Hyq.jpg",
    "overview": "Sé lo que hiciste el verano pasado es una película de 1997 basada en la novela de 1973 del mismo nombre de Lois Duncan. La película está protagonizada por Jennifer Love Hewitt, Sarah Michelle Gellar, Ryan Phillippe y Freddie Prinze Jr., y en ella aparecen Anne Heche y Bridgette Wilson en papeles secundarios. Se centra en cuatro amigos que están siendo acosados por un asesino, un año después de encubrir un accidente de coche en el que estuvieron involucrados. La película fue dirigida por Jim Gillespie, a partir de un guión escrito por Kevin Williamson, escritor de Scream. A la película le siguieron dos secuelas, Todavía se lo que hicieron el verano pasado y el estreno directo en DVD Siempre sabré lo que hicieron el verano pasado. Aunque la anterior película es una continuación de la línea argumental establecida en su predecesora, la última película establece una nueva línea argumental y no protagoniza ningún miembro del reparto de las dos entregas anteriores.",
    "partIds": [
      3597,
      3600,
      3602,
      1083433
    ],
    "totalMovies": 4,
    "yearRange": "1997 - 2025",
    "totalVotes": 6678
  },
  {
    "id": 257960,
    "name": "La Redada",
    "fullName": "La Redada - Colección",
    "poster_path": "/209pUrOVji2Ip8E6gWafM6CVeyq.jpg",
    "backdrop_path": "/oRQ7INsPDVon7U2jphXDr7LSP3H.jpg",
    "overview": "Los S.W.A.T. están atrapados en un condominio de apartamentos dirigido por un mafioso despiadado y su ejército de asesinos y bandidos.",
    "partIds": [
      94329,
      180299
    ],
    "totalMovies": 2,
    "yearRange": "2012 - 2014",
    "totalVotes": 6786
  },
  {
    "id": 115570,
    "name": "Star Trek: La nueva generación",
    "fullName": "Star Trek: La nueva generación - Colección",
    "poster_path": "/7XNleOypWWXEGOHk5UAo6jIp1ue.jpg",
    "backdrop_path": "/r7MMQenUURHhAVHFymtOb8AX4Bm.jpg",
    "overview": "La serie de películas de Star Trek es el brazo cinematográfico de la franquicia de Star Trek. Paramount Pictures comenzó a trabajar en una película de Star Trek en 1975 después de varias solicitudes del creador de la serie, Gene Roddenberry. El estudio abandonó el proyecto dos años después a favor de una nueva serie de televisión, Star Trek: Phase II, con el elenco original. Sin embargo, después del gran éxito de Star Wars y Close Encounters of the Third Kind, Paramount volvió a cambiar de opinión, cancelando la producción de la serie y adaptando su episodio piloto en la película de 1979 Star Trek: The Motion Picture. Siguieron otras cinco películas protagonizadas por el elenco original. El elenco de la serie derivada Star Trek: The Next Generation protagonizó otras cuatro películas. Un reinicio y una precuela de la serie de televisión original, titulada simplemente Star Trek, se lanzó en 2009.",
    "partIds": [
      193,
      199,
      200,
      201
    ],
    "totalMovies": 4,
    "yearRange": "1994 - 2002",
    "totalVotes": 6699
  },
  {
    "id": 134897,
    "name": "Los Pitufos",
    "fullName": "Los Pitufos - Colección",
    "poster_path": "/9oGc4gxvgxD04nzr1zlHGUUj8x1.jpg",
    "backdrop_path": "/mUN96AWlMupDR7NXaPhFmMEYIBM.jpg",
    "overview": "Una serie estadounidense de películas CGI / de acción en vivo basada en la serie de cómics de Los Pitufos creada por el artista belga de cómics Peyo y la serie de televisión animada de los años 80.",
    "partIds": [
      41513,
      77931
    ],
    "totalMovies": 2,
    "yearRange": "2011 - 2013",
    "totalVotes": 6534
  },
  {
    "id": 86024,
    "name": "Legalmente Rubia",
    "fullName": "Legalmente Rubia - Colección",
    "poster_path": "/qwXB6uePgDzG2Vrq8fRwadsi9nN.jpg",
    "backdrop_path": "/aabPyPAA6E8hJ7tUipwunr3Itzb.jpg",
    "overview": "Legalmente Rubia es una película de comedia estadounidense de 2001. Reese Witherspoon interpreta el papel principal de una modelo. Cuando su novio se va, ella lo sigue a la Universidad de Harvard, donde se entera de que ya está comprometido. En 2003 se produjo la secuela Naturally Blond 2. En 2009, se filmó una tercera parte con Naturally Blond 3 - Ahora va dos veces.",
    "partIds": [
      8835,
      10327
    ],
    "totalMovies": 2,
    "yearRange": "2001 - 2003",
    "totalVotes": 6582
  },
  {
    "id": 91663,
    "name": "¿Y dónde está el piloto?",
    "fullName": "¿Y dónde está el piloto? - Colección",
    "poster_path": "/uyg7A1aRdLXNI1AbAnjtgAUn1mo.jpg",
    "backdrop_path": "/ffPtCu9amyIpk7l3VHiUtbd8kqt.jpg",
    "overview": "Ten preparada tu tarjeta de embarque , aunque puede que no sobrevivas al vuelo, pero seguro que te divertirás mientras llegas allí!!",
    "partIds": [
      813,
      2665
    ],
    "totalMovies": 2,
    "yearRange": "1980 - 1982",
    "totalVotes": 6622
  },
  {
    "id": 94899,
    "name": "Jeepers Creepers",
    "fullName": "Jeepers Creepers - Colección",
    "poster_path": "/zOOD4NOo0HWR2Hx0Wyq9lOkbakh.jpg",
    "backdrop_path": "/4ndFUfbAHzeb6OcTbfDm2nme94A.jpg",
    "overview": "Jeepers Creepers es una película de terror estadounidense de 2001 escrita y dirigida por Victor Salva. La película toma su nombre de la canción de 1938 \"Jeepers Creepers\", que aparece en la película. Francis Ford Coppola fue productor ejecutivo y la película está protagonizada por Gina Philips, Justin Long, Jonathan Breck y Eileen Brennan. Philips y Long juegan hermanos que se convierten en objetivos de una criatura demoníaca (Breck). En 2003, se lanzó una secuela, Jeepers Creepers 2. Los eventos en la segunda película tienen lugar días después de la primera película. The Creeper y Darry son los únicos personajes que aparecen en ambas películas, aunque no son los únicos actores que aparecen en ambas películas. En septiembre de 2015, se anunció Jeepers Creepers 3. La filmación comenzó en abril de 2016, con un lanzamiento planificado para 2017.",
    "partIds": [
      8922,
      11351,
      55341
    ],
    "totalMovies": 3,
    "yearRange": "2001 - 2017",
    "totalVotes": 6391
  },
  {
    "id": 97456,
    "name": "El jorobado de Notre Dame",
    "fullName": "El jorobado de Notre Dame - Colección",
    "poster_path": "/sauDABUFqMtoDRQX7PzAx2oKWTj.jpg",
    "backdrop_path": "/rlKlVPPsQ5RpiEpm0tZsrQPgyLc.jpg",
    "overview": "París en el siglo XV. Quasimodo sobrevive a duras penas una existencia solitaria en el marco de la campana de la catedral de Notre-Dame. Sus únicos amigos son las tres figuras de piedra parlante llamadas Hugo, Victor y Laverne. Cuando el pequeño campanero jorobado se aventuró fuera de las puertas de la casa de Dios por primera vez, fue sometido a una cruel humillación por parte de la turba. Solo la hermosa gitana Esmeralda se apresura a ayudarlo y lo libera de su predicamento. Perseguidos por el poderoso juez Frollo, los dos buscan refugio en la catedral. (Texto: Kino.de)",
    "partIds": [
      10545,
      12448
    ],
    "totalMovies": 2,
    "yearRange": "1996 - 2002",
    "totalVotes": 6369
  },
  {
    "id": 473971,
    "name": "Guerra de Papás",
    "fullName": "Guerra de Papás - Colección",
    "poster_path": "/sKjm3JtHz3Z5ggyNZC4IEz4z4Dl.jpg",
    "backdrop_path": "/umOVzY5wG2vNcZmyTLrZYAYj7yn.jpg",
    "overview": "Una serie de películas de comedia sobre el apacible Brad Whitaker que lucha por ser un buen padrastro para sus hijos, cuando su padre biológico Dusty Mayron regresa.",
    "partIds": [
      274167,
      419680
    ],
    "totalMovies": 2,
    "yearRange": "2015 - 2017",
    "totalVotes": 6344
  },
  {
    "id": 620873,
    "name": "Dragon Ball Super",
    "fullName": "Dragon Ball Super - Colección",
    "poster_path": "/6rgDHyyejvhvqn28xegMOXU0Rri.jpg",
    "backdrop_path": "/b0v9EM3fFA3t5uJ9uonPcHHbxMW.jpg",
    "overview": "",
    "partIds": [
      503314,
      610150
    ],
    "totalMovies": 2,
    "yearRange": "2018 - 2022",
    "totalVotes": 6380
  },
  {
    "id": 207621,
    "name": "VHS",
    "fullName": "VHS - Colección",
    "poster_path": "/suMaVrhXi5amC0OIhklr8tN8PMW.jpg",
    "backdrop_path": "/m3xmiaeZKsjnHiGJvFGb1W6Ti81.jpg",
    "overview": "V / H / S es una película de terror antológica estadounidense de 2012. Cuenta con una serie de cortos de metraje encontrado escritos y dirigidos por Adam Wingard, David Bruckner, Ti West, Glenn McQuaid, Joe Swanberg y el cuarteto director conocido como Radio Silence. Una secuela, titulada V / H / S / 2, entró en producción tan pronto como octubre de 2012.",
    "partIds": [
      84348,
      159117,
      267806,
      753453,
      1005776,
      1032948,
      1190868,
      1373445,
      1742441,
      1613112
    ],
    "totalMovies": 10,
    "yearRange": "2012 - 2026",
    "totalVotes": 5559
  },
  {
    "id": 397842,
    "name": "Terror en Amityville",
    "fullName": "Terror en Amityville - Colección",
    "poster_path": "/eQiIukZmp4kNW4T9DfQPLMMOeHj.jpg",
    "backdrop_path": "/gBiIgmPOks4sEBpZABmyG0djczE.jpg",
    "overview": "En una vieja casa de la costa atlántica, una noche un joven mata salvajemente a miembros de su familia sin motivo aparente. El rumor popular acusa al diablo de haberlo poseído. Unos años después una pequeña familia, sin darle peso a las supersticiones, se va a vivir a la bicocca y de inmediato tiene que pasar por todos los colores. Los niños enferman, el cabeza de familia parece haber perdido el bien del intelecto, el viejo confesor de su esposa se vuelve ciego y loco. La antigua tragedia parece repetirse.",
    "partIds": [
      11449,
      16235,
      27214,
      55377,
      41848,
      41671,
      33519,
      52263,
      10065,
      203835
    ],
    "totalMovies": 10,
    "yearRange": "1979 - 2017",
    "totalVotes": 5997
  },
  {
    "id": 109609,
    "name": "La Mosca (1986)",
    "fullName": "La Mosca (1986) - Colección",
    "poster_path": "/4pNh75oNtGvLHUMP5lfpurinQDe.jpg",
    "backdrop_path": "/2PtGyUVjSJO3T3kuUtYqq9Lrgk5.jpg",
    "overview": "",
    "partIds": [
      9426,
      10344
    ],
    "totalMovies": 2,
    "yearRange": "1986 - 1989",
    "totalVotes": 5963
  },
  {
    "id": 9436,
    "name": "El Cuervo",
    "fullName": "El Cuervo - Colección",
    "poster_path": "/1khaAeqQLIS2AhKltLS3BwXoFDY.jpg",
    "backdrop_path": "/xxJs7xqY0vMuNlznQboBzq8RlZm.jpg",
    "overview": "Una serie de películas en las que el personaje principal es asesinado y luego resucitado para vengar su muerte. Su regreso al mundo de los vivos es anunciado por un cuervo.",
    "partIds": [
      9495,
      10546,
      9456,
      16456
    ],
    "totalMovies": 4,
    "yearRange": "1994 - 2005",
    "totalVotes": 6033
  },
  {
    "id": 10919,
    "name": "La Profecía",
    "fullName": "La Profecía - Colección",
    "poster_path": "/eswvgb5r9oBtD5xaTMZlJr5O7E6.jpg",
    "backdrop_path": "/4RyL9BO36iRnQP7r9wiboOGwJKQ.jpg",
    "overview": "La serie de películas \"la Profecía\" es una franquicia de películas de terror creada en la década de 1970. La historia fue escrita originalmente por David Seltzer, quien decidió no continuar la serie después de la primera novela. La segunda novela y guión fueron escritos por Joseph Howard, y la tercera por Gordon McGill. Después de que se produjo la tercera película, se hizo una cuarta para televisión en un intento de recuperar la serie, pero lo hizo mal. La serie se centra en Damien Thorn, un niño nacido de Satanás y entregado a Robert y Katherine Thorn, antes de ser transmitido a las familias Thorn cuando era niño. Se revela entre las familias que Damien está destinado a ser el Anticristo, y como adulto está tratando de obtener el control del negocio de Thorn y llegar a la presidencia.",
    "partIds": [
      794,
      10766,
      10768,
      17792,
      437342
    ],
    "totalMovies": 5,
    "yearRange": "1976 - 2024",
    "totalVotes": 5793
  },
  {
    "id": 23456,
    "name": "One Piece",
    "fullName": "One Piece - Colección",
    "poster_path": "/aQork3BSotYCXQdkxlABMxYNVu1.jpg",
    "backdrop_path": "/3RqSKjokWlXyTBUt3tcR9CrOG57.jpg",
    "overview": "",
    "partIds": [
      19576,
      23446,
      44725,
      44727,
      44728,
      44729,
      44730,
      25278,
      44731,
      41498,
      176983,
      374205,
      568012,
      900667
    ],
    "totalMovies": 14,
    "yearRange": "2000 - 2022",
    "totalVotes": 5622
  },
  {
    "id": 91430,
    "name": "La Historia sin Fin",
    "fullName": "La Historia sin Fin - Colección",
    "poster_path": "/mvPsYm7CgJQjzJZytlqx0Ej4qDw.jpg",
    "backdrop_path": "/2IqXJIR1i0f6Ngq3A6rjXhQNqFc.jpg",
    "overview": "",
    "partIds": [
      34584,
      34636,
      27793
    ],
    "totalMovies": 3,
    "yearRange": "1984 - 1994",
    "totalVotes": 5902
  },
  {
    "id": 210006,
    "name": "Machete",
    "fullName": "Machete - Colección",
    "poster_path": "/vCag3OPrVJQqqsl5Y1haXOGwrnS.jpg",
    "backdrop_path": "/nxCWYlyf67148ve2PwvNzESuO5c.jpg",
    "overview": "Machete es una película de Robert Rodriguez protagonizada por Danny Trejo, la cual narra las andanzas de un ex agente federal mexicano que tiene que emigrar a Estados Unidos para buscarse la vida y que se verá implicado en el intento de asesinato de un senador corrupto. Su elenco cuenta asimismo con la participación de Robert De Niro, Michelle Rodríguez, Jessica Alba, Steven Seagal, Jeff Fahey y Lindsay Lohan.",
    "partIds": [
      23631,
      106747,
      481881
    ],
    "totalMovies": 3,
    "yearRange": "2010 - 2013",
    "totalVotes": 5789
  },
  {
    "id": 1540907,
    "name": "Superman (DCU)",
    "fullName": "Superman (DCU) - Colección",
    "poster_path": "/xYbumhiT1vk6t5X8rI9hxneRJka.jpg",
    "backdrop_path": "/r2qGBDJCX5zWo7SKRm21OSCktCN.jpg",
    "overview": "Una serie de películas de superhéroes que sigue las aventuras de Superman / Clark Kent en el Universo DC (DCU).",
    "partIds": [
      1061474,
      1523140
    ],
    "totalMovies": 2,
    "yearRange": "2025 - 2027",
    "totalVotes": 5593
  },
  {
    "id": 806483,
    "name": "Spirit",
    "fullName": "Spirit Collection",
    "poster_path": "/AboOg2tBPdjht4xNqbNaXQPWRQ8.jpg",
    "backdrop_path": "/gB3Nr30Mhnnj8ra0PgyFiU3f7Kt.jpg",
    "overview": "",
    "partIds": [
      9023,
      637693
    ],
    "totalMovies": 2,
    "yearRange": "2002 - 2021",
    "totalVotes": 5639
  },
  {
    "id": 328247,
    "name": "Magic Mike",
    "fullName": "Magic Mike - Colección",
    "poster_path": "/jXiV4FnRmV2ZPEuu6FIe5AVWw5w.jpg",
    "backdrop_path": "/39cdZf56Umy8t2LN5hrwkDhM0dw.jpg",
    "overview": "",
    "partIds": [
      77930,
      264999,
      906221
    ],
    "totalMovies": 3,
    "yearRange": "2012 - 2023",
    "totalVotes": 5665
  },
  {
    "id": 44979,
    "name": "Mi abuela es un peligro",
    "fullName": "Mi abuela es un peligro - Colección",
    "poster_path": "/j146y6FN8Np4ubXnE02T0GdjsHV.jpg",
    "backdrop_path": "/5xN2n22evtZqxKWqg7WqOGnvb2s.jpg",
    "overview": "Un agente federal se hace pasar por una abuela de gran tamaño para lograr atrapar a un ladrón de bancos.",
    "partIds": [
      9600,
      11565,
      38322
    ],
    "totalMovies": 3,
    "yearRange": "2000 - 2011",
    "totalVotes": 5609
  },
  {
    "id": 103573,
    "name": "Sister Act",
    "fullName": "Sister Act Collection",
    "poster_path": "/Agw5rMeDrJxG4mSYNo6igTnX4Io.jpg",
    "backdrop_path": "/5zLMzYgpx2TNmISTk1MnRyRWY9M.jpg",
    "overview": "",
    "partIds": [
      2005,
      6279,
      1563146
    ],
    "totalMovies": 3,
    "yearRange": "1992 - 1993",
    "totalVotes": 5571
  },
  {
    "id": 72119,
    "name": "Querida, encogí a los niños",
    "fullName": "Querida, encogí a los niños - Colección",
    "poster_path": "/sukqhyRNrhwfUrEsiwsEugT1bF7.jpg",
    "backdrop_path": "/3fvZtWdSdCNkxn1TAKTM042iClY.jpg",
    "overview": "Cariño, encogí a los niños es una franquicia de comedia estadounidense de Disney que se centra en Wayne Szalinski, un inventor \"chiflado\" que desarrolla máquinas electrónicas que causan estragos.",
    "partIds": [
      9354,
      11158,
      11425
    ],
    "totalMovies": 3,
    "yearRange": "1989 - 1997",
    "totalVotes": 5539
  },
  {
    "id": 426103,
    "name": "Ouija",
    "fullName": "Ouija - Colección",
    "poster_path": "/1E7DHy4SiH1xw7gbGkh0nZ0GrzM.jpg",
    "backdrop_path": "/m5nPr3cOxqzU68luWfwNngazHnE.jpg",
    "overview": "Una serie de películas estadounidenses de terror sobrenatural basadas en la tabla Ouija y los espíritus desatados por ella.",
    "partIds": [
      242512,
      335796
    ],
    "totalMovies": 2,
    "yearRange": "2014 - 2016",
    "totalVotes": 5549
  },
  {
    "id": 8050,
    "name": "Highlander",
    "fullName": "Highlander - Colección",
    "poster_path": "/bVqaVN3abSKHYqCR60HOTjvBdu1.jpg",
    "backdrop_path": "/rC40OiyxY3hwQtSn84ucVCPkO0g.jpg",
    "overview": "Siguiendo las hazañas de dos montañeses escoceses inmortales Conner y Duncan Macleod. Nacidos en diferentes épocas y luchando a través de los siglos para ganar el premio místico. Abarcando históricas amistades, relaciones devastadoras y batallas legendarias cada inmortal descubre que aparentemente hay una vida interminable que es más una condena que un don. Pero por el bien de la humanidad tienen que seguir luchando para sobrevivir hasta que sólo quede uno.",
    "partIds": [
      8009,
      8010,
      8011,
      12211,
      13360
    ],
    "totalMovies": 5,
    "yearRange": "1986 - 2007",
    "totalVotes": 5360
  },
  {
    "id": 39199,
    "name": "Detective conan - Coleccion de Peliculas",
    "fullName": "Detective conan - Coleccion de Peliculas",
    "poster_path": "/5p6taLutGWiq2QhCswPWgBDcx9w.jpg",
    "backdrop_path": "/tCn2416CQcLHvDkAL7II20v5YO3.jpg",
    "overview": "Largometrajes basados en la serie japonesa Detective Conan.",
    "partIds": [
      21422,
      21452,
      28808,
      20677,
      32022,
      26662,
      39202,
      39203,
      39204,
      39205,
      39206,
      39207,
      28764,
      97375,
      77617,
      122583,
      228805,
      257512,
      316873,
      374856,
      438058,
      493006,
      566555,
      662638,
      903939,
      1047041,
      1209217,
      1396965,
      1545621
    ],
    "totalMovies": 29,
    "yearRange": "1997 - 2026",
    "totalVotes": 4655
  },
  {
    "id": 30663,
    "name": "Harold y Kumar",
    "fullName": "Harold y Kumar - Colección",
    "poster_path": "/9OBP4MQBAXnBZ1uXLZykIWRGnBb.jpg",
    "backdrop_path": "/b70mFgsSn2hl3CvC0nRx0SHUEX0.jpg",
    "overview": "Una serie de películas de comedia estadounidense sobre unos locos y divertidos personajes. protagonizada por John Cho (Harold) y Kal Penn (Kumar).",
    "partIds": [
      11282,
      13335,
      55465,
      1499867
    ],
    "totalMovies": 4,
    "yearRange": "2004 - 2011",
    "totalVotes": 5195
  },
  {
    "id": 8918,
    "name": "El despertar del diablo (Reinicio)",
    "fullName": "El despertar del diablo (Reinicio) - Colección",
    "poster_path": "/ggFXETQB5qAdAJZXvk7LmR6H1JX.jpg",
    "backdrop_path": "/A0LX8YBYBZtfj0gR5Pkgz87cmcb.jpg",
    "overview": "Mutantes y monstruos atacan a personas que tienen \"la mala suerte\" de quedarse varadas cerca del desierto ... Una nueva versión de \"Gang of Sadists\", dirigida por Wes Craven en 1977.",
    "partIds": [
      9792,
      9793
    ],
    "totalMovies": 2,
    "yearRange": "2006 - 2007",
    "totalVotes": 5192
  },
  {
    "id": 1974,
    "name": "La Maldición",
    "fullName": "La Maldición - Colección",
    "poster_path": "/7S4G7R5CQfCRkHTAoq5qHqciFBl.jpg",
    "backdrop_path": "/w4HSdOMB2dTwZMZ0idNkAOvQMnK.jpg",
    "overview": "Serie de películas de terror estadounidense lanzada por Sony Pictures basada en la serie japonesa Ju-on creada por Takashi Shimizu. La serie se centra en los afectados por una maldición de la furia violenta de una mujer fallecida que destruye la vida de todos los que entran en contacto con ella. Conocida como The Grudge, esta maldición hace que sus víctimas se vean fatalmente afligidas por ella, lo que lleva a que nazca una nueva maldición y se transmita como un virus a todos aquellos que ingresan a la residencia Saeki o entran en contacto con la maldición.",
    "partIds": [
      1970,
      1975,
      1977
    ],
    "totalMovies": 3,
    "yearRange": "2004 - 2009",
    "totalVotes": 5181
  },
  {
    "id": 425175,
    "name": "Masacre en Texas (Reboot)",
    "fullName": "Masacre en Texas (Reboot) - Colección",
    "poster_path": "/11wcLgWfeoLPeDxmaNBBTk182dy.jpg",
    "backdrop_path": "/9z2HzirMPY51IBrBTFlt21JX3iP.jpg",
    "overview": "El Remake de la franquicia Masacre de Texas contiene 2 peliculas basadas en los años de la guerra de Vietnam, la primera pelicula es protagonizada por Jessica Biel y la segunda entrega la protagoniza Matt Bomer",
    "partIds": [
      9373,
      10781
    ],
    "totalMovies": 2,
    "yearRange": "2003 - 2006",
    "totalVotes": 5073
  },
  {
    "id": 937,
    "name": "La Pantera Rosa (Original)",
    "fullName": "La Pantera Rosa (Original) - Colección",
    "poster_path": "/gRRe7HgwpeJ2UmedbStyDKC586U.jpg",
    "backdrop_path": "/eVHH8peqVMN9VcEZvn9yTG6SDed.jpg",
    "overview": "La Pantera Rosa, es su versión original, es una saga de películas (6 oficiales y 3 no oficiales) sobre el torpe inspector Jacques Clouseau, interpretado por Peter Sellers en las películas consideradas \"oficiales\". En la actualidad, La Pantera Rosa es marca registrada de una gran franquicia.",
    "partIds": [
      936,
      1594,
      11573,
      11843,
      12268,
      6081,
      9699,
      36576,
      46828
    ],
    "totalMovies": 9,
    "yearRange": "1963 - 1993",
    "totalVotes": 4721
  },
  {
    "id": 131,
    "name": "Tres colores",
    "fullName": "Tres colores - Colección",
    "poster_path": "/oPyMTECgNSAJthxBb5AwYh77URC.jpg",
    "backdrop_path": "/2WRTI3eKcwiU1n6mH6X5uYueJ3X.jpg",
    "overview": "El ciclo de películas Drei Farben es una trilogía cinematográfica que el director polaco Krzysztof Kieślowski creó en 1993 y 1994. Estas fueron las últimas películas de Kieślowski, fallecido en 1996. En estas películas filmadas en Francia, Polonia y Suiza, Kieślowski utiliza los tres colores de la bandera nacional francesa (tricolor) como título y los tres componentes del lema francés Libertad, Igualdad, Fraternidad como motivo de la película respectiva. Al igual que en su serie Decálogo, estos temas se implementaron deliberadamente de manera ambigua y con un trasfondo irónico.",
    "partIds": [
      108,
      109,
      110
    ],
    "totalMovies": 3,
    "yearRange": "1993 - 1994",
    "totalVotes": 4963
  },
  {
    "id": 430186,
    "name": "Triunfos Robados",
    "fullName": "Triunfos Robados - Colección",
    "poster_path": "/7aTnDp8CGIsXwz1W1sdP9C6qDFQ.jpg",
    "backdrop_path": "/ypR7RZO9hIAyd3lIx07gJ0AVvbB.jpg",
    "overview": "",
    "partIds": [
      1588,
      12540,
      11211,
      15261,
      21474,
      467248,
      831410
    ],
    "totalMovies": 7,
    "yearRange": "2000 - 2022",
    "totalVotes": 4912
  },
  {
    "id": 10453,
    "name": "Poltergeist",
    "fullName": "Poltergeist - Colección",
    "poster_path": "/g5Fu4TQQrAhr0IzJqt143mwZDpD.jpg",
    "backdrop_path": "/i8QZZV1olny9FCPNrxAL7Kk9CJy.jpg",
    "overview": "Las películas Poltergeist son una trilogía de películas de terror estadounidenses distribuidas por Metro-Goldwyn-Mayer durante la década de 1980. Las películas giran en torno a los miembros de la familia Freeling, quienes son acosados ​​y aterrorizados por un grupo de antiguos fantasmas que se sienten atraídos por la hija menor, Carol Anne. La película original fue coescrita por Steven Spielberg.",
    "partIds": [
      609,
      11133,
      10306
    ],
    "totalMovies": 3,
    "yearRange": "1982 - 1988",
    "totalVotes": 4876
  },
  {
    "id": 91746,
    "name": "Bill y Ted",
    "fullName": "Bill y Ted - Colección",
    "poster_path": "/e8tN3NnZTvCQrxdf0fEGONXzieX.jpg",
    "backdrop_path": "/A1CILmMtHpMobKvVSPWNAHd8Tey.jpg",
    "overview": "Las tres aventuras más excelentes: 'Bill & Ted's Excellent Adventure' (1989), 'Bill & Ted's Bogus Journey' (1991) y 'Bill & Ted Face the Music' (TBA), protagonizada por Alex Winter como William \"Bill\" S. Preston, Esq. Y Keanu Reeves como Ted \"Theodore\" Logan: ¡los Wyld Stallyns!",
    "partIds": [
      1648,
      1649,
      501979
    ],
    "totalMovies": 3,
    "yearRange": "1989 - 2020",
    "totalVotes": 4765
  },
  {
    "id": 43055,
    "name": "Conan El Bárbaro",
    "fullName": "Conan El Bárbaro - Colección",
    "poster_path": "/1yM1WZ4ryeBd5fYy61LhIlAmMXO.jpg",
    "backdrop_path": "/rJw7mflYzuHXBdRYEJyjAXDru5t.jpg",
    "overview": "Conan el Bárbaro, también conocido como Conan el Cimmerio o Conan de Cimmeria. Es un personaje de ficción creado en 1932 por el escritor Robert E. Howard para revista de relatos Pulp Weird Tales y Posteriormente llevado al cine con éxito. Conan es el personaje arquetípico, el más famoso representante del subgénero espada y brujería, un clásico de la fantasía del siglo XX.",
    "partIds": [
      9387,
      9610
    ],
    "totalMovies": 2,
    "yearRange": "1982 - 1984",
    "totalVotes": 4705
  },
  {
    "id": 52988,
    "name": "Loca Academia de Pilotos",
    "fullName": "Loca Academia de Pilotos -  Colección",
    "poster_path": "/nZGymiMHIlKhvV8fEhEmzyDSRD1.jpg",
    "backdrop_path": "/4RriqSJFCQkYpRhxFnQGh3sxZYY.jpg",
    "overview": "Hot Shots! es una película de parodia de comedia de 1991 protagonizada por Charlie Sheen, Cary Elwes, Valeria Golino, Lloyd Bridges, Kevin Dunn, Jon Cryer y Ryan Stiles. Fue dirigida por Jim Abrahams y escrita por Abrahams y Pat Proft. Con la misma vena cómica que Airplane !, una película codirigida por Abrahams, la película parodia principalmente la película de acción de 1986 Top Gun, pero también extrae material de películas como Rocky y Superman. Engendró una secuela en 1993, Hot Shots! Part Deux. Sheen y Cryer más tarde coprotagonizarían la serie de televisión Two and a Half Men, en la que Stiles también desempeñó un papel recurrente.",
    "partIds": [
      9595,
      9255
    ],
    "totalMovies": 2,
    "yearRange": "1991 - 1993",
    "totalVotes": 4732
  },
  {
    "id": 635362,
    "name": "El Castigador",
    "fullName": "El Castigador - Colección",
    "poster_path": "/qMgRBSxJJBeq1yAARThD1B8eXSx.jpg",
    "backdrop_path": "/wy3mGT2BxqNiBb3JV6lAQwOLrM5.jpg",
    "overview": "El Castigador es un vigilante que apareció por primera vez en los cómics de Marvel en 1974 y ha sido el protagonista de varias películas y series de televisión.",
    "partIds": [
      7220,
      13056
    ],
    "totalMovies": 2,
    "yearRange": "2004 - 2008",
    "totalVotes": 4696
  },
  {
    "id": 133352,
    "name": "Resident Evil: Animaciones",
    "fullName": "Resident Evil: Animaciones - Colección",
    "poster_path": "/la98KYBnWAqrojeY1zMNTa1I0Eu.jpg",
    "backdrop_path": "/uj2duAkn6zUmRSbjyEr7XUeIWsJ.jpg",
    "overview": "",
    "partIds": [
      13648,
      133121,
      400136,
      1083862
    ],
    "totalMovies": 4,
    "yearRange": "2008 - 2023",
    "totalVotes": 4515
  },
  {
    "id": 635922,
    "name": "Terror a 47 metros",
    "fullName": "Terror a 47 metros - Colección",
    "poster_path": "/w0SRfsDhpqa3zP33x7PsJJIqdSr.jpg",
    "backdrop_path": "/iiuTr3Ywyy8m6tTdhxuYGXvdLd3.jpg",
    "overview": "Una serie de películas de terror de supervivencia, donde la trama se basa en sobrevivir y escapar de los tiburones que tienen sed de cuerpos humanos.",
    "partIds": [
      403119,
      480105,
      1286513
    ],
    "totalMovies": 3,
    "yearRange": "2017 - 2019",
    "totalVotes": 4493
  },
  {
    "id": 98580,
    "name": "Candyman",
    "fullName": "Candyman - Colección",
    "poster_path": "/4X8k67rccwSldxjFPxxP7x3LjJv.jpg",
    "backdrop_path": "/87UMdcpugFmgVz2VgEopExuckMc.jpg",
    "overview": "La historia de fantasmas de un niño cobra vida aterradora en estos thrillers desgarradores. Un folklore moderno traído a la vida y que el explora el terror desde una perspectiva extraña y bizarra renovando el genero Slasher.",
    "partIds": [
      9529,
      10824,
      12485,
      565028
    ],
    "totalMovies": 4,
    "yearRange": "1992 - 2021",
    "totalVotes": 4462
  },
  {
    "id": 376650,
    "name": "Un novato en apuros",
    "fullName": "Un novato en apuros - Colección",
    "poster_path": "/mflWP4tW1XHeKhek3a4RQTDEft5.jpg",
    "backdrop_path": "/3ZX5hvXjMxWJ5joyJxmWJT5nZDo.jpg",
    "overview": "",
    "partIds": [
      168530,
      323675
    ],
    "totalMovies": 2,
    "yearRange": "2014 - 2016",
    "totalVotes": 4361
  },
  {
    "id": 34055,
    "name": "Pokémon",
    "fullName": "Pokémon - Colección",
    "poster_path": "/9h52kFaxgNobfotNhM72odDpUEk.jpg",
    "backdrop_path": "/iGoYKA0TFfgSoZpG2u5viTJMGfK.jpg",
    "overview": "Las películas de Pokémon cuentan con el elenco principal de la serie televisiva y preceden el estreno de cada temporada. Desde el año 1998 y hasta mediados del año 2017, se han estrenado 20 películas, todas dirigidas por Kunihiko Yuyama. En cada película, aparte del Team/Equipo Rocket también hay personajes invitados que junto con Ash y sus amigos se involucran con uno o varios de los Pokémon legendarios e incluso con nuevos Pokémon que hacen su aparición en los videojuegos. Muchas de estas películas han tenido éxito en la industria del cine a partir del gran impacto que tuvo la primera película.",
    "partIds": [
      10228,
      12599,
      10991,
      12600,
      33875
    ],
    "totalMovies": 5,
    "yearRange": "1998 - 2002",
    "totalVotes": 4220
  },
  {
    "id": 100970,
    "name": "El zorro y el sabueso",
    "fullName": "El zorro y el sabueso - Colección",
    "poster_path": "/sDShTkj6PmAdN9bDjeWofAqXNQN.jpg",
    "backdrop_path": "/fEix7vMN09DUvt7nHh9qFwN9Op9.jpg",
    "overview": "Una anciana encuentra un cachorro de zorro abandonado, del que cuida. El cachorro de zorro, que recibe el nombre de Micke, se convierte en el mejor amigo del vecino, Amos Slade, el cachorro Molle. Juegan, bromean y socializan en general. De repente, sin embargo, sus caminos divergen cuando Molle se va con su maestro para aprender a cazar. Un año después, regresa a la granja como perro de caza adulto.",
    "partIds": [
      10948,
      9948
    ],
    "totalMovies": 2,
    "yearRange": "1981 - 2006",
    "totalVotes": 4334
  },
  {
    "id": 1582,
    "name": "Las Tortugas Ninja",
    "fullName": "Las Tortugas Ninja - Colección",
    "poster_path": "/9hHWae3DjY8MDR9qh1gJuPHYRXZ.jpg",
    "backdrop_path": "/nhduljh4ZdptATMjZxIclXHjmHT.jpg",
    "overview": "Las Tortugas Ninja es una serie de películas basadas en los personajes de los cómics del mismo nombre creadas por Kevin Eastman y Peter Laird, mezclando los tonos de la versión en papel, parodia de Daredevil de Frank Miller, con los tonos más desenfadados y amigables con los niños de la serie. animada que hizo famosos a los personajes en el mundo, y de la que también se deriva la caracterización de los cuatro protagonistas y la diferenciación en los colores de sus máscaras, que en cambio eran todas rojas en el cómic. La primera película de la serie, titulada Teenage Mutant Ninja Turtles, fue lanzada en 1990 en la cima de la popularidad de la serie y fue un éxito comercial. El éxito de la película logró dos secuelas directas, estrenadas en 1991 y 1993 respectivamente.",
    "partIds": [
      1498,
      1497,
      1499
    ],
    "totalMovies": 3,
    "yearRange": "1990 - 1993",
    "totalVotes": 4289
  },
  {
    "id": 487765,
    "name": "Los extraños",
    "fullName": "Los extraños - Colección",
    "poster_path": "/57yzPwXQwBpCp1ZbgaDvIaSSDfq.jpg",
    "backdrop_path": "/6m71j6oywKtXgwO0oxm28YwKOiu.jpg",
    "overview": "Una serie estadounidense de películas de terror y slasher que sigue a personas aterrorizadas por tres asaltantes enmascarados: el hombre de la máscara, Dollface y Pin-Up Girl.",
    "partIds": [
      10665,
      371608
    ],
    "totalMovies": 2,
    "yearRange": "2008 - 2018",
    "totalVotes": 4319
  },
  {
    "id": 334996,
    "name": "El Hijo de Batman",
    "fullName": "El Hijo de Batman - Colección",
    "poster_path": "/ze3Wnhbom7T37orabHMIiEGtoYF.jpg",
    "backdrop_path": "/sVvEkTNx6SjwOb80iyURe5KHtcD.jpg",
    "overview": "",
    "partIds": [
      251519,
      321528,
      366924,
      537056
    ],
    "totalMovies": 4,
    "yearRange": "2014 - 2019",
    "totalVotes": 4241
  },
  {
    "id": 210303,
    "name": "Rebuild of Evangelion",
    "fullName": "Rebuild of Evangelion",
    "poster_path": "/ma2MjOMz5V8c8D6kV3ReZbk7P3a.jpg",
    "backdrop_path": "/las0P4Dua54XrZ73VQmGUaH1z0U.jpg",
    "overview": "Rebuild of Evangelion es una tetralogía de películas de la serie de anime Neon Genesis Evangelion anunciada por Studio khara para septiembre de 2007. Se las puede definir como una adaptación al formato cinematográfico de alto presupuesto y con novedades significativas. Sus creadores lo han descrito como una vía de acceso a la franquicia para nuevos espectadores, siendo un proyecto autosuficiente al margen de la serie original.",
    "partIds": [
      15137,
      22843,
      75629,
      283566
    ],
    "totalMovies": 4,
    "yearRange": "2007 - 2021",
    "totalVotes": 4182
  },
  {
    "id": 9332,
    "name": "Cocodrilo Dundee",
    "fullName": "Cocodrilo Dundee - Colección",
    "poster_path": "/2Twur1JF4K3AWelVsGYO9I5OHqQ.jpg",
    "backdrop_path": "/xqCYAWNqhuV1AH4GM03dejy8a1V.jpg",
    "overview": "\"Crocodile\" Dundee es una película de comedia australiana de 1986 ambientada en el Outback australiano y en la ciudad de Nueva York. Está protagonizada por Paul Hogan como el meteorizado Mick Dundee, cuyo personaje se inspiró en el fallecido Rodney Ansell. La futura esposa de Hogan, Linda Kozlowski, interpretó a Sue Charlton. Inspirado en las verdaderas hazañas de la vida de Rodney Ansell. Hay dos versiones de la película: la versión australiana y la versión estadounidense / internacional, la última de las cuales reemplazó gran parte de la jerga australiana con términos más comúnmente entendidos, y fue un poco más corta. La versión internacional también cambia el título a \"Cocodrilo\" Dundee, agregando las comillas. La película fue seguida por dos secuelas: \"Crocodile\" Dundee II (1988) y Crocodile Dundee en Los Ángeles (2001).",
    "partIds": [
      9671,
      9396,
      9290
    ],
    "totalMovies": 3,
    "yearRange": "1986 - 2001",
    "totalVotes": 4203
  },
  {
    "id": 495,
    "name": "Shaft",
    "fullName": "Shaft Collection",
    "poster_path": "/rGUN5M0VtvbAXGFk1KdrnwZ2lNZ.jpg",
    "backdrop_path": "/dvFvX16cpsj2Us6Lvb03Oq4eEZI.jpg",
    "overview": "",
    "partIds": [
      482,
      493,
      494,
      479,
      486131
    ],
    "totalMovies": 5,
    "yearRange": "1971 - 2019",
    "totalVotes": 4074
  },
  {
    "id": 750822,
    "name": "The Addams Family (Animated)",
    "fullName": "The Addams Family (Animated) Collection",
    "poster_path": "/mk4lHjUF4phFoRdBRqBgLqdPeeg.jpg",
    "backdrop_path": "/3VfaWlf8wJewGsKSTYhJsY0pnNx.jpg",
    "overview": "",
    "partIds": [
      481084,
      639721
    ],
    "totalMovies": 2,
    "yearRange": "2019 - 2021",
    "totalVotes": 4002
  },
  {
    "id": 830781,
    "name": "Cementerio de mascotas (Reboot) Coleccion",
    "fullName": "Cementerio de mascotas (Reboot) Coleccion",
    "poster_path": "/dy58ipx45hFTV0h9xcOuiyfQ9LY.jpg",
    "backdrop_path": "/5wgLUOe7tiskeLt1l4TpS5Cew9U.jpg",
    "overview": "",
    "partIds": [
      157433,
      830764
    ],
    "totalMovies": 2,
    "yearRange": "2019 - 2023",
    "totalVotes": 3979
  },
  {
    "id": 8979,
    "name": "El mundo según Wayne",
    "fullName": "El mundo según Wayne - Colección",
    "poster_path": "/2IvxCZ4GoBLD1K1iONjtav2yjY1.jpg",
    "backdrop_path": "/weuB8g0rKxYKfcV9FKNfPyT6g2S.jpg",
    "overview": "Wayne Campbell y Garth Algar son los presentadores de Wayne's World, un programa local de acceso por cable nocturno de los viernes con sede en Aurora, Illinois, donde se miran con los ojos fotos de hermosas mujeres famosas, tocan la guitarra y la batería, y entrevistan a la gente local, burlándose indirectamente. de ellos en el transcurso de la entrevista.",
    "partIds": [
      8872,
      8873
    ],
    "totalMovies": 2,
    "yearRange": "1992 - 1993",
    "totalVotes": 3787
  },
  {
    "id": 87186,
    "name": "El quinto infierno",
    "fullName": "El quinto infierno - Colección",
    "poster_path": "/9r7Bc52IGS7LE5GzqMXZkYRdeat.jpg",
    "backdrop_path": "/wQZVQSiX7KqWNlL70qyS29gjObr.jpg",
    "overview": "",
    "partIds": [
      8374,
      22821,
      893060
    ],
    "totalMovies": 3,
    "yearRange": "1999 - 2009",
    "totalVotes": 3706
  },
  {
    "id": 19387,
    "name": "Los Expedientes Secretos X",
    "fullName": "Los Expedientes Secretos X - Colección",
    "poster_path": "/aeIYknSlbIsjPTJQDExXXuKGRLb.jpg",
    "backdrop_path": "/22p3xTTuXc9FEnzyGlfB9KBtR4Y.jpg",
    "overview": "The X-Files (también conocido como The X-Files: Fight the Future) es una película de suspenso de ciencia ficción estadounidense de 1998 dirigida por Rob Bowman. Chris Carter escribió el guión. La historia es de Carter y Frank Spotnitz. Es el primer largometraje basado en la serie de televisión de Carter The X-Files que gira en torno a casos ficticios sin resolver llamados X-Files y los personajes que los resuelven. Expediente X ha dado lugar a una secuela, una película de 2008 titulada Expediente X: Quiero creer estrenada seis años después de que terminara la serie.",
    "partIds": [
      846,
      8836
    ],
    "totalMovies": 2,
    "yearRange": "1998 - 2008",
    "totalVotes": 3657
  },
  {
    "id": 130440,
    "name": "La Pantera Rosa (Steve Martin)",
    "fullName": "La Pantera Rosa (Steve Martin) - Colección",
    "poster_path": "/xYbMC6vo4rMIX8hkTUZva86r0i5.jpg",
    "backdrop_path": "/tuE4QPHLHaMUkAW4Yggig5U92rl.jpg",
    "overview": "Relanzamiento de la saga  de películas de la Pantera Rosa",
    "partIds": [
      12096,
      15159
    ],
    "totalMovies": 2,
    "yearRange": "2006 - 2009",
    "totalVotes": 3528
  },
  {
    "id": 247028,
    "name": "Samurai X",
    "fullName": "Samurai X - Colección",
    "poster_path": "/t7L45YTq0NIhZESk5S1K51eTQoI.jpg",
    "backdrop_path": "/fVBDlWthHhzwo3wYauHG3ljzQ1t.jpg",
    "overview": "",
    "partIds": [
      127533,
      221731,
      221732,
      602063,
      672322
    ],
    "totalMovies": 5,
    "yearRange": "2012 - 2021",
    "totalVotes": 3356
  },
  {
    "id": 93369,
    "name": "Ringu",
    "fullName": "Ringu - Colección",
    "poster_path": "/5I2QJFAoGwWsyETMTGLebxteSW0.jpg",
    "backdrop_path": "/aS42DTtR6UYNLfKdKJBKYL1OS1U.jpg",
    "overview": "",
    "partIds": [
      2671,
      9706,
      9669,
      9674,
      140441,
      257527,
      382602,
      583132,
      940417
    ],
    "totalMovies": 9,
    "yearRange": "1998 - 2022",
    "totalVotes": 3312
  },
  {
    "id": 248534,
    "name": "Batman: El regreso del Caballero Oscuro",
    "fullName": "Batman: El regreso del Caballero Oscuro - Colección",
    "poster_path": "/o0eLE8ZgQRFqoHXPj5QcTYf5uFz.jpg",
    "backdrop_path": "/bNLLjc6NT80FmFknvHn8demDHhl.jpg",
    "overview": "",
    "partIds": [
      123025,
      142061
    ],
    "totalMovies": 2,
    "yearRange": "2012 - 2013",
    "totalVotes": 3404
  },
  {
    "id": 43563,
    "name": "Todo en un viernes",
    "fullName": "Todo en un viernes - Colección",
    "poster_path": "/3B83t6RgcLQtZJliAFAtavZD4sm.jpg",
    "backdrop_path": "/pXszT8ZWGj3fohU9FY0niA0IDEw.jpg",
    "overview": "Friday es una película de 1995 sobre amigos, comedia dramática y fumetas dirigida por F. Gary Gray, lo que la convierte en su debut como director para una exitosa película. Protagonizada por Ice Cube, Chris Tucker, Nia Long, Bernie Mac, Tommy Lister, Jr. y John Witherspoon, la película gira alrededor de 16 horas en la vida de los holgazanes desempleados Craig Jones y Smokey, que deben pagarle a un traficante de drogas $ 200 por 10: 00 PM esa noche. La película generó dos secuelas: Next Friday y Friday After Next, y una cuarta película propuesta, Last Friday.",
    "partIds": [
      10634,
      10471,
      10426,
      487560
    ],
    "totalMovies": 4,
    "yearRange": "1995 - 2002",
    "totalVotes": 3290
  },
  {
    "id": 1390700,
    "name": "The Pope's Exorcist",
    "fullName": "The Pope's Exorcist Collection",
    "poster_path": "/9tYKrctAoikFwNJVJfeq7RUVM4p.jpg",
    "backdrop_path": "/3oqmk6mNWPatBKcjOOJLp5WW9zN.jpg",
    "overview": "",
    "partIds": [
      758323,
      1285237
    ],
    "totalMovies": 2,
    "yearRange": "2023",
    "totalVotes": 3309
  },
  {
    "id": 307637,
    "name": "El regalo prometido",
    "fullName": "El regalo prometido - Colección",
    "poster_path": "/gnVmo8ENgJtBFQ1Hw70GdB3o8Ye.jpg",
    "backdrop_path": "/grCEwz2sIneF1wlDtVx6UiLqtLc.jpg",
    "overview": "El regalo prometido es una comedia navideña estadounidense de 1996 dirigida por Brian Levant y protagonizada por Arnold Schwarzenegger y Sinbad. La historia sigue a dos padres rivales que luchan por conseguir una figura de acción de Turbo-Man para sus hijos en la víspera de Navidad.  En 2014 se lanzó El regalo prometido 2, producida por WWE Studios y 20th Century Fox. Sin el elenco original, fue protagonizada por Larry the Cable Guy y Santino Marella, con una trama similar. La secuela fue directa a DVD y dirigida por Alex Zamm.",
    "partIds": [
      9279,
      289728
    ],
    "totalMovies": 2,
    "yearRange": "1996 - 2014",
    "totalVotes": 3189
  },
  {
    "id": 10789,
    "name": "Cementerio de Mascotas",
    "fullName": "Cementerio de Mascotas - Colección",
    "poster_path": "/i8JybwQNXZc3eHyl3PqIIGtLdE8.jpg",
    "backdrop_path": "/ZkSBmKmi7aZVBmuHEXdPhj6Ylt.jpg",
    "overview": "Adaptaciones y extensiones cinematográficas de la novela de 1983 de Stephen King. Un cementerio de mascotas (anteriormente un cementerio de Miꞌkmaq) en Maine permite que los muertos se reanimen como un caparazón asesino de sus antiguos seres vivos.",
    "partIds": [
      8913,
      10906
    ],
    "totalMovies": 2,
    "yearRange": "1989 - 1992",
    "totalVotes": 3124
  },
  {
    "id": 1667962,
    "name": "John Singleton's Hood Trilogy",
    "fullName": "John Singleton's Hood Trilogy",
    "poster_path": "/wE5FSbubblF4wjfdIn8nAc1g84l.jpg",
    "backdrop_path": "/8e81XbRfudgjsxE7HyCC6oCXsAH.jpg",
    "overview": "",
    "partIds": [
      650,
      8291,
      16161
    ],
    "totalMovies": 3,
    "yearRange": "1991 - 2001",
    "totalVotes": 3047
  },
  {
    "id": 112399,
    "name": "Alerta Máxima",
    "fullName": "Alerta Máxima - Colección",
    "poster_path": "/565HFmKTWwlHzZgzcrY8oEwa9dZ.jpg",
    "backdrop_path": "/ihBDaN7OwT7D9DVri8SmxCnuRLB.jpg",
    "overview": "Pack recopilatorio que incluye las películas de acción Alerta Máxima y Alerta Máxima 2 protagonizadas por Steven Seagal.",
    "partIds": [
      8845,
      3512
    ],
    "totalMovies": 2,
    "yearRange": "1992 - 1995",
    "totalVotes": 2891
  },
  {
    "id": 270252,
    "name": "Aviones",
    "fullName": "Aviones - Colección",
    "poster_path": "/qsY2mhu4qMjUXgSn4DzsRh9qaJF.jpg",
    "backdrop_path": "/vxgnRbELXgcTSdby7bHR30XEE4f.jpg",
    "overview": "Una serie de comedia de acción y aventura animada por ordenador que sigue las aventuras de Dusty, un fumigador con sueños altísimos. Dusty tiene un gran corazón, pero dos grandes problemas...no está precisamente hecho para la velocidad, además tiene miedo de las alturas. Con un poco de ayuda de sus amigos, Dusty siempre encuentra el valor para ser más de lo que fue construido para - y la inspiración para elevarse. Es un spin-off de la franquicia de Pixar’s Cars.",
    "partIds": [
      151960,
      218836
    ],
    "totalMovies": 2,
    "yearRange": "2013 - 2014",
    "totalVotes": 2850
  },
  {
    "id": 14377,
    "name": "El vengador anónimo",
    "fullName": "El vengador anónimo - Colección",
    "poster_path": "/acHvGnZeTJWrIhgYjbzJKT4Udki.jpg",
    "backdrop_path": "/ex6rCofTglfyuO0HQiKedIIq4pZ.jpg",
    "overview": "Cinco películas sobre Paul Kersey, un arquitecto sin suerte alguna. Primero, su esposa es asesinada cuando su piso es asaltado. 8 años después, su hija enferma mental es violada y asesinada. Después de todo esto, Kersey nunca será el mismo y terminará luchando contra narcotraficantes y criminales del mundo.",
    "partIds": [
      13939,
      14373,
      24873,
      26263,
      34746
    ],
    "totalMovies": 5,
    "yearRange": "1974 - 1994",
    "totalVotes": 2754
  },
  {
    "id": 135466,
    "name": "Fenómeno Siniestro",
    "fullName": "Fenómeno Siniestro - Colección",
    "poster_path": "/dAPOxDBf1CEZjyrDvalGJBHfjJ0.jpg",
    "backdrop_path": "/9gKwnJbPjY65EVb5oFlbmY4qF2p.jpg",
    "overview": "Una serie de películas de terror encontradas en un hospital psiquiátrico embrujado abandonado.",
    "partIds": [
      50698,
      134366
    ],
    "totalMovies": 2,
    "yearRange": "2011 - 2012",
    "totalVotes": 2802
  },
  {
    "id": 98036,
    "name": "Re-Animator",
    "fullName": "Re-Animator Collection",
    "poster_path": "/j1v4JQUVwCDH2KKJGjFeShXp2JT.jpg",
    "backdrop_path": "/xxBV7ZyywpBBEdQbuen7Rp3RIIp.jpg",
    "overview": "",
    "partIds": [
      1694,
      18111,
      11429
    ],
    "totalMovies": 3,
    "yearRange": "1985 - 2003",
    "totalVotes": 2679
  },
  {
    "id": 3963,
    "name": "Les Rivières pourpres",
    "fullName": "Les Rivières pourpres",
    "poster_path": "/bDnnQcJmVnkkmauIRcPnS95qhaj.jpg",
    "backdrop_path": "/lCTHir1L6IDfHNv8U1skkGQnImr.jpg",
    "overview": "",
    "partIds": [
      60670,
      60672
    ],
    "totalMovies": 2,
    "yearRange": "2000 - 2004",
    "totalVotes": 2631
  },
  {
    "id": 421904,
    "name": "Batman (DC Universo Animado)",
    "fullName": "Batman (DC Universo Animado) - Colección",
    "poster_path": "/4fDffWkGuIt62GQVAUTUgRoZxT2.jpg",
    "backdrop_path": "/l0udVVfpZ1LzeH5IxC3U2UI5EiI.jpg",
    "overview": "",
    "partIds": [
      14919,
      15805,
      21683
    ],
    "totalMovies": 3,
    "yearRange": "1993 - 2003",
    "totalVotes": 2310
  },
  {
    "id": 123932,
    "name": "Cuarentena",
    "fullName": "Cuarentena - Colección",
    "poster_path": "/uCQg99dwc7rQFcPUqWRRJk6PtN.jpg",
    "backdrop_path": "/7tMlGUiAGrryUimeKDnECC9mWEZ.jpg",
    "overview": "",
    "partIds": [
      13812,
      59115
    ],
    "totalMovies": 2,
    "yearRange": "2008 - 2011",
    "totalVotes": 2120
  },
  {
    "id": 989621,
    "name": "Jackass Presents: Bad Grandpa",
    "fullName": "Jackass Presents: Bad Grandpa Collection",
    "poster_path": "/j9zptJrVChVyDDXkhkD20MuOyvk.jpg",
    "backdrop_path": "/1rNQG7LOjZheSN1iLGGxaey2254.jpg",
    "overview": "",
    "partIds": [
      208134,
      273641
    ],
    "totalMovies": 2,
    "yearRange": "2013 - 2014",
    "totalVotes": 2053
  },
  {
    "id": 47770,
    "name": "Fantasma",
    "fullName": "Fantasma - Colección",
    "poster_path": "/4xsUaOAnOHvGfTUL4HHziRE7Aaq.jpg",
    "backdrop_path": "/iYqhzS4ToJbcx3lbpy33MbDVsE9.jpg",
    "overview": "Una serie de películas de terror americanas que presenta al Hombre Alto, un emprendedor sobrenatural y malévolo que convierte a los muertos en zombies enanos para cumplir sus órdenes y conquistar el mundo.",
    "partIds": [
      9638,
      15158,
      16139,
      16146,
      262848
    ],
    "totalMovies": 5,
    "yearRange": "1979 - 2016",
    "totalVotes": 1968
  },
  {
    "id": 203910,
    "name": "Pusher",
    "fullName": "Pusher Collection",
    "poster_path": "/nsvFlQpPYReSG5UdPz1QO0V30PJ.jpg",
    "backdrop_path": "/aNQuRUYTz8CT9HxlNLj4oJ9ctut.jpg",
    "overview": "",
    "partIds": [
      2061,
      11328,
      11330
    ],
    "totalMovies": 3,
    "yearRange": "1996 - 2005",
    "totalVotes": 1956
  },
  {
    "id": 85890,
    "name": "The Librarian",
    "fullName": "The Librarian Collection",
    "poster_path": "/52ghzmcU5JV0jeQAcdkA5h7Miw4.jpg",
    "backdrop_path": "/rnLYa3sskbmwxKbfMA8TCx5TXRW.jpg",
    "overview": "",
    "partIds": [
      14207,
      14208,
      14728
    ],
    "totalMovies": 3,
    "yearRange": "2004 - 2008",
    "totalVotes": 1926
  },
  {
    "id": 386162,
    "name": "LEGO DC Cómics Super Héroes",
    "fullName": "LEGO DC Cómics Super Héroes - Colección",
    "poster_path": "/rdQMvm9rhDiSTsVOr7d5ObmK9zf.jpg",
    "backdrop_path": "/xMSbYXiCstnssIdxAajbGST8lpI.jpg",
    "overview": "",
    "partIds": [
      177271,
      300424,
      322456,
      353595,
      382512,
      396330,
      504997,
      513736,
      602307,
      690369
    ],
    "totalMovies": 10,
    "yearRange": "2013 - 2020",
    "totalVotes": 1817
  },
  {
    "id": 762458,
    "name": "Scooby-Doo! Zombie Island",
    "fullName": "Scooby-Doo! Zombie Island Collection",
    "poster_path": "/zP0EuAjQJpkexZ6H4lKDlqyxtWH.jpg",
    "backdrop_path": "/dDD9Nn8l6UkKOboCG33jxBAoLmr.jpg",
    "overview": "",
    "partIds": [
      13151,
      615774
    ],
    "totalMovies": 2,
    "yearRange": "1998 - 2019",
    "totalVotes": 1864
  },
  {
    "id": 135495,
    "name": "King Kong 1933",
    "fullName": "King Kong 1933 - Colección",
    "poster_path": "/mQM60DLT5AG7yLEsqmxwuyYsWxg.jpg",
    "backdrop_path": "/hcAcwtLzqJIFS6xFQzb6noBh6Rq.jpg",
    "overview": "",
    "partIds": [
      244,
      43149
    ],
    "totalMovies": 2,
    "yearRange": "1933",
    "totalVotes": 1820
  },
  {
    "id": 374512,
    "name": "Godzilla Millennium",
    "fullName": "Godzilla Millennium - Colección",
    "poster_path": "/gkotmTqBWSMYGT6QdnTFGuf7SI.jpg",
    "backdrop_path": "/jlwLm4TOjPuZ1GrJDKOhJYSXYhS.jpg",
    "overview": "",
    "partIds": [
      10643,
      39468,
      36243,
      12636,
      39469,
      15767
    ],
    "totalMovies": 6,
    "yearRange": "1999 - 2004",
    "totalVotes": 1739
  },
  {
    "id": 1156855,
    "name": "Teenage Mutant Ninja Turtles (Animated)",
    "fullName": "Teenage Mutant Ninja Turtles (Animated) Collection",
    "poster_path": "/qTlv8ForzRi7p5HFcVrirPDlf2W.jpg",
    "backdrop_path": "/xVWfbv1wqIZshjJqHvmyjLGlV02.jpg",
    "overview": "",
    "partIds": [
      614930,
      1156621
    ],
    "totalMovies": 2,
    "yearRange": "2023 - 2027",
    "totalVotes": 1684
  },
  {
    "id": 1172926,
    "name": "The Strangers (Remake)",
    "fullName": "The Strangers (Remake) Collection",
    "poster_path": "/uS9sFjUsOfjBYVnetyTvMeYrhaS.jpg",
    "backdrop_path": "/1IihKmAv26AkN9jVmzx3JPsd9BU.jpg",
    "overview": "",
    "partIds": [
      1010600,
      1010756,
      1010755
    ],
    "totalMovies": 3,
    "yearRange": "2024 - 2026",
    "totalVotes": 1559
  },
  {
    "id": 1510620,
    "name": "The Garfield Movie",
    "fullName": "The Garfield Movie Collection",
    "poster_path": "/6unszOK7hcgIaZlYHSdqthBtaaR.jpg",
    "backdrop_path": "/h9RaE217cj2uNdrtr1vifCx9N5v.jpg",
    "overview": "Una serie de películas animadas basada en el icónico gato naranja amante de la lasaña y enemigo de los lunes, Garfield, y sus amigos.",
    "partIds": [
      748783,
      1510501
    ],
    "totalMovies": 2,
    "yearRange": "2024",
    "totalVotes": 1522
  },
  {
    "id": 386410,
    "name": "Dragon Ball",
    "fullName": "Dragon Ball - Colección",
    "poster_path": "/8Mt6yPIB3cE5oHJdukBUeKfGBm.jpg",
    "backdrop_path": "/i5ECrR2zT7GQl0J8WdyGTm9D6d6.jpg",
    "overview": "La colección reúne las cuatro películas del clásico anime Dragon Ball donde las aventuras siguen a Goku cuando era niño.",
    "partIds": [
      39144,
      39145,
      116776,
      39148
    ],
    "totalMovies": 4,
    "yearRange": "1986 - 1996",
    "totalVotes": 1462
  },
  {
    "id": 290933,
    "name": "Superman / Batman",
    "fullName": "Superman / Batman - Colección",
    "poster_path": "/hj0AOSamY8YMK9fs5by9oX7MiOO.jpg",
    "backdrop_path": "/leoLyMvUq2qExFZMtI8XAHNWQ94.jpg",
    "overview": "",
    "partIds": [
      22855,
      45162
    ],
    "totalMovies": 2,
    "yearRange": "2009 - 2010",
    "totalVotes": 1548
  },
  {
    "id": 492969,
    "name": "Tadeo Jones",
    "fullName": "Tadeo Jones - Colección",
    "poster_path": "/mEXDCS3FdEEWGlPmewKK6mKuYT5.jpg",
    "backdrop_path": "/9iTuTyvEu9TnbbPTVmuswPwZrP.jpg",
    "overview": "Colección de películas de Tadeo Jones",
    "partIds": [
      121734,
      452773,
      676701
    ],
    "totalMovies": 3,
    "yearRange": "2012 - 2022",
    "totalVotes": 1441
  },
  {
    "id": 48190,
    "name": "La venganza de los nerds",
    "fullName": "La venganza de los nerds - Colección",
    "poster_path": "/rXjznTQOrUx0LH1RvXriVPlTUPu.jpg",
    "backdrop_path": "/ye2jgHFYJTdyaopntShSkVWVOcT.jpg",
    "overview": "Un grupo de empollones tendrá que enfrentarse a los gestos de desprecio y las bromas pesadas de los deportistas y los miembros de una fraternidad universitaria.",
    "partIds": [
      14052,
      16889,
      18543,
      21029
    ],
    "totalMovies": 4,
    "yearRange": "1984 - 1994",
    "totalVotes": 1431
  },
  {
    "id": 379475,
    "name": "Batman del Futuro",
    "fullName": "Batman del Futuro - Colección",
    "poster_path": "/zCFM4QKS8gr3e9lQ2rpjyzGuS1U.jpg",
    "backdrop_path": "/vGELVBakzTMT6rfJ3Rvyftnnjyy.jpg",
    "overview": "",
    "partIds": [
      64202,
      16234
    ],
    "totalMovies": 2,
    "yearRange": "1999 - 2000",
    "totalVotes": 1429
  },
  {
    "id": 593251,
    "name": "La muerte de Superman",
    "fullName": "La muerte de Superman - Colección",
    "poster_path": "/rmgTtrY32IRgTEMtHluDIg6OTgL.jpg",
    "backdrop_path": "/viomxKA5tejwzJJOMOBjFMgwgCR.jpg",
    "overview": "Esta Colección expande la linea de  historia de Superman dentro de las Películas del Universo Animado de DC. Cuando un furioso monstruo llega a la Tierra y empieza una devastación sin sentido, la liga de la justicia es llamada rápidamente para detenerlo. Pero muy pronto se vuelve evidente que  solo Superman puede enfrentarse a esta monstruosidad.  Después de La Muerte de Superman, el mundo sigue llorando la perdida del Hombre de Acero después de su fatal batalla con el monstruo Doomsday. Sin embargo al poco tiempo de que su cuerpo fue sepultador cuatro nuevos portadores del símbolo de Superman salen a la luz para tomar el tu manto. El Ultimo Hijo de Krypton, Superboy, Acero y el Superman Cyborg todos intentan llenar el vació dejado por el mas grande campeón del mundo. Mientras tanto, la muerte de Superman también ha sido una señal al universo de que la Tierra es vulnerable. ¿Pueden estos nuevos Super Hombres y el resto de los héroes probar que se equivocan?",
    "partIds": [
      487672,
      487670
    ],
    "totalMovies": 2,
    "yearRange": "2019",
    "totalVotes": 1385
  },
  {
    "id": 65249,
    "name": "Tarzan (Johnny Weissmuller)",
    "fullName": "Tarzan (Johnny Weissmuller) Collection",
    "poster_path": "/A7y3pvdHOMX0QiW63FKZIyFhYhE.jpg",
    "backdrop_path": "/sLOPjG0tQILfAXsWkWdaX31uq3b.jpg",
    "overview": "",
    "partIds": [
      26845,
      18994,
      38661,
      40044,
      40214,
      40045,
      55860,
      55871,
      55872,
      55873,
      82053,
      70136
    ],
    "totalMovies": 12,
    "yearRange": "1932 - 1948",
    "totalVotes": 1218
  },
  {
    "id": 633815,
    "name": "Scooby-Doo! (TV Movie)",
    "fullName": "Scooby-Doo! (TV Movie) Collection",
    "poster_path": "/2qtj70QMZJmuyDixMUfzEPUb9kF.jpg",
    "backdrop_path": "/tkdIAO8euvwgniAVPSVjWIrZibj.jpg",
    "overview": "",
    "partIds": [
      22620,
      47533
    ],
    "totalMovies": 2,
    "yearRange": "2009 - 2010",
    "totalVotes": 1293
  },
  {
    "id": 267922,
    "name": "The Hills Have Eyes (Original)",
    "fullName": "The Hills Have Eyes (Original) Collection",
    "poster_path": "/2qkbkOymo1jfI8Hhe5ZcvAmAlpr.jpg",
    "backdrop_path": "/3Tezeh4KTsqPqFKqatjtd3cAjMk.jpg",
    "overview": "",
    "partIds": [
      12262,
      18477
    ],
    "totalMovies": 2,
    "yearRange": "1977 - 1985",
    "totalVotes": 1339
  },
  {
    "id": 785583,
    "name": "Batman: The Long Halloween",
    "fullName": "Batman: The Long Halloween Collection",
    "poster_path": "/1teF9hwrtAwgaUfuqz8JWYKkt7R.jpg",
    "backdrop_path": "/gqhaRMFbwikUGIO4YfiwfSGgzJw.jpg",
    "overview": "",
    "partIds": [
      736073,
      736074
    ],
    "totalMovies": 2,
    "yearRange": "2021",
    "totalVotes": 1334
  },
  {
    "id": 135498,
    "name": "King Kong Remake",
    "fullName": "King Kong Remake - Colección",
    "poster_path": "/zMByYr268H1fPssx3zAIac7SZ9l.jpg",
    "backdrop_path": "/k98iowBJdKDRKbllrpdpk4SarJE.jpg",
    "overview": "",
    "partIds": [
      10730,
      31947
    ],
    "totalMovies": 2,
    "yearRange": "1976 - 1986",
    "totalVotes": 1241
  },
  {
    "id": 661025,
    "name": "Pokémon: Generación avanzada",
    "fullName": "Pokémon: Generación avanzada - Colección",
    "poster_path": "/fVqW8J9BWYKDg6L2fZyso47dqbD.jpg",
    "backdrop_path": "/dsK9kYcQVxN2jtOlLlJDKn9yg6y.jpg",
    "overview": "Colección de películas publicadas como parte de la serie Pokémon: Generación avanzada.",
    "partIds": [
      36218,
      34065,
      34067,
      16808
    ],
    "totalMovies": 4,
    "yearRange": "2003 - 2006",
    "totalVotes": 1191
  },
  {
    "id": 44215,
    "name": "Stargate SG-1",
    "fullName": "Stargate SG-1 - Colección",
    "poster_path": "/gqzYKjQvvO8YJhZuj616iMA9mZr.jpg",
    "backdrop_path": "/hFpn4mlPEd7juZqX9eGMc63j11T.jpg",
    "overview": "Las continuas misiones del SG1 y amigos mientras exploran la galaxia usando tecnologías antiguas y hardware alienígena.",
    "partIds": [
      13001,
      12914
    ],
    "totalMovies": 2,
    "yearRange": "2008",
    "totalVotes": 1242
  },
  {
    "id": 661026,
    "name": "Pokémon: Diamante & Perla",
    "fullName": "Pokémon: Diamante & Perla - Colección",
    "poster_path": "/piQiaDOIeR06epBYhk9DSUBD8iA.jpg",
    "backdrop_path": "/7flPQzneoQrXirkKB62pLc2KlaC.jpg",
    "overview": "Colección de películas publicadas como parte de la serie Pokémon: Diamante y Perla.",
    "partIds": [
      25961,
      47292,
      39057,
      50087
    ],
    "totalMovies": 4,
    "yearRange": "2007 - 2010",
    "totalVotes": 1188
  },
  {
    "id": 661031,
    "name": "Pokémon (Continuidad alternativa)",
    "fullName": "Pokémon (Continuidad alternativa) - Colección",
    "poster_path": "/caRQp2qsUFHQ0NYpEfxA8Pm2Gl4.jpg",
    "backdrop_path": "/ouB7lVkdGJgHq776dmWE6GTZeaA.jpg",
    "overview": "Colección de películas que siguen la continuidad alternativa establecida en la película del 20 aniversario de Pokémon.",
    "partIds": [
      436931,
      494407,
      662708
    ],
    "totalMovies": 3,
    "yearRange": "2017 - 2020",
    "totalVotes": 1137
  },
  {
    "id": 221544,
    "name": "The Mummy (Universal)",
    "fullName": "The Mummy (Universal) Collection",
    "poster_path": "/AvNgVQAVU7glcRawxyXnyHMPPbk.jpg",
    "backdrop_path": "/9Hurk1iwEE3USJpBe48FChOSROC.jpg",
    "overview": "",
    "partIds": [
      15849,
      31498,
      29239,
      29243,
      29242
    ],
    "totalMovies": 5,
    "yearRange": "1932 - 1944",
    "totalVotes": 1095
  },
  {
    "id": 158391,
    "name": "The Apu Trilogy",
    "fullName": "The Apu Trilogy",
    "poster_path": "/ekEQTSoS1KTbtrwjASCaQae2f2A.jpg",
    "backdrop_path": "/r3WHsC8YNp4558QWixbdccI1tuN.jpg",
    "overview": "",
    "partIds": [
      5801,
      897,
      896
    ],
    "totalMovies": 3,
    "yearRange": "1955 - 1959",
    "totalVotes": 1122
  },
  {
    "id": 916357,
    "name": "Jack in the Box",
    "fullName": "Jack in the Box Collection",
    "poster_path": "/ciUCJLvWDCBbwtQVW463EuQtQvA.jpg",
    "backdrop_path": "/tCJRbkzO4XAZpEUkKoImk3BAiz0.jpg",
    "overview": "",
    "partIds": [
      622420,
      801071,
      1207898,
      1318595
    ],
    "totalMovies": 4,
    "yearRange": "2019 - 2024",
    "totalVotes": 1095
  },
  {
    "id": 891174,
    "name": "Nobody Sleeps in the Woods Tonight",
    "fullName": "Nobody Sleeps in the Woods Tonight Collection",
    "poster_path": "/CgpNldRCvcD6o4g6VkxqGlkYKj.jpg",
    "backdrop_path": "/7lbAMnKqm5fhN4JPIU20kWDvnJ1.jpg",
    "overview": "",
    "partIds": [
      681019,
      871964
    ],
    "totalMovies": 2,
    "yearRange": "2020 - 2021",
    "totalVotes": 1098
  },
  {
    "id": 123213,
    "name": "La mosca",
    "fullName": "La mosca - Colección",
    "poster_path": "/3qqkcJAnmyGPTFrAXEjwZbRGtmE.jpg",
    "backdrop_path": "/1MMTGpmm0E9yXRTNyW0YebAs66S.jpg",
    "overview": "",
    "partIds": [
      11815,
      38126,
      38125
    ],
    "totalMovies": 3,
    "yearRange": "1958 - 1965",
    "totalVotes": 1010
  },
  {
    "id": 196753,
    "name": "Ghost in the Shell Arise",
    "fullName": "Ghost in the Shell Arise - Colección",
    "poster_path": "/wlPmzvnoARcfy4KUi7tHswNZZwH.jpg",
    "backdrop_path": "/vZ4GEdYIipwXF37BGKN1kgb8BIG.jpg",
    "overview": "Ghost in the Shell: Arise es una serie de películas que sirve como una reinvención de Masamune Shirow's Ghost in the Shell. Las películas, una serie de cuatro partes, presentan nuevos diseños de personajes y está dirigida por Kazuchika Kise, el guión de Tow Ubukata y la música de Cornelius.",
    "partIds": [
      196750,
      212168,
      240341,
      279254,
      334376
    ],
    "totalMovies": 5,
    "yearRange": "2013 - 2015",
    "totalVotes": 966
  },
  {
    "id": 1767325,
    "name": "Koker Trilogy",
    "fullName": "Koker Trilogy",
    "poster_path": "/cEEfyCRwk8rniHeA9QAZA4R0NNt.jpg",
    "backdrop_path": "/ylBiGZhgBsly0frseG2PvqoYM4o.jpg",
    "overview": "",
    "partIds": [
      49964,
      83761,
      47104
    ],
    "totalMovies": 3,
    "yearRange": "1987 - 1994",
    "totalVotes": 869
  },
  {
    "id": 171439,
    "name": "F/X",
    "fullName": "F/X Collection",
    "poster_path": "/nwiW8MgZLuukDFLe09lWixljmKF.jpg",
    "backdrop_path": "/pLj66wA3xzB9vyOlzZRevSKamoD.jpg",
    "overview": "",
    "partIds": [
      9873,
      16820
    ],
    "totalMovies": 2,
    "yearRange": "1986 - 1991",
    "totalVotes": 836
  },
  {
    "id": 146534,
    "name": "Without a Paddle",
    "fullName": "Without a Paddle Collection",
    "poster_path": "/xvBJFToMXXZ8b6Y3iMVMymvMwPf.jpg",
    "backdrop_path": "/atR4dzV6GYogbtOTuSCiq3cWN97.jpg",
    "overview": "",
    "partIds": [
      10762,
      28677
    ],
    "totalMovies": 2,
    "yearRange": "2004 - 2009",
    "totalVotes": 828
  },
  {
    "id": 338282,
    "name": "Single White Female",
    "fullName": "Single White Female Collection",
    "poster_path": "/w5GFkSMCE3GBnPL9ivP5qTLbdp2.jpg",
    "backdrop_path": "/qi5hgdgYBrwEV9AJOzeF47zET9V.jpg",
    "overview": "",
    "partIds": [
      9605,
      35683
    ],
    "totalMovies": 2,
    "yearRange": "1992 - 2005",
    "totalVotes": 801
  },
  {
    "id": 434533,
    "name": "Carrera de la muerte Original",
    "fullName": "Carrera de la muerte Original - Colección",
    "poster_path": "/kpdCNcuQsDlBQ1ZPF0e2P5cqIXB.jpg",
    "backdrop_path": "/zFwnFKsutUUQB2UX8kFriVCYyLU.jpg",
    "overview": "",
    "partIds": [
      13282,
      401544
    ],
    "totalMovies": 2,
    "yearRange": "1975 - 2017",
    "totalVotes": 810
  },
  {
    "id": 661028,
    "name": "Pokémon: Blanco y Negro",
    "fullName": "Pokémon: Blanco y Negro - Colección",
    "poster_path": "/qoGN5dPFTe9HCeLF8NUVjUzbL9B.jpg",
    "backdrop_path": "/rrDc86vxYrKhIDAA6MdD1u6Woig.jpg",
    "overview": "Colección de películas lanzadas como parte de la serie de anime Pokémon: Blanco y Negro",
    "partIds": [
      88557,
      115223,
      150213,
      227679
    ],
    "totalMovies": 4,
    "yearRange": "2011 - 2013",
    "totalVotes": 767
  },
  {
    "id": 1004630,
    "name": "Lego Star Wars Colección de Temporada",
    "fullName": "Lego Star Wars Colección de Temporada",
    "poster_path": "/vRcao43Qyx9V4TmIgzaf91Eaex7.jpg",
    "backdrop_path": "/cVYUqWzzUSrkLQwb4jlWAkaFCAX.jpg",
    "overview": "Una colección de especiales de temporada de LEGO Stars Wars lanzada en Disney+",
    "partIds": [
      732670,
      857702,
      980804
    ],
    "totalMovies": 3,
    "yearRange": "2020 - 2022",
    "totalVotes": 772
  },
  {
    "id": 661029,
    "name": "Pokémon: XY",
    "fullName": "Pokémon: XY - Colección",
    "poster_path": "/sf6usp7dIVp8erFa4UWKzmVqgYg.jpg",
    "backdrop_path": "/pTWxpxkEl9cprTXganqtiKfgbgU.jpg",
    "overview": "Colección de películas lanzadas como parte de la serie de anime Pokémon: XY.",
    "partIds": [
      303903,
      350499,
      382190
    ],
    "totalMovies": 3,
    "yearRange": "2014 - 2016",
    "totalVotes": 741
  },
  {
    "id": 494838,
    "name": "El Ataque del Tiburón",
    "fullName": "El Ataque del Tiburón - Colección",
    "poster_path": "/ybwIEcnr26cJ2hWDMRaAF20JGdP.jpg",
    "backdrop_path": "/yMNFAlTCMyU766Qrzo0fvyvw0V6.jpg",
    "overview": "",
    "partIds": [
      86703,
      342927,
      460218,
      522438
    ],
    "totalMovies": 4,
    "yearRange": "2012 - 2018",
    "totalVotes": 744
  },
  {
    "id": 141084,
    "name": "Happily N'Ever After",
    "fullName": "Happily N'Ever After Collection",
    "poster_path": "/zyL0KZfmSPtGNXLDwMcdWsvrkNi.jpg",
    "backdrop_path": "/fw6YfVOmK0tVtaSUGb3GvLzEmvK.jpg",
    "overview": "",
    "partIds": [
      5393,
      16652
    ],
    "totalMovies": 2,
    "yearRange": "2007 - 2009",
    "totalVotes": 685
  },
  {
    "id": 107471,
    "name": "Yamakasi",
    "fullName": "Yamakasi Collection",
    "poster_path": "/jiUYHa7Xq9mutuNCL03gXRd0imy.jpg",
    "backdrop_path": "/brTwRwoszOadojCoRzCbNjbYd9S.jpg",
    "overview": "",
    "partIds": [
      6935,
      25631
    ],
    "totalMovies": 2,
    "yearRange": "2001 - 2004",
    "totalVotes": 727
  },
  {
    "id": 363014,
    "name": "Like Mike",
    "fullName": "Like Mike Collection",
    "poster_path": "/rPs2WqoqpIL0VRPcBGK4MGrrdKT.jpg",
    "backdrop_path": "/t5izvGShK6rKH97LxIwfoYckdxH.jpg",
    "overview": "",
    "partIds": [
      21972,
      26655
    ],
    "totalMovies": 2,
    "yearRange": "2002 - 2006",
    "totalVotes": 696
  },
  {
    "id": 1560779,
    "name": "Batman: Knightfall",
    "fullName": "Batman: Knightfall Collection",
    "poster_path": "/4Le8pklmaVkwiVkLkroazlAnrRl.jpg",
    "backdrop_path": "/caBIySpwuFi2i7ynvHIlnxJLOdN.jpg",
    "overview": "",
    "partIds": [
      1560520,
      1389765,
      1389764
    ],
    "totalMovies": 3,
    "yearRange": "2026",
    "totalVotes": 459
  },
  {
    "id": 752937,
    "name": "LEGO Marvel Super Heroes",
    "fullName": "LEGO Marvel Super Heroes Collection",
    "poster_path": "/fRIBCOHPhXraUOlv9wTjSaLSr8x.jpg",
    "backdrop_path": "/FQETJbf4a1btUAW1qlYRvu8Tho.jpg",
    "overview": "",
    "partIds": [
      368304,
      622230,
      899249,
      940543,
      1154598,
      1359227
    ],
    "totalMovies": 6,
    "yearRange": "2015 - 2024",
    "totalVotes": 549
  },
  {
    "id": 508128,
    "name": "After Porn Ends",
    "fullName": "After Porn Ends Colección",
    "poster_path": "/lH5JGgVjsUQb2x0ohyfZKB3Ljv.jpg",
    "backdrop_path": "/iAE6lQREvV4WngbNJzA94GSO8FE.jpg",
    "overview": "Una exploración de la vida fuera de la pantalla de los mejores intérpretes pornográficos y documenta sus transiciones y aspectos posteriores a una carrera en la industria de la pornografía.",
    "partIds": [
      109520,
      440249,
      557635
    ],
    "totalMovies": 3,
    "yearRange": "2012 - 2018",
    "totalVotes": 667
  },
  {
    "id": 377545,
    "name": "Samurai Trilogy (Yoji Yamada)",
    "fullName": "Samurai Trilogy (Yoji Yamada)",
    "poster_path": "/l588nUE5PaKVrUVxQ7qQ6v3ML3s.jpg",
    "backdrop_path": "/jrIvIHBZqlEX0MS4LduOzACXEko.jpg",
    "overview": "",
    "partIds": [
      12496,
      34019,
      20527
    ],
    "totalMovies": 3,
    "yearRange": "2002 - 2006",
    "totalVotes": 609
  },
  {
    "id": 421084,
    "name": "Recess",
    "fullName": "Recess Collection",
    "poster_path": "/dfRaJSQeNRi96K4sSeAFjF9CIeu.jpg",
    "backdrop_path": "/9xORo9uB6etW6yuCTpcDP1iKwjJ.jpg",
    "overview": "",
    "partIds": [
      19405,
      77518,
      84331,
      405894
    ],
    "totalMovies": 4,
    "yearRange": "2001 - 2003",
    "totalVotes": 580
  },
  {
    "id": 141290,
    "name": "El Señor de los Anillos (Animado)",
    "fullName": "El Señor de los Anillos (Animado) - Colección",
    "poster_path": "/yLzL7Pv4ZAJ81QD6esn0AqdNgzr.jpg",
    "backdrop_path": "/8rKJzqBVUbcshKROW4pamVSt1UO.jpg",
    "overview": "",
    "partIds": [
      1362,
      1361
    ],
    "totalMovies": 2,
    "yearRange": "1977 - 1980",
    "totalVotes": 611
  },
  {
    "id": 138965,
    "name": "La momia (Hammer)",
    "fullName": "La momia (Hammer) - Colección",
    "poster_path": "/af1bhgDimwzySCGV6tPz2aZJagR.jpg",
    "backdrop_path": "/iLmCaLaw9Tn8JeFtUbhlaNVFcga.jpg",
    "overview": "",
    "partIds": [
      18990,
      39044,
      39262,
      39263
    ],
    "totalMovies": 4,
    "yearRange": "1959 - 1971",
    "totalVotes": 548
  },
  {
    "id": 869205,
    "name": "Scooby-Doo! and WWE",
    "fullName": "Scooby-Doo! and WWE Collection",
    "poster_path": "/2jsbRse8pMSjq6XJksi6uekfxZz.jpg",
    "backdrop_path": "/jlHQyiqUtADbhj9DwJZbvT37mbv.jpg",
    "overview": "",
    "partIds": [
      258893,
      409122
    ],
    "totalMovies": 2,
    "yearRange": "2014 - 2016",
    "totalVotes": 554
  },
  {
    "id": 1346407,
    "name": "Garfield TV Specials",
    "fullName": "Garfield TV Specials Collection",
    "poster_path": "/bsmCuZGiKNJmAjuEHXtEGRLLW6Z.jpg",
    "backdrop_path": "/tE6ohIkqVJAqvfuu9s3adxCDH7t.jpg",
    "overview": "",
    "partIds": [
      29131,
      14307,
      64169,
      15718,
      64170,
      64154,
      13246,
      64152,
      64168,
      44840,
      64148,
      37297
    ],
    "totalMovies": 12,
    "yearRange": "1982 - 1991",
    "totalVotes": 467
  },
  {
    "id": 1669786,
    "name": "Behind the Mask",
    "fullName": "Behind the Mask Collection",
    "poster_path": "/pFw48M1OzUw8kF9OjDal6aPITwp.jpg",
    "backdrop_path": "/xJStAb7MXXJRK5JzMVQ6eBmtsWL.jpg",
    "overview": "",
    "partIds": [
      10961,
      1667221
    ],
    "totalMovies": 2,
    "yearRange": "2006",
    "totalVotes": 532
  },
  {
    "id": 626517,
    "name": "Batman (Adam West) Animación",
    "fullName": "Batman (Adam West) Animación - Colección",
    "poster_path": "/6iXSL4m8s0dEJ88grAJIZ7Ynb0a.jpg",
    "backdrop_path": "/cqTHdZABOzqQq0dT2hbc9h6MAT4.jpg",
    "overview": "",
    "partIds": [
      411736,
      464882
    ],
    "totalMovies": 2,
    "yearRange": "2016 - 2017",
    "totalVotes": 510
  },
  {
    "id": 870234,
    "name": "Megalodon",
    "fullName": "Megalodon Collection",
    "poster_path": "/b2AWdS2v7wNXfTIIdvln2h82R4M.jpg",
    "backdrop_path": "/gAmLgeWt5UHgxySPaVlcCmfQkF5.jpg",
    "overview": "",
    "partIds": [
      523931,
      866462,
      1165918
    ],
    "totalMovies": 3,
    "yearRange": "2018 - 2023",
    "totalVotes": 500
  },
  {
    "id": 102452,
    "name": "Samurái",
    "fullName": "Samurái - Colección",
    "poster_path": "/qE3kqo15ESURwFDJlLbJm1IYYCk.jpg",
    "backdrop_path": "/rFvYK23H1Pz2X49uGHf9CRbsUg0.jpg",
    "overview": "",
    "partIds": [
      31372,
      31374,
      31378
    ],
    "totalMovies": 3,
    "yearRange": "1954 - 1956",
    "totalVotes": 509
  },
  {
    "id": 168545,
    "name": "La resurrección del mal",
    "fullName": "La resurrección del mal - Colección",
    "poster_path": "/wsKdqBC1C5kFTcUWP1TK6QDrBgY.jpg",
    "backdrop_path": "/uDTb04NC2UY3a6QEDZIG4Mhh6f2.jpg",
    "overview": "",
    "partIds": [
      27769,
      27770,
      27771
    ],
    "totalMovies": 3,
    "yearRange": "1991 - 1998",
    "totalVotes": 480
  },
  {
    "id": 356688,
    "name": "Batman sin límites",
    "fullName": "Batman sin límites - Colección",
    "poster_path": "/kbRFPlkkZn0IqMXNDR4WSf5gato.jpg",
    "backdrop_path": "/ugtOFW02bhGNLh279Jb3HbSDthG.jpg",
    "overview": "",
    "partIds": [
      327418,
      342917,
      411802
    ],
    "totalMovies": 3,
    "yearRange": "2015 - 2016",
    "totalVotes": 448
  },
  {
    "id": 1564492,
    "name": "Psycho Pass",
    "fullName": "Psycho Pass Collection",
    "poster_path": "/gs3rYrRXHWFQSQ7pKNTMqYSuCPD.jpg",
    "backdrop_path": "/hsBtY1XkNe6HwHodnAUZiNfo1vz.jpg",
    "overview": "",
    "partIds": [
      296917,
      655431,
      1012652
    ],
    "totalMovies": 3,
    "yearRange": "2015 - 2023",
    "totalVotes": 415
  },
  {
    "id": 537236,
    "name": "Lego Scooby-Doo!",
    "fullName": "Lego Scooby-Doo! - Colección",
    "poster_path": "/8hFzBFz9g3Z3e4dvgt7BYehd4cw.jpg",
    "backdrop_path": "/lZsBFU27kmiEQ0kc7xHXtAVyQ77.jpg",
    "overview": "",
    "partIds": [
      392536,
      461054
    ],
    "totalMovies": 2,
    "yearRange": "2016 - 2017",
    "totalVotes": 432
  },
  {
    "id": 1215164,
    "name": "Kill 'em All",
    "fullName": "Kill 'em All Collection",
    "poster_path": "/uzqinhNWw7EVnw4qxfWxnPJjvpB.jpg",
    "backdrop_path": "/70ViBnsgw0jpOia7vFEVYgY22o7.jpg",
    "overview": "",
    "partIds": [
      449503,
      1215162
    ],
    "totalMovies": 2,
    "yearRange": "2017 - 2024",
    "totalVotes": 380
  },
  {
    "id": 302331,
    "name": "LEGO Star Wars",
    "fullName": "LEGO Star Wars Collection",
    "poster_path": "/tvrp1C3qitWyGeZeGgtOwnJuumQ.jpg",
    "backdrop_path": "/zU0W0VRF0ZkN8CvjW4LGw0oSyTa.jpg",
    "overview": "",
    "partIds": [
      81234,
      81233,
      79158,
      70608,
      136406
    ],
    "totalMovies": 5,
    "yearRange": "2005 - 2012",
    "totalVotes": 406
  },
  {
    "id": 256297,
    "name": "El Monstruo Esta Vivo",
    "fullName": "El Monstruo Esta Vivo - Colección",
    "poster_path": "/xYFGnBPDGZj222c5Y7hodp9gkO.jpg",
    "backdrop_path": "/gW3yL8p6HfvlHr3chruaByYLXla.jpg",
    "overview": "It's Alive es una película de terror estadounidense de 1974 escrita, producida y dirigida por Larry Cohen. En la película, el niño pequeño de una pareja resulta ser un monstruo mutante vicioso que mata cuando está asustado. Los talentos notables involucrados en la película fueron Bernard Herrmann, quien compuso la partitura (conocida por su trabajo en muchas películas de Alfred Hitchcock) y Rick Baker por sus efectos de maquillaje y títeres. La película fue seguida por dos secuelas, It Lives Again (1978) y It's Alive III: Island of the Alive (1987) y un remake, It's Alive (2008).",
    "partIds": [
      28153,
      28155,
      49684
    ],
    "totalMovies": 3,
    "yearRange": "1974 - 1987",
    "totalVotes": 405
  },
  {
    "id": 1793488,
    "name": "Singham",
    "fullName": "Singham Collection",
    "poster_path": "/hwfGRzBb8XQz0be2FyiBLLRmiMc.jpg",
    "backdrop_path": "/p6kIGpjD6M2nURN53qbqJJwJX79.jpg",
    "overview": "",
    "partIds": [
      70590,
      285803,
      1014214
    ],
    "totalMovies": 3,
    "yearRange": "2011 - 2024",
    "totalVotes": 381
  },
  {
    "id": 123203,
    "name": "Hellboy (Animated)",
    "fullName": "Hellboy (Animated) Collection",
    "poster_path": "/xb7CnlGTi8rAGnTGA4pqaaRzc9O.jpg",
    "backdrop_path": "/v0zsDCbWF3XiyzClTiHbLhIAmbt.jpg",
    "overview": "",
    "partIds": [
      16774,
      13204,
      154207,
      789978
    ],
    "totalMovies": 4,
    "yearRange": "2006 - 2010",
    "totalVotes": 372
  },
  {
    "id": 404770,
    "name": "Superman (Universo Animado DC)",
    "fullName": "Superman (Universo Animado DC) - Colección",
    "poster_path": "/ivPaMXENunntvDUTqmlpT6VsSkt.jpg",
    "backdrop_path": "/em1erKQ3IC74mAKrZsCClZsNvk.jpg",
    "overview": "",
    "partIds": [
      49076,
      17074
    ],
    "totalMovies": 2,
    "yearRange": "1996 - 1997",
    "totalVotes": 367
  },
  {
    "id": 277739,
    "name": "Heaven, Hell and Purgatory",
    "fullName": "Heaven, Hell and Purgatory Collection",
    "poster_path": "/eh25dgIOQWjhNsrMsGddkeOgZv2.jpg",
    "backdrop_path": "/vo0uxdmb7oWcXF36GldG8NMJEod.jpg",
    "overview": "",
    "partIds": [
      10575,
      17960,
      277730
    ],
    "totalMovies": 3,
    "yearRange": "2002 - 2007",
    "totalVotes": 358
  },
  {
    "id": 205860,
    "name": "La máscara negra",
    "fullName": "La máscara negra - Colección",
    "poster_path": "/8MN6EfsqoNci5DhxDiTkFqtl7f0.jpg",
    "backdrop_path": "/bHeNjLRJGuQjDXD5CzJzFm6aQF2.jpg",
    "overview": "",
    "partIds": [
      9460,
      49516
    ],
    "totalMovies": 2,
    "yearRange": "1996 - 2002",
    "totalVotes": 360
  },
  {
    "id": 336557,
    "name": "The Ouija Experiment",
    "fullName": "The Ouija Experiment Collection",
    "poster_path": "/3WIrP6cLfIa91CVxv94NyohvIAj.jpg",
    "backdrop_path": "/lqITQjcNVnrGCaFh6g6JbVU5C9j.jpg",
    "overview": "",
    "partIds": [
      207475,
      309063,
      431392,
      842715
    ],
    "totalMovies": 4,
    "yearRange": "2011 - 2021",
    "totalVotes": 357
  },
  {
    "id": 777106,
    "name": "X-Rated",
    "fullName": "X-Rated Collection",
    "poster_path": "/clOk8IaXI0qZtYs4SM6eWSvY4Zi.jpg",
    "backdrop_path": "/3gw6ZMxVbfOQcQahGsmwdvFJPOa.jpg",
    "overview": "",
    "partIds": [
      324558,
      427719
    ],
    "totalMovies": 2,
    "yearRange": "2015 - 2016",
    "totalVotes": 305
  },
  {
    "id": 373918,
    "name": "Garfield Direct-to-Video Features",
    "fullName": "Garfield Direct-to-Video Features Collection",
    "poster_path": "/fbz7JqZosfht2otfvmOklCkRtsx.jpg",
    "backdrop_path": "/otxv1Y3eSC2teENH138MEErcmUr.jpg",
    "overview": "",
    "partIds": [
      16460,
      26728,
      19508
    ],
    "totalMovies": 3,
    "yearRange": "2007 - 2009",
    "totalVotes": 316
  },
  {
    "id": 1390673,
    "name": "검은 사제들 시리즈",
    "fullName": "검은 사제들 시리즈",
    "poster_path": "/qcEGpHPMfGByBAHNoYJCeOAtxy5.jpg",
    "backdrop_path": "/woz3cl1L87MsYPOLKehPVkS0FTM.jpg",
    "overview": "",
    "partIds": [
      360551,
      1224993
    ],
    "totalMovies": 2,
    "yearRange": "2015 - 2025",
    "totalVotes": 246
  },
  {
    "id": 502828,
    "name": "Samurai Cop",
    "fullName": "Samurai Cop Collection",
    "poster_path": "/le7IHBUA2DGXfOMzw55wL5VnD94.jpg",
    "backdrop_path": "/wdV758LgH014H1771ik2NCxzQDe.jpg",
    "overview": "",
    "partIds": [
      65374,
      284460
    ],
    "totalMovies": 2,
    "yearRange": "1991 - 2015",
    "totalVotes": 303
  },
  {
    "id": 559564,
    "name": "Psycho-Pass: Sinners of the System",
    "fullName": "Psycho-Pass: Sinners of the System - Colección",
    "poster_path": "/fTSs5t0rhUfZqlHv86HeyzrTpRL.jpg",
    "backdrop_path": "/b3V6KySGWXjOQP7HlTRoDW1etMl.jpg",
    "overview": "",
    "partIds": [
      510242,
      559562,
      559566
    ],
    "totalMovies": 3,
    "yearRange": "2019",
    "totalVotes": 273
  },
  {
    "id": 1285493,
    "name": "It Came from Outer Space",
    "fullName": "It Came from Outer Space Collection",
    "poster_path": "/eBptQp99cmbffdcH6atn8BHfGJ4.jpg",
    "backdrop_path": "/o48bwxACaXDruAB8Gh7d4CRirH5.jpg",
    "overview": "",
    "partIds": [
      19483,
      212306
    ],
    "totalMovies": 2,
    "yearRange": "1953 - 1995",
    "totalVotes": 274
  },
  {
    "id": 588465,
    "name": "Afro Samurai",
    "fullName": "Afro Samurai Collection",
    "poster_path": "/tY7TgRkd6oTNHcpNOhiOfEmfV7w.jpg",
    "backdrop_path": "/52u5RodXepxUx923VHLfhfCOP25.jpg",
    "overview": "",
    "partIds": [
      1644970,
      515056,
      14711
    ],
    "totalMovies": 3,
    "yearRange": "2007 - 2009",
    "totalVotes": 252
  },
  {
    "id": 1681981,
    "name": "American Poltergeist",
    "fullName": "American Poltergeist Collection",
    "poster_path": "/h7oUD4v5qUmVxx8C6y6jmLiFhGn.jpg",
    "backdrop_path": "/b0U2Bd5QJytSf1vTDBtgUpgQKXn.jpg",
    "overview": "",
    "partIds": [
      345931,
      345692,
      339345,
      396508,
      416572,
      295339,
      434576
    ],
    "totalMovies": 7,
    "yearRange": "2015 - 2017",
    "totalVotes": 239
  },
  {
    "id": 1015410,
    "name": "Under Wraps",
    "fullName": "Under Wraps Collection",
    "poster_path": "/cofZA3BCipv2d5qh7KqklltcvMp.jpg",
    "backdrop_path": "/9FwycuNgaXaDmXHv8HV0CUy6Tsh.jpg",
    "overview": "",
    "partIds": [
      763873,
      936061
    ],
    "totalMovies": 2,
    "yearRange": "2021 - 2022",
    "totalVotes": 169
  },
  {
    "id": 1007218,
    "name": "A Kid in...",
    "fullName": "A Kid in... Collection",
    "poster_path": "/5htXLJhnsvFRlHR68jhPQsQEP6Z.jpg",
    "backdrop_path": "/zI4hfQRvY7QrzHHrh4p1GKrK9YQ.jpg",
    "overview": "",
    "partIds": [
      37108,
      22162
    ],
    "totalMovies": 2,
    "yearRange": "1995 - 1997",
    "totalVotes": 234
  },
  {
    "id": 762946,
    "name": "Big Trip",
    "fullName": "Big Trip - Colección",
    "poster_path": "/fWWQNtvs4Twvta2TKdz9sJ41nJI.jpg",
    "backdrop_path": "/bTtJGaWAmvaKrEb5aBTCCdLf1hZ.jpg",
    "overview": "",
    "partIds": [
      533715,
      599019,
      1239870
    ],
    "totalMovies": 3,
    "yearRange": "2019 - 2024",
    "totalVotes": 192
  },
  {
    "id": 561978,
    "name": "Raiders",
    "fullName": "Raiders Collection",
    "poster_path": "/vLEtg2H1N7J3SCni0ON1xxmi9Mk.jpg",
    "backdrop_path": "/bZxVifVhDmrjp0kDHrvvuFkSA6k.jpg",
    "overview": "",
    "partIds": [
      45438,
      10265,
      420644
    ],
    "totalMovies": 3,
    "yearRange": "2000 - 2018",
    "totalVotes": 191
  },
  {
    "id": 1408738,
    "name": "As It Is In Heaven -",
    "fullName": "As It Is In Heaven - Collection",
    "poster_path": "/gvIqNZ7tLCLkYq40rVStyfTIOPm.jpg",
    "backdrop_path": "/1MUfnjzUBTTEEZKaWWmIruh03Ke.jpg",
    "overview": "",
    "partIds": [
      464,
      356186
    ],
    "totalMovies": 2,
    "yearRange": "2004 - 2015",
    "totalVotes": 215
  },
  {
    "id": 1397777,
    "name": "Raid",
    "fullName": "Raid Collection",
    "poster_path": "/aUN0CI9x7CtIUwEcNkQri3iwmGw.jpg",
    "backdrop_path": "/mGejBcQ1XpNF14xipiss1AuZvJc.jpg",
    "overview": "",
    "partIds": [
      503838,
      1227128
    ],
    "totalMovies": 2,
    "yearRange": "2018 - 2025",
    "totalVotes": 203
  },
  {
    "id": 1150569,
    "name": "Justice League x RWBY",
    "fullName": "Justice League x RWBY Collection",
    "poster_path": "/n85hUWYN0kzYITamBqsJSXoen0G.jpg",
    "backdrop_path": "/umAKpJx87AcY9LqBFc5ZqCS3c1M.jpg",
    "overview": "",
    "partIds": [
      997776,
      1150537
    ],
    "totalMovies": 2,
    "yearRange": "2023",
    "totalVotes": 191
  },
  {
    "id": 343944,
    "name": "Singam",
    "fullName": "Singam Collection",
    "poster_path": "/7isYRjihnU2JJ0XkGxf2HLvkFko.jpg",
    "backdrop_path": "/rQR3f4d0Ix9eT0ecekJBKmE0OVC.jpg",
    "overview": "",
    "partIds": [
      62756,
      191735,
      376440
    ],
    "totalMovies": 3,
    "yearRange": "2010 - 2017",
    "totalVotes": 196
  },
  {
    "id": 506229,
    "name": "G.I. Joe",
    "fullName": "G.I. Joe Collection",
    "poster_path": "/dUh40scwMOMIcd8LxddXQDdZvEn.jpg",
    "backdrop_path": "/lePGleDiJxMGFy5Ktj7Kw0Iyi5n.jpg",
    "overview": "",
    "partIds": [
      506215,
      400101,
      1233867,
      458932,
      17421
    ],
    "totalMovies": 5,
    "yearRange": "1983 - 1987",
    "totalVotes": 174
  },
  {
    "id": 125577,
    "name": "The Smurfs (Animated)",
    "fullName": "The Smurfs (Animated) Collection",
    "poster_path": "/b6dko3ZS0y97Wqg0jGQnFU3vtBy.jpg",
    "backdrop_path": "/45T9LZP05KxEmII4PgSBksAOOfE.jpg",
    "overview": "",
    "partIds": [
      53566,
      49240,
      49045,
      217333
    ],
    "totalMovies": 4,
    "yearRange": "1975 - 1987",
    "totalVotes": 161
  },
  {
    "id": 986568,
    "name": "Top Gunner",
    "fullName": "Top Gunner Collection",
    "poster_path": "/oyWn2MmlbuOmn3hgPKqpKjxNUaG.jpg",
    "backdrop_path": "/b23sanIn3GO2pHF2OoYlH48ILa3.jpg",
    "overview": "",
    "partIds": [
      714351,
      980083,
      1172902
    ],
    "totalMovies": 3,
    "yearRange": "2020 - 2023",
    "totalVotes": 164
  },
  {
    "id": 505857,
    "name": "La Maldición Roja",
    "fullName": "La Maldición Roja - Colección",
    "poster_path": "/mC6qRCT0GjgZ3av3VEEowDzG9V0.jpg",
    "backdrop_path": "/nM70LbBzZXMFFHsQ9Rq1QkKlK4o.jpg",
    "overview": "",
    "partIds": [
      375170,
      472746,
      565428
    ],
    "totalMovies": 3,
    "yearRange": "2015 - 2018",
    "totalVotes": 169
  },
  {
    "id": 607355,
    "name": "Doctor X",
    "fullName": "Doctor X Collection",
    "poster_path": "/ddA44nB4uKLKi001mHr4xxi2aOF.jpg",
    "backdrop_path": "/azpH1aIA9Oz7ljJ7rFup3vTKNQM.jpg",
    "overview": "",
    "partIds": [
      3574,
      3575
    ],
    "totalMovies": 2,
    "yearRange": "1932 - 1939",
    "totalVotes": 150
  }
];
