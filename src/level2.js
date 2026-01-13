const WIDTH = 76;
const r = (s) => s.padEnd(WIDTH, " ");

// Level 2 - Two lanes with gentle gaps and elevated coins
export const level2 = {
  id: 1,
  name: "Nivell 2: Steel Horizons",
  map: [
    r(""),
    r(""),
    // High Road (Roofs) - Requires climbing
    r(
      "                                                               $  $  $                                                       "
    ),
    r(
      "                                                                                                                             "
    ),
    r(
      "                                                            ###########                                                      "
    ),
    r(
      "               $  $                                                                    $    $                                "
    ),
    r(
      "                                                     f                           f                                           "
    ),
    r(
      "           ############        ####                #####                       #####            #######                      "
    ),
    r(
      "                                                                                                          $                  "
    ),
    r(
      "                                         $   $               $   $                       g                f                  "
    ),
    r(
      "                                                                                     #######          ########               "
    ),
    r(
      "                                       #########                                                                             "
    ),
    r(
      " @    $                 f                                                                                       $   $        "
    ),
    r(
      "                     #######                          g                g                                                     "
    ),
    r(
      "           g                           g          ##########       ##########                                 #########      "
    ),
    r(
      "##################            ####################                                ########################  ##         ##   ^"
    ),
    r(
      "##################            ####################                                ########################  ##         ######"
    ),
  ],
  welcomeMessage: {
    title: "La Ciutat d'Acer",
    text: "Vigila els buits!\nDe vegades el camí de dalt és més segur...",
  },
  sprites: [
    "gaia_still",
    "steel",
    "grass",
    "coin",
    "ghosty",
    "portal",
    "flag2",
  ],
};
