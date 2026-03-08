import { SpriteWithDynamicBody } from "../types";
import { Player } from "../entities/Player";
import { GameScene } from "./GameScene";
import { PRELOAD_CONFIG } from "../main";

export class PlayScene extends GameScene {
  player: Player;
  ground: Phaser.GameObjects.TileSprite;
  startTrigger: SpriteWithDynamicBody;
  spawnInterval: number = 1500; // Default to 1.5 seconds
  spawnTime: number = 0;
  obstacles: Phaser.Physics.Arcade.Group;
  gameSpeed: number = 5;

  constructor() {
    super("PlayScene");
  }

  create() {
    this.createEnvironment();
    this.createPlayer();

    this.obstacles = this.physics.add.group();

    this.startTrigger = this.physics.add
      .sprite(0, 10, "")
      .setAlpha(0)
      .setOrigin(0, 1);

    this.physics.add.collider(this.obstacles, this.player, () => {
      this.physics.pause();
      this.isGameRunning = false;
    });

    this.physics.add.overlap(this.startTrigger, this.player, () => {
      // Set the Triggerer to trigger and move it down, then off the page.
      if (this.startTrigger.y === 10) {
        this.startTrigger.body.reset(0, this.gameHeight);
        return;
      }
      this.startTrigger.body.reset(9999, 9999);

      // Use a timed event in Phaser to roll the ground out to the games width, move the player forwards and start a game.
      const rollOutGroundEvent = this.time.addEvent({
        delay: 1000 / 60,
        loop: true,
        callback: () => {
          this.player.playRunAnimation();
          this.player.setVelocityX(80);
          this.ground.width += 17 * 2;

          if (this.ground.width >= this.gameWidth) {
            rollOutGroundEvent.remove();
            this.ground.width = this.gameWidth;
            this.player.setVelocityX(0);

            this.isGameRunning = true;
          }
        },
      });
    });
  }

  // Delta is time from the last frame
  update(time: number, delta: number): void {
    // Exit if the game is not running
    if (!this.isGameRunning) {
      return;
    }

    // Spawn Obstacles
    this.spawnTime += delta;
    if (this.spawnTime >= this.spawnInterval) {
      this.spawnObstacle();
      this.spawnTime = 0;
    }

    // Move obstacles left
    Phaser.Actions.IncX(this.obstacles.getChildren(), -this.gameSpeed);

    (this.obstacles.getChildren() as SpriteWithDynamicBody[]).forEach(
      (obstacle) => {
        if (obstacle.getBounds().right < 0) {
          this.obstacles.remove(obstacle);
        }
      },
    );

    this.ground.tilePositionX += this.gameSpeed;
  }

  // Custom Functions
  createPlayer() {
    this.player = new Player(this, 0, this.gameHeight, "dino-idle");
  }

  createEnvironment() {
    this.ground = this.add
      .tileSprite(0, this.gameHeight, 88, 26, "ground")
      .setOrigin(0, 1);
  }

  spawnObstacle() {
    const obstacleNum =
      Math.floor(Math.random() * PRELOAD_CONFIG.cactusesCount) + 1;
    const distance = Phaser.Math.Between(600, 900);

    this.obstacles
      .create(distance, this.gameHeight, `obstacle-${obstacleNum}`)
      .setOrigin(0, 1)
      .setImmovable();
  }
}
