const WIDTH = 76;
const r = (s) => s.padEnd(WIDTH, " ");

// Level 1 - Gentle intro with two heights and spaced coins
export const level1 = {
  id: 0,
  name: "Nivell 1: The Awakening",
  map: [
    // Sky
    r(""),
    r(""),
    r(
      "                                                                  $  $  $                                                    "
    ),
    r(
      "                                                                                                                             "
    ),
    r(
      "                                                                #######                                                      "
    ),
    // Upper Deck
    r(
      "                  $   $                                                                      $                               "
    ),
    r(
      "                                                                                           g                                 "
    ),
    r(
      "                #########      ####                                                      #####             $   $             "
    ),
    // Mid-Air
    r(
      "                                                                                                                             "
    ),
    r(
      "                                            $  $                                                                             "
    ),
    r(
      "      $                                                                                                 =======              "
    ),
    // Ground Level & Floating Bridges
    r(
      "                                          ========      ####                                          ==       ==            "
    ),
    r(
      "                                                                         $    $    $                ==           ==      $   "
    ),
    // Row 13: Player spawn row (one row higher)
    r(
      " @                                                 g               g             f      g      ==               ==        "
    ),
    // Row 14: Ground level with flags and enemies
    r(
      "      f      g     =  =     f      g    ==========  ======          ==========================  ==                   ==      "
    ),
    r(
      "==================      ================                                                      ==                       ==   ^"
    ),
    r(
      "==================      ================                                                      ==                       ======"
    ),
  ],
  welcomeMessage: {
    title: "Benvingut/da a Gaia!",
    text: "Mou-te amb els teus dits a la pantalla. \n Salta deslitzant amunt. \n Fes servir el DASH amb un swipe horitzontal.\n Recolleix fulls per augmentar la teva puntuació.",
  },
  sprites: [
    "gaia_still",
    "steel",
    "grass",
    "coin",
    "ghosty",
    "portal",
    "flag1",
  ],
};
