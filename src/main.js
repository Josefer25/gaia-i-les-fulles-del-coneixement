import kaplay from "kaplay";
import { levels } from "./levels.js";
import { createWelcomeScreen } from "./welcomeScreen.js";
import { setupPatrolSystem } from "./patrol.js";

// --- Configuració del Joc ---
const GAME_WIDTH = 720;
const GAME_HEIGHT = 1280;

const k = kaplay({
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  letterbox: true,
  scale: 1,
});

// --- Càrrega de Sprites ---
// Gaia per nivell
k.loadSprite("gaia_l1_still", "/sprites/gaia/l1/still.png");
k.loadSprite("gaia_l1_moving1", "/sprites/gaia/l1/moving1.png");
k.loadSprite("gaia_l1_moving2", "/sprites/gaia/l1/moving2.png");
k.loadSprite("gaia_l2_still", "/sprites/gaia/l2/still.png");
k.loadSprite("gaia_l2_moving1", "/sprites/gaia/l2/moving1.png");
k.loadSprite("gaia_l2_moving2", "/sprites/gaia/l2/moving2.png");
k.loadSprite("gaia_l3_still", "/sprites/gaia/l3/still.png");
k.loadSprite("gaia_l3_moving1", "/sprites/gaia/l3/moving1.png");
k.loadSprite("gaia_l3_moving2", "/sprites/gaia/l3/moving2.png");
k.loadSprite("steel", "/sprites/steel.png");
k.loadSprite("grass", "/sprites/grass.png");
k.loadSprite("coin", "/sprites/llibre.png");
k.loadSprite("ghosty", "/sprites/ghosty.png");
k.loadSprite("portal", "/sprites/portal.png");
k.loadSprite("flag1", "/sprites/flag1.png");
k.loadSprite("flag2", "/sprites/flag2.png");

// Carregar fons de Nature (Nivell 1)
k.loadSprite("nature1", "/sprites/backgrounds/nature/1.png");
k.loadSprite("nature2", "/sprites/backgrounds/nature/2.png");
k.loadSprite("nature3", "/sprites/backgrounds/nature/3.png");
k.loadSprite("nature4", "/sprites/backgrounds/nature/4.png");
k.loadSprite("nature5", "/sprites/backgrounds/nature/5.png");

// Carregar fons de Architecture (Nivell 2)
k.loadSprite("arch1", "/sprites/backgrounds/architecture/1.png");
k.loadSprite("arch2", "/sprites/backgrounds/architecture/2.png");
k.loadSprite("arch3", "/sprites/backgrounds/architecture/3.png");
k.loadSprite("arch4", "/sprites/backgrounds/architecture/4.png");
k.loadSprite("arch5", "/sprites/backgrounds/architecture/5.png");
k.loadSprite("arch6", "/sprites/backgrounds/architecture/6.png");
k.loadSprite("arch7", "/sprites/backgrounds/architecture/7.png");

// Carregar fons de Space (Nivell 3)
k.loadSprite("space1", "/sprites/backgrounds/space/1.png");
k.loadSprite("space2", "/sprites/backgrounds/space/2.png");
k.loadSprite("space3", "/sprites/backgrounds/space/3.png");
k.loadSprite("space4", "/sprites/backgrounds/space/4.png");

// --- Variables Globals ---
const SPEED = 480;
const DASH_SPEED = 1200; // Velocitat del dash (més exagerat)
const DASH_DURATION = 0.2; // Duració del dash en segons (més llarg)
const AIR_FRICTION = 0.92; // Fricció a l'aire (0.92 = redueix 8% cada frame)
const GRAVITY = 2400;
const TOUCH_MOVE_DELAY_MS = 50;
const TOUCH_SWIPE_THRESHOLD = 90;
const TOUCH_GESTURE_RESET_MS = 180;
k.setGravity(GRAVITY);

// --- Sistema de Nivells ---
let currentLevelIndex = 0;
let level = null;
let player = null;
let startPos = null;
let coinCount = 0;
let coinText = null;
let canDash = false; // Si el jugador pot fer dash
let isDashing = false; // Si el jugador està fent dash
let dashDirection = 0; // Direcció del dash (-1 esquerra, 1 dreta, 0 cap avall)
let dashUpdateHandler = null; // Handler per cancel·lar l'actualització del dash
let currentGaiaSprites = {
  still: "gaia_l1_still",
  moving1: "gaia_l1_moving1",
  moving2: "gaia_l1_moving2",
};
const gaiaSpriteSets = [
  {
    still: "gaia_l1_still",
    moving1: "gaia_l1_moving1",
    moving2: "gaia_l1_moving2",
  },
  {
    still: "gaia_l2_still",
    moving1: "gaia_l2_moving1",
    moving2: "gaia_l2_moving2",
  },
  {
    still: "gaia_l3_still",
    moving1: "gaia_l3_moving1",
    moving2: "gaia_l3_moving2",
  },
];
function setGaiaSpriteSet(levelIndex) {
  const idx = Math.min(Math.max(levelIndex, 0), gaiaSpriteSets.length - 1);
  currentGaiaSprites = gaiaSpriteSets[idx];
}

