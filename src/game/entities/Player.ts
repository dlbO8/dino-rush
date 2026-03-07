import { GameScene } from "../scenes/GameScene";

export class Player extends Phaser.Physics.Arcade.Sprite {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  declare scene: GameScene;

  constructor(scene: Phaser.Scene, x: number, y: number, key: string) {
    super(scene, x, y, key);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.init();

    this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
  }

  init() {
    this.cursors = this.scene.input.keyboard?.createCursorKeys()!;
    this.setOrigin(0, 1)
      .setGravityY(5000)
      .setCollideWorldBounds(true)
      .setBodySize(44, 92);

    this.registerAnimations();
  }

  update() {
    const { space } = this.cursors;
    const isSpaceJustDown = Phaser.Input.Keyboard.JustDown(space);
    const onFloor = (this.body as Phaser.Physics.Arcade.Body).onFloor();

    if (isSpaceJustDown && onFloor) {
      this.setVelocityY(-1600);
    }

    if (!this.scene.isGameRunning) {
      return;
    }

    if (onFloor) {
      console.log("running");
      this.playRunAnimation();
    } else {
      this.anims.stop();
      this.setTexture("dino-run", 0);
    }
  }

  playRunAnimation() {
    this.play("dino-run", true);
  }

  registerAnimations() {
    // Setup the dino-run spritesheet animation
    this.anims.create({
      key: "dino-run",
      frames: this.anims.generateFrameNames("dino-run", { start: 2, end: 3 }),
      frameRate: 10,
      repeat: -1, // Infinate loop
    });
  }
}
