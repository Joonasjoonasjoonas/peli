import React, { useRef, useEffect } from 'react';
import { TileType } from "./scripts/world/tileTypes";
import { WORLD_WIDTH, WORLD_HEIGHT } from "./scripts/game";
import { getIndexFromXY } from "./utils/utils";
import PlayerStore from "./store/PlayerStore";
import ActorStore from "./store/ActorStore";

interface Props {
  worldMap: TileType[];
}

const Canvas: React.FC<Props> = ({ worldMap }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const tileSize = 15; // Adjust this based on your desired tile size
    canvas.width = WORLD_WIDTH * tileSize;
    canvas.height = WORLD_HEIGHT * tileSize;

    const drawMap = () => {
      worldMap.forEach((tile, index) => {
        const x = index % WORLD_WIDTH;
        const y = Math.floor(index / WORLD_WIDTH);

        ctx.fillStyle = tile.visible ? tile.backgroundColor : 'black';
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);

        if (tile.visible || tile.explored) {
          ctx.fillStyle = tile.visible ? tile.color : '#282828';
          ctx.font = `${tileSize}px dos`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(tile.ascii, x * tileSize + tileSize / 2, y * tileSize + tileSize / 2);
        }
      });

      // Draw player
      const { playerCoords } = PlayerStore;
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('@', playerCoords.x * tileSize + tileSize / 2, playerCoords.y * tileSize + tileSize / 2);

      // Draw actors
      const { actors } = ActorStore;
      actors.forEach(actor => {
        const tile = worldMap[getIndexFromXY(actor.xCoord, actor.yCoord)];
        if (tile.visible) {
          ctx.fillStyle = actor.charColor;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(actor.char, actor.xCoord * tileSize + tileSize / 2, actor.yCoord * tileSize + tileSize / 2);
        }
      });
    };

    drawMap();
  }, [worldMap]);

  return <canvas ref={canvasRef} />;
};

export default Canvas;