const touchState = {
  id: null,
  startClientX: 0,
  startClientY: 0,
  lastClientX: 0,
  lastClientY: 0,
  moveTimeoutId: null,
  gestureUsed: false,
  gestureResetTimeoutId: null,
};
let isTouchMoving = false;
let touchMoveDirection = 0;

const extraSwipeState = {
  id: null,
  startClientX: 0,
  startClientY: 0,
  lastClientX: 0,
  lastClientY: 0,
  gestureUsed: false,
};

// --- Sistema de Temporitzador ---
let gameTime = 0; // Temps en segons
let isTimerRunning = false; // Si el temporitzador està corrent
let timerText = null; // Text del temporitzador

// --- Parallax Background ---
// Configuracions de parallax per cada nivell
const levelBackgrounds = {
  0: [
    // Nature - Nivell 1
    { speed: 0.05, sprite: "nature1", z: -50 },
    { speed: 0.1, sprite: "nature2", z: -40 },
    { speed: 0.2, sprite: "nature3", z: -30 },
    { speed: 0.35, sprite: "nature4", z: -20 },
    { speed: 0.5, sprite: "nature5", z: -10 },
  ],
  1: [
    // Architecture - Nivell 2
    { speed: 0.03, sprite: "arch1", z: -70 },
    { speed: 0.06, sprite: "arch2", z: -60 },
    { speed: 0.12, sprite: "arch3", z: -50 },
    { speed: 0.2, sprite: "arch4", z: -40 },
    { speed: 0.3, sprite: "arch5", z: -30 },
    { speed: 0.45, sprite: "arch6", z: -20 },
    { speed: 0.6, sprite: "arch7", z: -10 },
  ],
  2: [
    // Space - Nivell 3
    { speed: 0.08, sprite: "space1", z: -40 },
    { speed: 0.15, sprite: "space2", z: -30 },
    { speed: 0.3, sprite: "space3", z: -20 },
    { speed: 0.5, sprite: "space4", z: -10 },
  ],
};

let parallaxLayers = [];

// Funció per crear les capes de parallax
function createParallaxLayers(layers) {
  // Destruir capes anteriors
  parallaxLayers.forEach((layer) => {
    if (layer.container && !layer.container.destroyed) {
      layer.container.destroy();
    }
  });
  parallaxLayers = [];

  if (layers.length === 0) return;

  // Verificar que el sprite existeix abans d'usar-lo
  const firstSprite = k.getSprite(layers[0].sprite);
  if (!firstSprite || !firstSprite.data) {
    k.debug.log(`Warning: Sprite ${layers[0].sprite} not found or not loaded!`);
    return;
  }

  const bgSpriteData = firstSprite.data;
  if (!bgSpriteData.width || !bgSpriteData.height) {
    k.debug.log(`Warning: Sprite ${layers[0].sprite} data invalid!`);
    return;
  }

  const scaleX = GAME_WIDTH / bgSpriteData.width;
  const scaleY = GAME_HEIGHT / bgSpriteData.height;
  const scale = Math.max(scaleX, scaleY);
  const scaledWidth = bgSpriteData.width * scale;

  layers.forEach((layerDef) => {
    // Verificar que cada sprite existeix
    const sprite = k.getSprite(layerDef.sprite);
    if (!sprite || !sprite.data) {
      k.debug.log(
        `Warning: Sprite ${layerDef.sprite} not found or not loaded!`
      );
      return;
    }

    try {
      const layerContainer = k.add([k.pos(0, 0), k.fixed(), k.z(layerDef.z)]);

      layerContainer.add([
        k.sprite(layerDef.sprite),
        k.pos(0, 0),
        k.anchor("topleft"),
        k.scale(scale),
      ]);

      layerContainer.add([
        k.sprite(layerDef.sprite),
        k.pos(scaledWidth, 0),
        k.anchor("topleft"),
        k.scale(scale),
      ]);

      parallaxLayers.push({
        speed: layerDef.speed,
        container: layerContainer,
        scaledWidth: scaledWidth,
      });
    } catch (error) {
      k.debug.log(
        `Error creating parallax layer for ${layerDef.sprite}:`,
        error
      );
    }
  });
}

// --- Welcome Screen System ---
const welcomeScreen = createWelcomeScreen(k, GAME_WIDTH, GAME_HEIGHT);

// --- Patrol System ---
const patrolSystem = setupPatrolSystem(k);

// --- Animació Passiva del Portal (Pols) ---
// Registrar onAdd globalment per capturar portals quan es creen
k.onAdd("portal_anim", (portal) => {
  // Inicialitzar escala i temps
  portal.scale = k.vec2(1, 1);
  portal.pulseTime = 0;

  // Usar onUpdate per animar el pols amb una funció sinusoïdal
  portal.onUpdate(() => {
    portal.pulseTime += k.dt();
    // Oscil·lació entre 1.0 i 1.2 amb una funció sinusoïdal
    const pulseScale = 1.0 + 0.2 * (Math.sin(portal.pulseTime * 2) * 0.5 + 0.5);
    portal.scale = k.vec2(pulseScale, pulseScale);
  });
});

