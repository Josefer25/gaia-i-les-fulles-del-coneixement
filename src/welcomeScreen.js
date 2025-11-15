// Welcome screen logic
export function createWelcomeScreen(k, GAME_WIDTH, GAME_HEIGHT) {
  let welcomeScreen = null;

  function showWelcomeScreen(title, text) {
    // Fons semi-transparent
    const bg = k.add([
      k.rect(GAME_WIDTH, GAME_HEIGHT),
      k.color(0, 0, 0, 200),
      k.pos(0, 0),
      k.area(),
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
      k.text(title, { size: 64, width: GAME_WIDTH * 0.8 }),
      k.pos(0, -GAME_HEIGHT * 0.25),
      k.anchor("center"),
      k.color(0, 0, 0),
    ]);

    // Text
    container.add([
      k.text(text, {
        size: 32,
        width: GAME_WIDTH * 0.75,
        align: "center",
      }),
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

    // Tancar quan es toca/clica el fons
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

  return {
    show: showWelcomeScreen,
    close: closeWelcomeScreen,
  };
}

