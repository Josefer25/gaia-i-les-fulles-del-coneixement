const WIDTH = 76;
const r = (s) => s.padEnd(WIDTH, " ");

// Level 3 - Finale with two-tier flow and spaced rewards
export const level3 = {
  id: 2,
  name: "Nivell 3: Cosmic Void",
  map: [
    r(""),
    r(
      "                                                                 $                                                           "
    ),
    r(
      "                                                                                                                             "
    ),
    r(
      "                                                               =====                                  $   $                  "
    ),
    r(
      "                   $                                                                                                         "
    ),
    r(
      "                                                                                                    =========                "
    ),
    r(
      "                 #####                                  =====              $   $                                             "
    ),
    r(
      "                                                                                                  g           g              "
    ),
    r(
      "                                           $   $                     =================          =================            "
    ),
    r(
      "         $                                                                                                                   "
    ),
    r(
      "                                         =========                                                                     ===   "
    ),
    r(
      "       =====                                                                                                         ==      "
    ),
    r(
      "                                 ===                   g       f                                       $            ==      ^ "
    ),
    r(
      " @                   f         ==                    =====   =====                                              ==      ===="
    ),
    r(
      "=======           =======    ==          =======                       ========      ========        =====     ==      ======"
    ),
    r(
      "=======           =======                                                                                     ==      ======="
    ),
  ],
  welcomeMessage: {
    title: "El Buit Còsmic",
    text: "La gravetat és traïdora ací.\nFes servir el DASH amb un swipe horitzontal per arribar a les illes llunyanes!",
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