// --- Tile Definitions ---
function getTileDefinitions() {
  return {
    "@": () => [
      k.sprite(currentGaiaSprites.still),
      k.scale(0.25),
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
    $: () => [
      k.sprite("coin"),
      k.scale(0.2),
      k.area(),
      k.anchor("center"),
      k.z(1),
      "coin",
    ],
    g: () => [
      k.sprite("ghosty"),
      k.pos(),
      k.area(),
      k.anchor("bot"),
      k.z(1),
      "enemy",
    ],
    "^": () => [
      k.sprite("portal"),
      k.area(),
      k.anchor("bot"),
      k.z(1),
      "portal",
      "portal_anim", // Etiqueta per a l'animació
    ],
    f: () => [
      k.sprite(Math.random() > 0.5 ? "flag1" : "flag2"),
      k.scale(0.3),
      k.area(),
      k.anchor("bot"),
      k.z(1),
      "flag",
    ],
  };
}

// --- Load Level ---
function loadLevel(levelIndex) {
  // Destroy previous level if exists
  if (level) {
    level.destroy();
  }

  const levelData = levels[levelIndex];
  if (!levelData) {
    k.debug.log("No more levels!");
    return;
  }

  // Set Gaia sprites for this level
  setGaiaSpriteSet(levelIndex);

  // Crear capes de parallax per aquest nivell
  // Esperar que els sprites estiguin carregats
  const backgroundLayers = levelBackgrounds[levelIndex] || levelBackgrounds[0];

  // Funció helper per intentar crear les capes amb retry
  function tryCreateParallax(retries = 10) {
    const firstSprite = k.getSprite(backgroundLayers[0].sprite);
    if (firstSprite && firstSprite.data && firstSprite.data.width) {
      createParallaxLayers(backgroundLayers);
    } else if (retries > 0) {
      k.wait(0.1, () => {
        tryCreateParallax(retries - 1);
      });
    } else {
      k.debug.log(`Failed to load parallax sprites for level ${levelIndex}`);
    }
  }

  tryCreateParallax();

  // Load level-specific sprites if needed
  // (For now, all sprites are loaded at start, but this structure allows level-specific sprites)
  if (levelData.sprites) {
    // Future: Load level-specific sprites here
    // levelData.sprites.forEach(sprite => {
    //   if (!k.getSprite(sprite)) {
    //     k.loadSprite(sprite, `/sprites/${sprite}.png`);
    //   }
    // });
  }

  // Create new level
  level = k.addLevel(levelData.map, {
    tileWidth: 64,
    tileHeight: 64,
    tiles: getTileDefinitions(),
  });

  // Get player and set start position
  player = level.get("player")[0];
  startPos = player.pos.clone();

  // Ensure player has correct scale (make it smaller)
  if (!player.scale || player.scale.x !== 0.25) {
    player.scale = k.vec2(0.25, 0.25);
  }

  // Initialize animation state
  if (!player.animTime) {
    player.animTime = 0;
  }
  if (!player.isMoving) {
    player.isMoving = false;
  }

  // Reset dash ability when level loads
  canDash = false;
  isDashing = false;
  dashDirection = 0;
  if (dashUpdateHandler) {
    dashUpdateHandler.cancel();
    dashUpdateHandler = null;
  }

  // Reset camera position to player position
  currentCamPos = player.worldPos();
  k.camPos(currentCamPos);

  // Setup enemy patrol
  k.wait(0, () => {
    const enemies = level.get("enemy");
    patrolSystem.setupEnemyPatrol(enemies);
  });

  // Setup collisions after level is loaded
  k.wait(0, () => {
    // Variable per evitar que la col·lisió s'activi múltiples cops
    let isTransitioning = false;

    // Portal collision amb animació de transició
    player.onCollide("portal", (portal) => {
      // Si ja estem en transició, no facis res
      if (isTransitioning) return;
      isTransitioning = true;

      // Pausar temporitzador quan es toca el portal
      isTimerRunning = false;

      // 1. ATUREM EL MÓN
      k.setGravity(0); // Atura la gravetat per a tot
      player.use(k.area(false)); // Desactiva les col·lisions del jugador
      player.vel = k.vec2(0, 0); // Atura qualsevol moviment

      // Durada de l'animació (1 segon)
      const animTime = 1.0;

      // 2. ANIMEM EL JUGADOR "CAP A DINS"
      // Calculem el centre del portal
      const portalCenter = k.vec2(
        portal.pos.x,
        portal.pos.y - (portal.sprite?.height || 32) / 2
      );

      // Anima la posició del jugador cap al centre del portal
      k.tween(
        player.pos, // Propietat a animar
        portalCenter, // Destí (centre del portal)
        animTime, // Durada
        (p) => (player.pos = p), // Funció que actualitza la posició
        k.easings.easeInOutSine // Una animació suau
      );

      // Anima l'escala del jugador a 0 (desapareix)
      if (!player.scale) {
        player.scale = k.vec2(1, 1);
      }
      k.tween(
        player.scale,
        k.vec2(0.1, 0.1), // El fem molt petit
        animTime,
        (s) => (player.scale = s),
        k.easings.easeInSine
      );

      // 3. FEM EL FOS A NEGRE (Fade to Black)
      const fadeBox = k.add([
        k.rect(GAME_WIDTH, GAME_HEIGHT), // Un rectangle que ocupa tota la pantalla
        k.color(0, 0, 0), // Color negre
        k.opacity(0), // Comença transparent
        k.z(10000), // Per sobre de tot
        k.fixed(), // Perquè no es mogui amb la càmera
      ]);

      // Animem l'opacitat del negre d'0 a 1
      k.tween(
        0,
        1,
        animTime, // A la mateixa velocitat
        (o) => (fadeBox.opacity = o)
      );

      // 4. CANVIEM DE NIVELL
      // Esperem que acabi l'animació i llavors canviem
      k.wait(animTime + 0.2, () => {
        // Restaurem la gravetat per al proper nivell
        k.setGravity(2400);

        isTransitioning = false; // Reseteja el pany

        // Canviem de nivell
        nextLevel();

        // Fade out del negre i mostrar pantalla de benvinguda
        k.wait(0.2, () => {
          // Fade out del negre
          k.tween(
            1,
            0,
            0.5,
            (o) => (fadeBox.opacity = o),
            k.easings.easeOutSine
          ).onEnd(() => {
            fadeBox.destroy();
          });

          // Mostrar pantalla de benvinguda del nou nivell
          k.wait(0.3, () => {
            const levelData = levels[currentLevelIndex];
            if (levelData) {
              welcomeScreen.show(
                levelData.welcomeMessage.title,
                levelData.welcomeMessage.text,
                () => {
                  // Continuar temporitzador quan es tanca la pantalla
                  isTimerRunning = true;
                }
              );
            }
          });
        });
      });
    });

    // Coin collection
    player.onCollide("coin", (coin) => {
      coinCount++;
      coinText.text = `Fulls: ${coinCount}`;
      coin.destroy();
    });

    // Enemy collision - death
    player.onCollide("enemy", () => {
      player.pos = startPos.clone();
      player.vel.x = 0;
      player.vel.y = 0;
    });
  });

  // Show welcome message for this level (only for first level, others show after transition)
  if (levelIndex === 0) {
    k.wait(0.1, () => {
      // Pausar temporitzador quan es mostra la pantalla
      isTimerRunning = false;
      welcomeScreen.show(
        levelData.welcomeMessage.title,
        levelData.welcomeMessage.text,
        () => {
          // Continuar temporitzador quan es tanca
          isTimerRunning = true;
        }
      );
    });
  }
}

// --- Next Level ---
function nextLevel() {
  currentLevelIndex++;
  if (currentLevelIndex < levels.length) {
    loadLevel(currentLevelIndex);
  } else {
    // Game completed!
    showVictoryScreen();
  }
}

// --- Pantalla de Victòria ---
function showVictoryScreen() {
  // Pausar temporitzador
  isTimerRunning = false;

  // Fons semi-transparent
  const bg = k.add([
    k.rect(GAME_WIDTH, GAME_HEIGHT),
    k.color(0, 0, 0, 200),
    k.pos(0, 0),
    k.area(),
    k.fixed(),
    k.z(2000),
  ]);

  // Contenidor principal
  const container = k.add([
    k.pos(GAME_WIDTH / 2, GAME_HEIGHT / 2),
    k.fixed(),
    k.z(2001),
    k.anchor("center"),
  ]);

  // Panell de contingut
  container.add([
    k.rect(GAME_WIDTH * 0.9, GAME_HEIGHT * 0.8),
    k.color(255, 255, 255),
    k.anchor("center"),
    k.outline(4, k.color(0, 0, 0)),
  ]);

  // Títol
  container.add([
    k.text("Joc Completat!", { size: 72 }),
    k.pos(0, -GAME_HEIGHT * 0.3),
    k.anchor("center"),
    k.color(0, 0, 0),
  ]);

  // Temps
  container.add([
    k.text(`Temps: ${formatTime(gameTime)}`, { size: 48 }),
    k.pos(0, -GAME_HEIGHT * 0.1),
    k.anchor("center"),
    k.color(0, 0, 0),
  ]);

  // Fulles
  container.add([
    k.text(`Fulls: ${coinCount}`, { size: 48 }),
    k.pos(0, GAME_HEIGHT * 0.05),
    k.anchor("center"),
    k.color(0, 0, 0),
  ]);

  // Text de compartir
  container.add([
    k.text("Comparteix el teu resultat:", { size: 32 }),
    k.pos(0, GAME_HEIGHT * 0.2),
    k.anchor("center"),
    k.color(100, 100, 100),
  ]);

  // Dades per compartir
  const shareData = {
    title: "Gaia i els Fulls del Coneixement",
    text: `He completat Gaia i els Fulls del Coneixement en ${formatTime(
      gameTime
    )} amb ${coinCount} fulls! 🍃✨`,
    url: window.location.href, // Comparteix la URL del joc
  };

  // --- LÒGICA DE COMPARTIR ---

  // Detectem si el navegador suporta l'API nativa de compartir (Mòbils/Tablets)
  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    // BOTÓ ÚNIC "COMPARTIR" (Natiu)
    const shareBtn = container.add([
      k.rect(260, 80),
      k.color(50, 200, 50), // Verd
      k.pos(0, GAME_HEIGHT * 0.3),
      k.anchor("center"),
      k.area(),
      k.outline(3, k.color(0, 0, 0)),
    ]);

    shareBtn.add([
      k.text("Compartir", { size: 36 }),
      k.anchor("center"),
      k.color(255, 255, 255),
    ]);

    shareBtn.onClick(async () => {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error compartint:", err);
      }
    });
  } else {
    // FALLBACK PER A PC (Instagram/Twitter Botons separats)
    // Això s'executa si estem a PC on no hi ha menú natiu de compartir

    const encodedText = encodeURIComponent(shareData.text);

    // Botó Instagram
    // NOTA: Instagram web no permet compartir text fàcilment, només obre la web
    const instagramBtn = container.add([
      k.rect(180, 60),
      k.color(225, 48, 108),
      k.pos(-100, GAME_HEIGHT * 0.3),
      k.anchor("center"),
      k.area(),
      k.outline(3, k.color(0, 0, 0)),
    ]);

    instagramBtn.add([
      k.text("Instagram", { size: 28 }),
      k.anchor("center"),
      k.color(255, 255, 255),
    ]);

    instagramBtn.onClick(() => {
      window.open(`https://www.instagram.com/`, "_blank");
    });

    // Botó Twitter/X
    const twitterBtn = container.add([
      k.rect(180, 60),
      k.color(29, 161, 242),
      k.pos(100, GAME_HEIGHT * 0.3),
      k.anchor("center"),
      k.area(),
      k.outline(3, k.color(0, 0, 0)),
    ]);

    twitterBtn.add([
      k.text("Twitter/X", { size: 28 }),
      k.anchor("center"),
      k.color(255, 255, 255),
    ]);

    twitterBtn.onClick(() => {
      const url = `https://twitter.com/intent/tweet?text=${encodedText}`;
      window.open(url, "_blank");
    });
  }

  // Botó per tornar a jugar (Opcional, bona pràctica)
  const replayBtn = container.add([
    k.text("Tornar a jugar", { size: 24 }),
    k.pos(0, GAME_HEIGHT * 0.42),
    k.anchor("center"),
    k.color(0, 0, 0),
    k.area(),
  ]);

  replayBtn.onClick(() => {
    location.reload();
  });
}

