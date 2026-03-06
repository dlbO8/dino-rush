import { Scene } from "phaser";

export class GameScene extends Scene {
  constructor() {
    super("GameScene");
  }

  get gameHeight() {
    return this.game.config.height as number;
  }

  create() {
    this.createEnvironment();
    this.createPlayer();
  }

  createPlayer() {
    this.physics.add.sprite(0, this.gameHeight, "dino-idle").setOrigin(0, 1);
  }

  createEnvironment() {
    this.add.tileSprite(0, this.gameHeight, 1000, 26, "ground").setOrigin(0, 1);
  }
}
