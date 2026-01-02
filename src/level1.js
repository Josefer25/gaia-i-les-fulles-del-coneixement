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
    // Row 13: Added the flag 'f' here, so it sits ON TOP of the bridge below
    r(
      "                                                      g               g             f      g      ==               ==        "
    ),
    // Row 14: Removed the floating 'f' from the gap
    r(
      " @    f      g     =  =     f      g    ==========  ======          ==========================  ==                   ==      "
    ),
    r(
      "==================      ================                                                      ==                       ==   ^"
    ),
    r(
      "==================      ================                                                      ==                       ======"
    ),
  ],
  welcomeMessage: {
    title: "Benvingut a Gaia!",
    text: "Moute amb els teus dits a la pantalla. \n Salta deslitzant amunt. \n Fes servir el DASH amb un swipe horitzontal.\n Recolleix fulls per augmentar la teva puntuació.",
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