// --- Initialize UI ---
coinText = k.add([
  k.text("Fulls: 0", { size: 48 }),
  k.pos(30, 30),
  k.fixed(),
  k.z(100),
]);

// Temporitzador al top right
timerText = k.add([
  k.text("00:00", { size: 48 }),
  k.pos(GAME_WIDTH - 30, 30),
  k.fixed(),
  k.z(100),
  k.anchor("topright"),
]);

// Funció per formatar el temps
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

// --- Smooth Camera Following ---
let currentCamPos = k.vec2(0, 0);

// --- Game Update Loop ---
let wasGrounded = false; // Track previous grounded state
k.onUpdate(() => {
  // Actualitzar temporitzador (sempre, independentment del jugador)
  if (isTimerRunning) {
    gameTime += k.dt();
    if (timerText) {
      timerText.text = formatTime(gameTime);
    }
  }

  if (!player) return;

  // Update animation state
  const isMovingHorizontally =
    Math.abs(player.vel.x) > 10 ||
    k.isKeyDown("left") ||
    k.isKeyDown("right") ||
    (isTouchMoving && touchMoveDirection !== 0);

  if (!isDashing && isTouchMoving && touchMoveDirection !== 0) {
    player.move(touchMoveDirection * SPEED, 0);
    dashDirection = touchMoveDirection;
  }

  // Handle sprite animation and flipping (only when not dashing, as dash has its own visual effect)
  if (!isDashing) {
    // Determine movement direction for flipping
    const moveDir =
      player.vel.x !== 0
        ? player.vel.x > 0
          ? 1
          : -1
        : k.isKeyDown("right") || (isTouchMoving && touchMoveDirection > 0)
        ? 1
        : k.isKeyDown("left") || (isTouchMoving && touchMoveDirection < 0)
        ? -1
        : 0;

    // Flip sprite horizontally when moving left
    if (moveDir < 0) {
      player.scale.x = -Math.abs(player.scale.x);
    } else if (moveDir > 0) {
      player.scale.x = Math.abs(player.scale.x);
    }

    if (isMovingHorizontally && player.isGrounded()) {
      // Animate between moving1 and moving2
      player.animTime += k.dt();
      const animSpeed = 0.15; // Time per frame
      const frame = Math.floor(player.animTime / animSpeed) % 2;
      const targetSprite =
        frame === 0 ? currentGaiaSprites.moving1 : currentGaiaSprites.moving2;

      // Check current sprite and switch if needed
      const currentSprite = player.sprite;
      if (!currentSprite || currentSprite.name !== targetSprite) {
        player.use(k.sprite(targetSprite));
      }
    } else {
      // Use still sprite
      const currentSprite = player.sprite;
      if (!currentSprite || currentSprite.name !== currentGaiaSprites.still) {
        player.use(k.sprite(currentGaiaSprites.still));
      }
      player.animTime = 0;
    }
  }

  // Reset dash when player lands
  if (player.isGrounded() && !wasGrounded) {
    // Player just landed
    canDash = false;
    isDashing = false;
    // Aturar velocitat horitzontal quan toca terra
    player.vel.x = 0;
    // Cancel·lar handler de dash si existeix
    if (dashUpdateHandler) {
      dashUpdateHandler.cancel();
      dashUpdateHandler = null;
    }
    // Restaurar escala i rotació si estaven modificades
    if (player.scale) {
      const currentScaleX = player.scale.x;
      // Preserve horizontal flip direction
      player.scale = k.vec2(currentScaleX < 0 ? -0.25 : 0.25, 0.25);
    }
    player.angle = 0;
    if (player.opacity !== undefined) {
      player.opacity = 1;
    }
  }
  wasGrounded = player.isGrounded();

  // Aplicar fricció a l'aire quan no està dashing i no està a terra
  if (!player.isGrounded() && !isDashing) {
    // Aplicar fricció a la velocitat horitzontal
    player.vel.x *= AIR_FRICTION;
    // Si la velocitat és molt petita, aturar-la completament
    if (Math.abs(player.vel.x) < 10) {
      player.vel.x = 0;
    }
  }

  const targetCamPos = player.worldPos();

  // Smooth camera following using lerp (linear interpolation)
  // Higher value (0.2) = faster follow, lower (0.05) = smoother but slower
  const lerpSpeed = 0.2;

  // Manual lerp: current + (target - current) * speed
  const dx = (targetCamPos.x - currentCamPos.x) * lerpSpeed;
  const dy = (targetCamPos.y - currentCamPos.y) * lerpSpeed;
  currentCamPos.x += dx;
  currentCamPos.y += dy;

  k.camPos(currentCamPos);

  // Parallax scrolling - use smooth camera position
  for (const layer of parallaxLayers) {
    const totalMovement = currentCamPos.x * layer.speed;
    const offsetX = totalMovement % layer.scaledWidth;
    layer.container.pos.x = -offsetX;
  }

  // Reset if player falls
  const failThreshold = 2500;
  if (player.pos.y > failThreshold) {
    player.pos = startPos.clone();
    player.vel.x = 0;
    player.vel.y = 0;
    // Reset camera position too
    currentCamPos = player.worldPos();
    // Reset dash
    canDash = false;
    isDashing = false;
    dashDirection = 0;
  }
});

