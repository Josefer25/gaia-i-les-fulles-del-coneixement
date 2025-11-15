import kaplay from "kaplay";

// --- Configuració del Joc (Mantenim el 9:16 vertical) ---
const GAME_WIDTH = 720;
const GAME_HEIGHT = 1280;

const k = kaplay({
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  letterbox: true,
  scale: 1,
});

// --- Càrrega de Sprites (Sense canvis) ---
k.loadSprite("bean", "/sprites/bean.png");
k.loadSprite("steel", "/sprites/steel.png");
k.loadSprite("grass", "/sprites/grass.png");
k.loadSprite("coin", "/sprites/coin.png");
k.loadSprite("ghosty", "/sprites/ghosty.png");
k.loadSprite("portal", "sprites/portal.png");
k.loadSprite("bg1", "/sprites/1.png");
k.loadSprite("bg2", "/sprites/2.png");
k.loadSprite("bg3", "/sprites/3.png");
k.loadSprite("bg4", "/sprites/4.png");
k.loadSprite("bg5", "/sprites/5.png");

// --- Variables (Sense canvis) ---
const SPEED = 480;
k.setGravity(2400);

// --- Lògica de Fons Parallax (GRAN CANVI ACÍ) ---
const layers = [
  { speed: 0.1, sprite: "bg1", z: -50 },
  { speed: 0.2, sprite: "bg2", z: -40 },
  { speed: 0.4, sprite: "bg3", z: -30 },
  { speed: 0.6, sprite: "bg4", z: -20 },
  { speed: 0.8, sprite: "bg5", z: -10 },
];

const parallaxLayers = [];

k.onLoad(() => {
  // Obtenim la informació de la imatge de fons
  // (Assumim que totes les capes de fons tenen la mateixa mida)
  const bgSpriteData = k.getSprite(layers[0].sprite).data;

  // --- NOU CANVI: Càlcul de l'escala "Cover" ---
  // Calculem quant hem d'escalar en ample i alt per a omplir
  const scaleX = GAME_WIDTH / bgSpriteData.width;
  const scaleY = GAME_HEIGHT / bgSpriteData.height;

  // Triem l'escala MÉS GRAN per a assegurar que cobrim tot
  const scale = Math.max(scaleX, scaleY);

  // Calculem l'ample real de la imatge un colp escalada
  const scaledWidth = bgSpriteData.width * scale;
  // --- FI DEL NOU CANVI ---

  layers.forEach((layerDef) => {
    const layerContainer = k.add([k.pos(0, 0), k.fixed(), k.z(layerDef.z)]);

    // Afegim la Part 1
    layerContainer.add([
      k.sprite(layerDef.sprite),
      k.pos(0, 0),
      k.anchor("topleft"),
      k.scale(scale), // <-- NOU CANVI: Usem k.scale() en lloc de width/height
    ]);

    // Afegim la Part 2
    layerContainer.add([
      k.sprite(layerDef.sprite),
      k.pos(scaledWidth, 0), // <-- NOU CANVI: Usem el nou ample escalat
      k.anchor("topleft"),
      k.scale(scale), // <-- NOU CANVI: Usem k.scale()
    ]);

    parallaxLayers.push({
      speed: layerDef.speed,
      container: layerContainer,
      scaledWidth: scaledWidth, // <-- NOU CANVI: Guardem el nou ample
    });
  });
});
// --- Nivell (Disseny estil "Mario") ---
const level = k.addLevel(
  [
    // El mapa ara té un pis principal (a baix de tot) amb sots,
    // i plataformes puntuals a sobre per a les monedes i enemics.
    "                                                                                                                                  ", // 1
    "                                                                                                                                  ", // 2
    "                                                                                                                                  ", // 3
    "                                                                                                                                  ", // 4
    "                                                                                                                                  ", // 5
    "                                                                                                                                  ", // 6
    "                                                                                                                                  ", // 7
    "                                                                       $$$                                                        ", // 8 (Monedes altes)
    "                                                                      #####                                                       ", // 9 (Blocs alts)
    "                                                                                                                                  ", // 10
    "                                                                                                                                  ", // 11
    "                                    g                                                                                             ", // 12
    "                              ==============                                                                                      ", // 13 (Plataforma alta)
    "                                                                                                                                  ", // 14
    "                                                                              g                                                   ", // 15
    "                                                                        ===========                                               ", // 16
    "                                                                                                                                  ", // 17
    "                                                                                                  $$$$$$                        ", // 18 (Grup de monedes)
    "                                                                                                 ########                       ", // 19 (Grup de blocs)
    "                    $$                                                                                                          ", // 20
    "                   ####                                                                                g                          ", // 21 (Blocs baixos)
    "                                                                                                                            ^     ", // 22 (Meta!)
    "    @                                     g                                                         =======                 ======", // 23 (Inici i plataforma final)
    "=======================     ===========================     ================    g    ========================     ===================", // 24 (SÒL PRINCIPAL amb SOTS)
    "=======================     ===========================     ================   ===   ========================     ===================", // 25 (Base sòlida)
  ],
  {
    // ... (la teua definició de 'tiles') ...
    tileWidth: 64,
    tileHeight: 64,
    tiles: {
      "@": () => [
        k.sprite("bean"),
        k.area(),
        k.body(),
        k.anchor("bot"),
        k.z(2),
        "player",
      ],
      "=": () => [
        k.sprite("grass"),
        k.area(),
        k.body({ isStatic: true }),
        k.anchor("bot"),
        "wall",
      ],
      "#": () => [
        k.sprite("steel"),
        k.area(),
        k.body({ isStatic: true }),
        k.anchor("bot"),
        "wall",
      ],
      $: () => [k.sprite("coin"), k.area(), k.anchor("center"), k.z(1), "coin"],
      g: () => [
        k.sprite("ghosty"),
        k.pos(),
        k.area(),
        k.anchor("bot"),
        k.z(1),
        "enemy",
      ],
      // --- NOU TILE PER A LA META ---
      // (Pots canviar "portal" pel nom del teu sprite de meta)
      "^": () => [
        k.sprite("portal"), // Assegura't de tenir un sprite anomenat "portal"
        k.area(),
        k.anchor("bot"),
        k.z(1),
        "portal", // Una etiqueta per a la col·lisió
      ],
    },
  }
);

