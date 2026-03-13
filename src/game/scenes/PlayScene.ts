import { SpriteWithDynamicBody } from "../types";
import { Player } from "../entities/Player";
import { GameScene } from "./GameScene";
import { PRELOAD_CONFIG } from "../main";

export class PlayScene extends GameScene {
  player: Player;
  ground: Phaser.GameObjects.TileSprite;
  startTrigger: SpriteWithDynamicBody;
  obstacles: Phaser.Physics.Arcade.Group;
  clouds: Phaser.GameObjects.Group;

  scoreText: Phaser.GameObjects.Text;
  gameOverContainer: Phaser.GameObjects.Container;
  gameOverText: Phaser.GameObjects.Image;
  restartText: Phaser.GameObjects.Image;

  score: number = 0;
  scoreInterval: number = 50;
  scoreDeltaTime: number = 0;
  spawnInterval: number = 1500; // Default to 1.5 seconds
  spawnTime: number = 0;
  gameSpeed: number = 3;

  constructor() {
    super("PlayScene");
  }

  create() {
    this.createEnvironment();
    this.createPlayer();
    this.createObstacles();
    this.createAnimations();
    this.createGameOverContainer();

    this.createScore();

    this.handleGameStart();
    this.handleObstacleCollisions();
    this.handleGameRestart();
  }

  // Delta is time from the last frame
  update(time: number, delta: number): void {
    // Exit if the game is not running
    if (!this.isGameRunning) {
      return;
    }

    this.scoreDeltaTime += delta;
    if (this.scoreDeltaTime >= this.scoreInterval) {
      this.score++;
      console.log("score: ", this.score);
      this.scoreDeltaTime = 0;
    }

    // Spawn Obstacles
    this.spawnTime += delta;
    if (this.spawnTime >= this.spawnInterval) {
      this.spawnObstacle();
      this.spawnTime = 0;
    }

    // Move obstacles left
    Phaser.Actions.IncX(this.obstacles.getChildren(), -this.gameSpeed);

    // Move clouds left
    Phaser.Actions.IncX(this.clouds.getChildren(), -0.5);

    const score = Array.from(String(this.score), Number);

    for (let i = 0; i < 5 - String(this.score).length; i++) {
      score.unshift(0);
    }

    this.scoreText.setText(score.join(""));

    (this.obstacles.getChildren() as SpriteWithDynamicBody[]).forEach(
      (obstacle) => {
        if (obstacle.getBounds().right < 0) {
          this.obstacles.remove(obstacle);
        }
      },
    );

    //Loop it when they leabe the screen
    (this.clouds.getChildren() as SpriteWithDynamicBody[]).forEach((cloud) => {
      if (cloud.getBounds().right < 0) {
        cloud.x = this.gameWidth + 30;
      }
    });

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

    this.clouds = this.add.group();
    this.clouds = this.clouds.addMultiple([
      this.add.image(this.gameWidth / 2, 170, "cloud"),
      this.add.image(this.gameWidth - 80, 80, "cloud"),
      this.add.image(this.gameWidth / 1.3, 100, "cloud"),
    ]);

    this.clouds.setAlpha(0);
  }

  createObstacles() {
    this.obstacles = this.physics.add.group();
  }

  createGameOverContainer() {
    this.gameOverText = this.add.image(0, 0, "game-over");
    this.restartText = this.add.image(0, 80, "restart").setInteractive();

    this.gameOverContainer = this.add
      .container(this.gameWidth / 2, this.gameHeight / 2 - 50)
      .add([this.gameOverText, this.restartText])
      .setAlpha(0);
  }

  createAnimations() {
    this.anims.create({
      key: "enemy-bird-fly",
      frames: this.anims.generateFrameNumbers("enemy-bird"),
      frameRate: 6,
      repeat: -1,
    });
  }

  createScore() {
    this.scoreText = this.add
      .text(this.gameWidth, 0, "00000", {
        fontSize: 30,
        fontFamily: "Arial",
        color: "#535353",
      })
      .setOrigin(1, 0)
      .setAlpha(0);
  }

  spawnObstacle() {
    const totalObstacles =
      PRELOAD_CONFIG.cactusesCount + PRELOAD_CONFIG.birdsCount;

    const obstacleNum = Math.floor(Math.random() * totalObstacles) + 1;
    //const obstacleNum = 7;

    const distance = Phaser.Math.Between(150, 300);

    let obstacle;

    if (obstacleNum > PRELOAD_CONFIG.cactusesCount) {
      // Loading enemy bird
      const enemyPossibleHeight = [20, 70];
      const enemyHeight = enemyPossibleHeight[Math.floor(Math.random() * 2)];

      obstacle = this.obstacles.create(
        this.gameWidth + distance,
        this.gameHeight - enemyHeight,
        "enemy-bird",
      );

      obstacle.play("enemy-bird-fly", true);
    } else {
      // Loading Cactus
      obstacle = this.obstacles.create(
        this.gameWidth + distance,
        this.gameHeight,
        `obstacle-${obstacleNum}`,
      );
    }

    obstacle.setOrigin(0, 1).setImmovable();
  }

  handleGameStart() {
    this.startTrigger = this.physics.add
      .sprite(0, 10, "")
      .setAlpha(0)
      .setOrigin(0, 1);

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
            this.clouds.setAlpha(1);
            this.scoreText.setAlpha(1);

            this.isGameRunning = true;
          }
        },
      });
    });
  }

  handleGameRestart() {
    this.restartText.on("pointerdown", () => {
      this.physics.resume();
      this.player.setVelocityY(0);

      this.obstacles.clear(true, true);
      this.gameOverContainer.setAlpha(0);
      this.anims.resumeAll();

      this.isGameRunning = true;
    });
  }

  handleObstacleCollisions() {
    this.physics.add.collider(this.obstacles, this.player, () => {
      this.isGameRunning = false;
      this.physics.pause();
      this.anims.pauseAll();

      this.player.die();
      this.gameOverContainer.setAlpha(1);

      this.score = 0;
      this.scoreDeltaTime = 0;
      this.spawnTime = 0;
      this.gameSpeed = 3;
    });
  }
}
