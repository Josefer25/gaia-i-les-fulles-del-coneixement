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
k.loadSprite("bean", "/sprites/bean.png");
k.loadSprite("steel", "/sprites/steel.png");
k.loadSprite("grass", "/sprites/grass.png");
k.loadSprite("coin", "/sprites/coin.png");
k.loadSprite("ghosty", "/sprites/ghosty.png");
k.loadSprite("portal", "/sprites/portal.png");
k.loadSprite("bg1", "/sprites/1.png");
k.loadSprite("bg2", "/sprites/2.png");
k.loadSprite("bg3", "/sprites/3.png");
k.loadSprite("bg4", "/sprites/4.png");
k.loadSprite("bg5", "/sprites/5.png");

// --- Variables Globals ---
const SPEED = 480;
k.setGravity(2400);

// --- Sistema de Nivells ---
let currentLevelIndex = 0;
let level = null;
let player = null;
let startPos = null;
let coinCount = 0;
let coinText = null;

// --- Parallax Background ---
const layers = [
  { speed: 0.1, sprite: "bg1", z: -50 },
  { speed: 0.2, sprite: "bg2", z: -40 },
  { speed: 0.4, sprite: "bg3", z: -30 },
  { speed: 0.6, sprite: "bg4", z: -20 },
  { speed: 0.8, sprite: "bg5", z: -10 },
];

const parallaxLayers = [];

k.onLoad(() => {
  const bgSpriteData = k.getSprite(layers[0].sprite).data;
  const scaleX = GAME_WIDTH / bgSpriteData.width;
  const scaleY = GAME_HEIGHT / bgSpriteData.height;
  const scale = Math.max(scaleX, scaleY);
  const scaledWidth = bgSpriteData.width * scale;

  layers.forEach((layerDef) => {
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
  });
});

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
    "^": () => [
      k.sprite("portal"),
      k.area(),
      k.anchor("bot"),
      k.z(1),
      "portal",
      "portal_anim", // Etiqueta per a l'animació
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

  // Reset camera position to player position
  currentCamPos = player.worldPos();
  k.setCamPos(currentCamPos);

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
                levelData.welcomeMessage.text
              );
            }
          });
        });
      });
    });

    // Coin collection
    player.onCollide("coin", (coin) => {
      coinCount++;
      coinText.text = `Fulles: ${coinCount}`;
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
      welcomeScreen.show(
        levelData.welcomeMessage.title,
        levelData.welcomeMessage.text
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
    k.debug.log("Game completed!");
    // You can add a victory screen here
  }
}

// --- Initialize UI ---
coinText = k.add([
  k.text("Fulles: 0", { size: 48 }),
  k.pos(30, 30),
  k.fixed(),
  k.z(100),
]);

// --- Smooth Camera Following ---
let currentCamPos = k.vec2(0, 0);

// --- Game Update Loop ---
k.onUpdate(() => {
  if (!player) return;

  const targetCamPos = player.worldPos();

  // Smooth camera following using lerp (linear interpolation)
  // Higher value (0.2) = faster follow, lower (0.05) = smoother but slower
  const lerpSpeed = 0.2;

  // Manual lerp: current + (target - current) * speed
  const dx = (targetCamPos.x - currentCamPos.x) * lerpSpeed;
  const dy = (targetCamPos.y - currentCamPos.y) * lerpSpeed;
  currentCamPos.x += dx;
  currentCamPos.y += dy;

  k.setCamPos(currentCamPos);

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
  }
});

// --- Collisions (set up in loadLevel) ---
// These are set up per level in the loadLevel function

// --- Player Controls ---
k.onKeyPress("space", () => {
  if (player && player.isGrounded()) {
    player.jump(1500);
  }
});

k.onKeyDown("left", () => {
  if (player) {
    player.move(-SPEED, 0);
  }
});

k.onKeyDown("right", () => {
  if (player) {
    player.move(SPEED, 0);
  }
});

// --- Start Game ---
loadLevel(0);