// --- Lògica del Joc ---
const player = level.get("player")[0];
const startPos = player.pos.clone();

// --- Custom Patrol System amb Tweening (com a main.js) ---
function customPatrol(waypoints, speed) {
  return {
    id: "customPatrol",
    waypoints: waypoints,
    speed: speed,
    currentTargetIndex: 1,
  };
}

function startPatrolLeg(enemy) {
  const { waypoints, speed, currentTargetIndex } = enemy;

  const targetPos = waypoints[currentTargetIndex];

  const distance = enemy.pos.dist(targetPos);
  const duration = distance / enemy.speed;

  k.tween(
    enemy.pos,
    targetPos,
    duration,
    (newPos) => (enemy.pos = newPos),
    k.easings.linear
  ).onEnd(() => {
    // Ping-pong: flip index between 0 and 1
    enemy.currentTargetIndex = currentTargetIndex === 0 ? 1 : 0;
    startPatrolLeg(enemy);
  });
}

// Setup patrol per a cada enemic
k.wait(0, () => {
  const enemies = level.get("enemy");
  enemies.forEach((enemy) => {
    const startX = enemy.pos.x;
    const startY = enemy.pos.y;
    const patrolDist = 200;

    // Waypoints: esquerra i dreta
    const waypoints = [
      k.vec2(startX - patrolDist, startY),
      k.vec2(startX + patrolDist, startY),
    ];

    // Afegir customPatrol component
    Object.assign(enemy, customPatrol(waypoints, 100));

    // Iniciar patrulla
    startPatrolLeg(enemy);
  });
});

// --- Pantalla de Benvinguda ---
let welcomeScreen = null;

