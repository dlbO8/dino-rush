import { SpriteWithDynamicBody } from "../types";
import { Player } from "../entities/Player";

export class GameScene extends Phaser.Scene {
  player: Player;
  startTrigger: SpriteWithDynamicBody;

  constructor() {
    super("GameScene");
  }

  get gameHeight() {
    return this.game.config.height as number;
  }

  create() {
    this.createEnvironment();
    this.createPlayer();

    this.startTrigger = this.physics.add
      .sprite(0, 30, "")
      .setAlpha(0)
      .setOrigin(0, 1);

    this.physics.add.overlap(this.startTrigger, this.player, () => {
      console.log("Trigger Collision");
    });
  }

  createPlayer() {
    this.player = new Player(this, 0, this.gameHeight, "dino-idle");
  }

  createEnvironment() {
    this.add.tileSprite(0, this.gameHeight, 1000, 26, "ground").setOrigin(0, 1);
  }
}
