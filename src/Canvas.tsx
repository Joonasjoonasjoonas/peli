import React, { useRef, useEffect, useState } from 'react';
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
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      const aspectRatio = WORLD_WIDTH / WORLD_HEIGHT;
      let newWidth = window.innerWidth;
      let newHeight = newWidth / aspectRatio;

      if (newHeight > window.innerHeight) {
        newHeight = window.innerHeight;
        newWidth = newHeight * aspectRatio;
      }

      setDimensions({ width: newWidth, height: newHeight });
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions();

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    const tileWidth = dimensions.width / WORLD_WIDTH;
    const tileHeight = dimensions.height / WORLD_HEIGHT;

    const drawMap = () => {
      worldMap.forEach((tile, index) => {
        const x = index % WORLD_WIDTH;
        const y = Math.floor(index / WORLD_WIDTH);

        ctx.fillStyle = tile.visible ? tile.backgroundColor : 'black';
        ctx.fillRect(x * tileWidth, y * tileHeight, tileWidth, tileHeight);

        if (tile.visible || tile.explored) {
          ctx.fillStyle = tile.visible ? tile.color : '#282828';
          ctx.font = `${Math.min(tileWidth, tileHeight)}px dos`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(tile.ascii, x * tileWidth + tileWidth / 2, y * tileHeight + tileHeight / 2);
        }
      });

      // Draw player
      const { playerCoords } = PlayerStore;
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('@', playerCoords.x * tileWidth + tileWidth / 2, playerCoords.y * tileHeight + tileHeight / 2);

      // Draw actors
      const { actors } = ActorStore;
      actors.forEach(actor => {
        const tile = worldMap[getIndexFromXY(actor.xCoord, actor.yCoord)];
        if (tile.visible) {
          ctx.fillStyle = actor.charColor;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(actor.char, actor.xCoord * tileWidth + tileWidth / 2, actor.yCoord * tileHeight + tileHeight / 2);
        }
      });
    };

    drawMap();
  }, [worldMap, dimensions]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
};

export default Canvas;