function showWelcomeScreen() {
  // Fons semi-transparent
  const bg = k.add([
    k.rect(GAME_WIDTH, GAME_HEIGHT),
    k.color(0, 0, 0, 200), // Negre semi-transparent
    k.pos(0, 0),
    k.area(), // Necessari per a onClick
    k.fixed(),
    k.z(1000),
    "welcomeBg",
  ]);

  // Contenidor principal
  const container = k.add([
    k.pos(GAME_WIDTH / 2, GAME_HEIGHT / 2),
    k.fixed(),
    k.z(1001),
    k.anchor("center"),
  ]);

  // Panell de contingut
  const panel = container.add([
    k.rect(GAME_WIDTH * 0.9, GAME_HEIGHT * 0.7),
    k.color(255, 255, 255),
    k.anchor("center"),
    k.outline(4, k.color(0, 0, 0)),
  ]);

  // Títol
  container.add([
    k.text("Benvingut!", { size: 64, width: GAME_WIDTH * 0.8 }),
    k.pos(0, -GAME_HEIGHT * 0.25),
    k.anchor("center"),
    k.color(0, 0, 0),
  ]);

  // Text placeholder (pots modificar-ho)
  container.add([
    k.text(
      "Aquest és un text placeholder.\nPots modificar aquest text amb el teu missatge de benvinguda personalitzat.",
      {
        size: 32,
        width: GAME_WIDTH * 0.75,
        align: "center",
      }
    ),
    k.pos(0, 0),
    k.anchor("center"),
    k.color(0, 0, 0),
  ]);

  // Botó de tancar
  const closeBtn = container.add([
    k.rect(200, 80),
    k.color(100, 150, 255),
    k.pos(0, GAME_HEIGHT * 0.2),
    k.anchor("center"),
    k.area(),
    k.outline(3, k.color(0, 0, 0)),
    "closeBtn",
  ]);

  const btnText = closeBtn.add([
    k.text("Tancar", { size: 36 }),
    k.anchor("center"),
    k.color(255, 255, 255),
  ]);

  // Tancar quan es clica el botó
  closeBtn.onClick(() => {
    closeWelcomeScreen();
  });

  // Tancar quan es toca/clica el fons (opcional)
  bg.onClick(() => {
    closeWelcomeScreen();
  });

  welcomeScreen = { bg, container };
}

function closeWelcomeScreen() {
  if (welcomeScreen) {
    welcomeScreen.bg.destroy();
    welcomeScreen.container.destroy();
    welcomeScreen = null;
  }
}

// Mostrar pantalla de benvinguda al iniciar
k.wait(0.1, () => {
  showWelcomeScreen();
});

// UI de Monedes (Sense canvis)
let coinCount = 0;
const coinText = k.add([
  k.text("Fulles: 0", { size: 48 }),
  k.pos(30, 30),
  k.fixed(),
  k.z(100),
]);

// --- Bucle Principal d'Actualització (PETIT CANVI ACÍ) ---
k.onUpdate(() => {
  const camPos = player.worldPos();
  k.setCamPos(camPos);

  // --- NOU: Lògica de Parallax amb 'scaledWidth' ---
  for (const layer of parallaxLayers) {
    const totalMovement = camPos.x * layer.speed;
    // Usem el 'scaledWidth' que hem calculat abans
    const offsetX = totalMovement % layer.scaledWidth; // <-- NOU CANVI

    layer.container.pos.x = -offsetX;
  }
  // --- FI DE LA LÒGICA DE PARALLAX ---

  // Reset si caus (Sense canvis)
  const failThreshold = 2500;
  if (player.pos.y > failThreshold) {
    player.pos = startPos.clone();
    player.vel.x = 0;
    player.vel.y = 0;
  }
});

// Col·lisions (Sense canvis)
player.onCollide("coin", (coin) => {
  coinCount++;
  coinText.text = `Fulles: ${coinCount}`;
  coin.destroy();
});

player.onCollide("enemy", () => {
  player.pos = startPos.clone();
  player.vel.x = 0;
  player.vel.y = 0;
});

// Moviments (Sense canvis)
k.onKeyPress("space", () => {
  if (player.isGrounded()) {
    player.jump(1500);
  }
});

k.onKeyDown("left", () => {
  player.move(-SPEED, 0);
});

k.onKeyDown("right", () => {
  player.move(SPEED, 0);
});
