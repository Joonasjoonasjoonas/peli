import React, { useRef, useEffect, useState } from 'react';
import { TileType } from "../scripts/world/tileTypes";
import { WORLD_WIDTH, WORLD_HEIGHT } from "../scripts/game";
import { getIndexFromXY } from "../utils/utils";
import PlayerStore from "../store/PlayerStore";
import ActorStore from "../store/ActorStore";
import ItemStore from '../store/ItemStore';

interface Props {
  worldMap: TileType[];
  turn: number;
  logMessages: string[][];
}

export const GameView: React.FC<Props> = ({ worldMap, turn, logMessages }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [scaledDimensions, setScaledDimensions] = useState({ width: 0, height: 0, scale: 1 });

  useEffect(() => {
    const updateDimensions = () => {
      // Base resolution: 854 × 480
      const baseWidth = 854;
      const baseHeight = 480;
      
      // Calculate integer scaling factor to fit screen
      const scaleX = Math.floor(window.innerWidth / baseWidth);
      const scaleY = Math.floor(window.innerHeight / baseHeight);
      const scale = Math.max(1, Math.min(scaleX, scaleY)); // At least 1x scale
      
      const scaledWidth = baseWidth * scale;
      const scaledHeight = baseHeight * scale;
      
      setDimensions({ width: baseWidth, height: baseHeight });
      setScaledDimensions({ width: scaledWidth, height: scaledHeight, scale });
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions();

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { 
      alpha: false, // No transparency, better performance
      desynchronized: true // Better performance for animations
    });
    if (!ctx) return;

    // Disable antialiasing and smoothing
    ctx.imageSmoothingEnabled = false;
    
    // Try to disable browser-specific smoothing (with type assertion)
    const ctxAny = ctx as any;
    ctxAny.webkitImageSmoothingEnabled = false;
    ctxAny.mozImageSmoothingEnabled = false;
    ctxAny.msImageSmoothingEnabled = false;
    ctxAny.oImageSmoothingEnabled = false;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // With 854x480 resolution, allocate space for UI panels
    const uiPanelHeight = 120; // Reduced to fit better in 480px height
    const gameHeight = dimensions.height - uiPanelHeight;
    const tileWidth = dimensions.width / WORLD_WIDTH;
    const tileHeight = gameHeight / WORLD_HEIGHT;

    const render = () => {

    const drawMap = () => {
      // Early return if worldMap is empty or undefined
      if (!worldMap || worldMap.length === 0) {
        return;
      }

      worldMap.forEach((tile, index) => {
        // Skip if tile is undefined
        if (!tile) {
          return;
        }

        const x = index % WORLD_WIDTH;
        const y = Math.floor(index / WORLD_WIDTH);

        ctx.fillStyle = tile.visible ? tile.backgroundColor : 'black';
        ctx.fillRect(x * tileWidth, y * tileHeight, tileWidth, tileHeight);

        if (tile.visible || tile.explored) {
          ctx.fillStyle = tile.visible ? tile.color : '#282828';
          ctx.font = `${Math.min(tileWidth, tileHeight)}px Pixuf`;
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
      if (actors && actors.length > 0) {
        actors.forEach(actor => {
          const tile = worldMap[getIndexFromXY(actor.xCoord, actor.yCoord)];
          if (tile && tile.visible) {
            ctx.fillStyle = actor.charColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(actor.char, actor.xCoord * tileWidth + tileWidth / 2, actor.yCoord * tileHeight + tileHeight / 2);
          }
        });
      }

      // Draw items
      const { items } = ItemStore;
      if (items && items.length > 0) {
        items.forEach(item => {
            if (item.carriedBy === null) { // Only draw items on the ground
                const tile = worldMap[getIndexFromXY(item.xCoord, item.yCoord)];
                if (tile && tile.visible) {
                    ctx.fillStyle = item.color;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(item.char, item.xCoord * tileWidth + tileWidth / 2, item.yCoord * tileHeight + tileHeight / 2);
                }
            }
        });
      }
    };

    const drawStatPanel = () => {
      const statPanelY = gameHeight + 5;
      const statPanelHeight = 50; // Reduced height for fixed resolution
      
      // Draw stat panel background
      ctx.fillStyle = 'black';
      ctx.fillRect(5, statPanelY, dimensions.width - 10, statPanelHeight);
      
      // Draw stat panel border
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1;
      ctx.strokeRect(5, statPanelY, dimensions.width - 10, statPanelHeight);
      
      // Draw stat text
      ctx.fillStyle = 'white';
      ctx.font = '14px Pixuf'; // Slightly smaller font
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`Turn: ${turn}`, 10, statPanelY + 8);
    };

    const drawEventPanel = () => {
      const eventPanelY = gameHeight + 60; // Position right below stat panel
      const eventPanelHeight = 55; // Reduced height for fixed resolution
      
      // Draw event panel background
      ctx.fillStyle = 'black';
      ctx.fillRect(5, eventPanelY, dimensions.width - 10, eventPanelHeight);
      
      // Draw event panel border
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1;
      ctx.strokeRect(5, eventPanelY, dimensions.width - 10, eventPanelHeight);
      
      // Draw log messages
      ctx.font = '12px Pixuf'; // Smaller font to fit more text
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      
      // Only render log messages if they exist
      if (logMessages && logMessages.length > 0) {
        logMessages.slice(0, 3).forEach((messagesPerTurn, index) => { // Reduced to 3 messages
          if (messagesPerTurn && Array.isArray(messagesPerTurn)) {
            const opacity = index === 0 ? 1 : (3 - index) / 3;
            const gray = Math.floor(255 * opacity);
            ctx.fillStyle = index === 0 ? 'white' : `rgb(${gray}, ${gray}, ${gray})`;
            // Join the messages for this turn into a single string
            const combinedMessage = messagesPerTurn.join(' ');
            ctx.fillText(combinedMessage, 10, eventPanelY + 8 + (index * 15)); // Tighter line spacing
          }
        });
      }
    };

      // Clear canvas
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      
      // Draw everything
      drawMap();
      drawStatPanel();
      drawEventPanel();
    };

    // Ensure font is loaded before rendering
    document.fonts.ready.then(() => {
      render();
    });
  }, [worldMap, dimensions, turn, logMessages, scaledDimensions]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      width: '100vw',
      height: '100vh',
      backgroundColor: '#000',
      overflow: 'hidden'
    }}>
      <canvas 
        ref={canvasRef} 
        style={{ 
          width: `${scaledDimensions.width}px`,
          height: `${scaledDimensions.height}px`,
          imageRendering: 'pixelated',
          filter: 'none',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden'
        }} 
      />
    </div>
  );
};

export default GameView;