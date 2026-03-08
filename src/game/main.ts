import { AUTO, Game, Types } from "phaser";
import PreloadScene from "./scenes/PreloadScene";
import { PlayScene } from "./scenes/PlayScene";

export const PRELOAD_CONFIG = {
  cactusesCount: 6,
};

const config: Types.Core.GameConfig = {
  type: AUTO,
  width: 1000,
  height: 340,
  parent: "game-container",
  pixelArt: true,
  transparent: true,
  physics: {
    default: "arcade",
    arcade: {
      debug: true,
    },
  },
  scene: [PreloadScene, PlayScene],
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};

export default StartGame;
