// Custom Patrol System with Tweening
export function setupPatrolSystem(k) {
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

  function setupEnemyPatrol(enemies) {
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
  }

  return {
    setupEnemyPatrol,
  };
}