// --- Collisions (set up in loadLevel) ---
// These are set up per level in the loadLevel function

// --- Player Controls ---
function attemptJump() {
  if (player && player.isGrounded()) {
    player.jump(1500);
    canDash = true;
    return true;
  }
  return false;
}

function attemptDash(directionOverride) {
  if (!player) {
    return false;
  }

  if (typeof directionOverride === "number" && directionOverride !== 0) {
    dashDirection = directionOverride;
  }

  if (player.isGrounded() || !canDash || isDashing) {
    return false;
  }

  const dashDir =
    typeof directionOverride === "number" && directionOverride !== 0
      ? directionOverride
      : dashDirection !== 0
      ? dashDirection
      : 1;

  const originalScale = player.scale
    ? player.scale.clone()
    : k.vec2(0.25, 0.25);
  const originalOpacity = player.opacity !== undefined ? player.opacity : 1;
  const baseScaleX = Math.abs(originalScale.x);
  const stretchX = dashDir > 0 ? baseScaleX * 2.0 : baseScaleX * 0.5; // More exaggerated stretch
  const stretchY = baseScaleX * 0.5; // More exaggerated squash
  // Preserve horizontal flip direction
  const finalStretchX = originalScale.x < 0 ? -stretchX : stretchX;
  const rotationAmount = dashDir * 0.2; // Reduced rotation for cleaner look with moving sprite

  player.vel.x = dashDir * DASH_SPEED;
  isDashing = true;
  canDash = false;

  player.scale = k.vec2(finalStretchX, stretchY);
  player.angle = rotationAmount;
  player.opacity = 0.9;

  let dashTime = 0;

  if (dashUpdateHandler) {
    dashUpdateHandler.cancel();
  }

  // Force moving sprite for dash
  player.use(k.sprite(currentGaiaSprites.moving2));

  dashUpdateHandler = player.onUpdate(() => {
    if (!isDashing) {
      return;
    }

    dashTime += k.dt();

    // Fight gravity during dash, but only when falling (not when rising)
    // If moving upward (vel.y < 0), let gravity work normally
    // If falling (vel.y > 0), fight gravity to slow the fall
    if (player.vel.y > 0) {
      // Player is falling - fight gravity to slow the descent
      const gravityFightForce = GRAVITY * 1.2; // 20% stronger than gravity
      player.vel.y -= gravityFightForce * k.dt();

      // Cap downward velocity to prevent too fast falling
      if (player.vel.y > 200) {
        player.vel.y = 200;
      }
    } else {
      // Player is rising or at peak - apply normal gravity (don't fight it)
      // This prevents propelling upward when dashing after a jump
      player.vel.y += GRAVITY * k.dt();
    }

    // Spawn trail ghosts
    if (dashTime % 0.05 < k.dt()) {
      // Spawn roughly every 0.05s
      const ghost = k.add([
        k.sprite(currentGaiaSprites.moving2),
        k.pos(player.pos),
        k.scale(player.scale),
        k.anchor("bot"),
        k.opacity(0.5),
        k.z(1), // Behind player
        "ghost_trail",
      ]);
      // Flip ghost if player is flipped
      ghost.scale.x = player.scale.x;

      // Fade out ghost
      k.tween(
        0.5,
        0,
        0.3,
        (val) => (ghost.opacity = val),
        k.easings.easeOutQuad
      ).onEnd(() => {
        ghost.destroy();
      });
    }

    const progress = dashTime / DASH_DURATION;
    // Use a more dynamic ease for recovery
    const easeOut = 1 - Math.pow(1 - progress, 5); // Quintic ease out for snappiness

    const currentScaleXAbs = k.lerp(
      Math.abs(finalStretchX),
      Math.abs(originalScale.x),
      easeOut
    );
    const currentScaleY = k.lerp(stretchY, originalScale.y, easeOut);
    // Preserve horizontal flip direction
    const currentScaleX =
      originalScale.x < 0 ? -currentScaleXAbs : currentScaleXAbs;
    player.scale = k.vec2(currentScaleX, currentScaleY);
    player.angle = k.lerp(rotationAmount, 0, easeOut);
    player.opacity = k.lerp(0.9, originalOpacity, easeOut);

    if (dashTime >= DASH_DURATION) {
      isDashing = false;
      player.scale = originalScale;
      player.angle = 0;
      player.opacity = originalOpacity;
      // Sprite will be reset by main loop
      if (dashUpdateHandler) {
        dashUpdateHandler.cancel();
        dashUpdateHandler = null;
      }
    }
  });

  return true;
}

k.onKeyPress("space", () => {
  attemptJump();
});

k.onKeyDown("left", () => {
  if (player && !isDashing) {
    player.move(-SPEED, 0);
    dashDirection = -1; // Guardar direcció per al dash
  }
});

k.onKeyDown("right", () => {
  if (player && !isDashing) {
    player.move(SPEED, 0);
    dashDirection = 1; // Guardar direcció per al dash
  }
});

// --- Dash Feature ---
k.onKeyPress("d", () => {
  attemptDash();
});

function setupTouchControls() {
  if (typeof window === "undefined") {
    return;
  }

  const nav = window.navigator;
  const hasTouchPoints =
    (nav && typeof nav.maxTouchPoints === "number" && nav.maxTouchPoints > 0) ||
    (nav &&
      "msMaxTouchPoints" in nav &&
      nav.msMaxTouchPoints &&
      nav.msMaxTouchPoints > 0);
  const prefersCoarsePointer =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: coarse)").matches;
  const prefersNoHover =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(hover: none)").matches;

  if (!hasTouchPoints && !prefersCoarsePointer && !prefersNoHover) {
    return;
  }

  const canvas = k.canvas;
  if (!canvas) {
    return;
  }

  if (canvas.style && canvas.style.touchAction !== "none") {
    canvas.style.touchAction = "none";
  }

  const clearMovementTimeout = () => {
    if (touchState.moveTimeoutId !== null) {
      window.clearTimeout(touchState.moveTimeoutId);
      touchState.moveTimeoutId = null;
    }
  };

  const stopTouchMovement = () => {
    isTouchMoving = false;
    touchMoveDirection = 0;
  };

  const resetTouchState = () => {
    clearMovementTimeout();
    if (touchState.gestureResetTimeoutId !== null) {
      window.clearTimeout(touchState.gestureResetTimeoutId);
      touchState.gestureResetTimeoutId = null;
    }
    touchState.id = null;
    touchState.startClientX = 0;
    touchState.startClientY = 0;
    touchState.lastClientX = 0;
    touchState.lastClientY = 0;
    touchState.gestureUsed = false;
    stopTouchMovement();
  };

  const resetExtraSwipeState = () => {
    extraSwipeState.id = null;
    extraSwipeState.startClientX = 0;
    extraSwipeState.startClientY = 0;
    extraSwipeState.lastClientX = 0;
    extraSwipeState.lastClientY = 0;
    extraSwipeState.gestureUsed = false;
  };

  const queueGestureReset = () => {
    if (touchState.gestureResetTimeoutId !== null) {
      window.clearTimeout(touchState.gestureResetTimeoutId);
    }
    touchState.gestureResetTimeoutId = window.setTimeout(() => {
      if (touchState.id !== null) {
        touchState.gestureUsed = false;
        touchState.startClientX = touchState.lastClientX;
        touchState.startClientY = touchState.lastClientY;
      }
      touchState.gestureResetTimeoutId = null;
    }, TOUCH_GESTURE_RESET_MS);
  };

  const getDirectionFromClientX = (clientX) => {
    const rect = canvas.getBoundingClientRect();
    if (!rect || rect.width === 0) {
      return 0;
    }
    const relativeX = clientX - rect.left;
    const clampedX = Math.min(Math.max(relativeX, 0), rect.width);
    return clampedX < rect.width / 2 ? -1 : 1;
  };

  const scheduleMovementActivation = () => {
    clearMovementTimeout();
    touchState.moveTimeoutId = window.setTimeout(() => {
      if (touchState.id === null || touchState.gestureUsed) {
        touchState.moveTimeoutId = null;
        return;
      }
      const direction = getDirectionFromClientX(touchState.lastClientX);
      if (direction !== 0) {
        isTouchMoving = true;
        touchMoveDirection = direction;
        dashDirection = direction;
      }
      touchState.moveTimeoutId = null;
    }, TOUCH_MOVE_DELAY_MS);
  };

  const handleSwipe = (
    deltaX,
    deltaY,
    { preserveMovement = false, allowVerticalPriority = false } = {}
  ) => {
    if (touchState.gestureUsed) {
      return false;
    }

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    const consumeSwipe = () => {
      touchState.gestureUsed = true;
      if (preserveMovement && isTouchMoving) {
        queueGestureReset();
      } else {
        clearMovementTimeout();
        stopTouchMovement();
      }
    };

    const verticalDominant =
      absY >= TOUCH_SWIPE_THRESHOLD &&
      (absY > absX || (allowVerticalPriority && absY > TOUCH_SWIPE_THRESHOLD));

    if (deltaY <= -TOUCH_SWIPE_THRESHOLD && verticalDominant) {
      consumeSwipe();
      attemptJump();
      return true;
    }

    const horizontalDominant =
      absX >= TOUCH_SWIPE_THRESHOLD &&
      absX >= (allowVerticalPriority ? absY * 0.5 : absY);

    if (horizontalDominant) {
      consumeSwipe();
      attemptDash(deltaX > 0 ? 1 : -1);
      return true;
    }

    return false;
  };

  const findTouchById = (touchList, id) => {
    if (id === null) {
      return null;
    }
    for (let i = 0; i < touchList.length; i++) {
      if (touchList[i].identifier === id) {
        return touchList[i];
      }
    }
    return null;
  };

  const assignMovementTouch = (touch) => {
    touchState.id = touch.identifier;
    touchState.startClientX = touch.clientX;
    touchState.startClientY = touch.clientY;
    touchState.lastClientX = touch.clientX;
    touchState.lastClientY = touch.clientY;
    touchState.gestureUsed = false;
    scheduleMovementActivation();
  };

  const assignExtraSwipeTouch = (touch) => {
    extraSwipeState.id = touch.identifier;
    extraSwipeState.startClientX = touch.clientX;
    extraSwipeState.startClientY = touch.clientY;
    extraSwipeState.lastClientX = touch.clientX;
    extraSwipeState.lastClientY = touch.clientY;
    extraSwipeState.gestureUsed = false;
  };

  canvas.addEventListener(
    "touchstart",
    (event) => {
      for (let i = 0; i < event.changedTouches.length; i++) {
        const touch = event.changedTouches[i];
        if (!touch) continue;

        if (touchState.id === null) {
          assignMovementTouch(touch);
          if (extraSwipeState.id !== null) {
            break;
          }
          continue;
        }

        if (extraSwipeState.id === null) {
          assignExtraSwipeTouch(touch);
          if (touchState.id !== null) {
            break;
          }
        }
      }
    },
    false
  );

  const handleExtraSwipeMove = (touch) => {
    if (extraSwipeState.id === null || extraSwipeState.gestureUsed) {
      return;
    }

    const deltaX = touch.clientX - extraSwipeState.startClientX;
    const deltaY = touch.clientY - extraSwipeState.startClientY;
    extraSwipeState.lastClientX = touch.clientX;
    extraSwipeState.lastClientY = touch.clientY;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (
      absY >= TOUCH_SWIPE_THRESHOLD &&
      absY >= absX &&
      deltaY <= -TOUCH_SWIPE_THRESHOLD
    ) {
      extraSwipeState.gestureUsed = true;
      attemptJump();
      return;
    }

    if (absX >= TOUCH_SWIPE_THRESHOLD && absX >= absY * 0.5) {
      extraSwipeState.gestureUsed = true;
      attemptDash(deltaX > 0 ? 1 : -1);
    }
  };

  canvas.addEventListener(
    "touchmove",
    (event) => {
      const moveTouch = findTouchById(event.changedTouches, touchState.id);
      if (moveTouch) {
        const deltaX = moveTouch.clientX - touchState.startClientX;
        const deltaY = moveTouch.clientY - touchState.startClientY;

        touchState.lastClientX = moveTouch.clientX;
        touchState.lastClientY = moveTouch.clientY;

        if (
          handleSwipe(deltaX, deltaY, {
            preserveMovement: isTouchMoving,
            allowVerticalPriority: isTouchMoving,
          })
        ) {
          return;
        }

        if (isTouchMoving && !touchState.gestureUsed) {
          const newDirection = getDirectionFromClientX(moveTouch.clientX);
          if (newDirection !== 0 && newDirection !== touchMoveDirection) {
            touchMoveDirection = newDirection;
            dashDirection = newDirection;
          }
        }
      }

      const extraTouch = findTouchById(
        event.changedTouches,
        extraSwipeState.id
      );
      if (extraTouch) {
        handleExtraSwipeMove(extraTouch);
      }
    },
    false
  );

  const handleTouchEnd = (event) => {
    const moveTouch = findTouchById(event.changedTouches, touchState.id);
    const extraTouch = findTouchById(event.changedTouches, extraSwipeState.id);

    if (moveTouch) {
      resetTouchState();
    }

    if (extraTouch) {
      resetExtraSwipeState();
    }
  };

  canvas.addEventListener("touchend", handleTouchEnd, false);
  canvas.addEventListener("touchcancel", handleTouchEnd, false);
}

// --- Start Game ---
setupTouchControls();
loadLevel(0);
