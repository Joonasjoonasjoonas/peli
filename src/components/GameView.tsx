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
  const [fontsReady, setFontsReady] = useState(false);
  const [renderTrigger, setRenderTrigger] = useState(0); // For triggering re-renders during animation
  const cameraPositionRef = useRef({ x: 0, y: 0 }); // Current smooth camera position
  const targetCameraRef = useRef({ x: 0, y: 0 }); // Target camera position
  const animationFrameRef = useRef<number | null>(null);
  
  // Character animation system
  const playerAnimationRef = useRef({ 
    currentX: 0, currentY: 0, 
    targetX: 0, targetY: 0, 
    isAnimating: false 
  });
  const actorAnimationsRef = useRef<Map<number, {
    currentX: number, currentY: number,
    targetX: number, targetY: number,
    isAnimating: boolean
  }>>(new Map());

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

  // Preload fonts
  useEffect(() => {
    document.fonts.ready.then(() => {
      setFontsReady(true);
    });
  }, []);

  // Smooth camera animation system
  useEffect(() => {
    if (!worldMap || worldMap.length === 0 || !fontsReady) return;

    const { playerCoords } = PlayerStore;
    const gameHeight = dimensions.height - 120;
    const tileSize = 16;
    const tilesX = Math.floor(dimensions.width / tileSize);
    const tilesY = Math.floor(gameHeight / tileSize);

    // Calculate target camera position
    let targetX = playerCoords.x - Math.floor(tilesX / 2);
    let targetY = playerCoords.y - Math.floor(tilesY / 2);

    // Clamp target to world boundaries
    targetX = Math.max(0, Math.min(targetX, WORLD_WIDTH - tilesX));
    targetY = Math.max(0, Math.min(targetY, WORLD_HEIGHT - tilesY));

    // Update target camera position
    targetCameraRef.current = { x: targetX, y: targetY };

    // Initialize camera position if this is the first time
    if (cameraPositionRef.current.x === 0 && cameraPositionRef.current.y === 0) {
      cameraPositionRef.current = { x: targetX, y: targetY };
    }

    // Start smooth animation for camera and characters
    const animateAll = () => {
      let needsAnimation = false;
      
      // Animate camera
      const current = cameraPositionRef.current;
      const target = targetCameraRef.current;
      const cameraLerpFactor = 0.15;
      
      const cameraDeltaX = target.x - current.x;
      const cameraDeltaY = target.y - current.y;
      
      if (Math.abs(cameraDeltaX) >= 0.01 || Math.abs(cameraDeltaY) >= 0.01) {
        cameraPositionRef.current = {
          x: current.x + cameraDeltaX * cameraLerpFactor,
          y: current.y + cameraDeltaY * cameraLerpFactor
        };
        needsAnimation = true;
      } else {
        cameraPositionRef.current = { x: target.x, y: target.y };
      }
      
      // Animate player
      const playerAnim = playerAnimationRef.current;
      const characterLerpFactor = 0.25; // Faster than camera for snappy movement
      
      if (playerAnim.isAnimating) {
        const playerDeltaX = playerAnim.targetX - playerAnim.currentX;
        const playerDeltaY = playerAnim.targetY - playerAnim.currentY;
        
        if (Math.abs(playerDeltaX) >= 0.01 || Math.abs(playerDeltaY) >= 0.01) {
          playerAnim.currentX += playerDeltaX * characterLerpFactor;
          playerAnim.currentY += playerDeltaY * characterLerpFactor;
          needsAnimation = true;
        } else {
          playerAnim.currentX = playerAnim.targetX;
          playerAnim.currentY = playerAnim.targetY;
          playerAnim.isAnimating = false;
        }
      }
      
      // Animate actors
      const actorAnimations = actorAnimationsRef.current;
      actorAnimations.forEach((actorAnim, actorId) => {
        if (actorAnim.isAnimating) {
          const actorDeltaX = actorAnim.targetX - actorAnim.currentX;
          const actorDeltaY = actorAnim.targetY - actorAnim.currentY;
          
          if (Math.abs(actorDeltaX) >= 0.01 || Math.abs(actorDeltaY) >= 0.01) {
            actorAnim.currentX += actorDeltaX * characterLerpFactor;
            actorAnim.currentY += actorDeltaY * characterLerpFactor;
            needsAnimation = true;
          } else {
            actorAnim.currentX = actorAnim.targetX;
            actorAnim.currentY = actorAnim.targetY;
            actorAnim.isAnimating = false;
          }
        }
      });
      
      // Trigger re-render if any animation is active
      if (needsAnimation) {
        setRenderTrigger(prev => prev + 1);
        animationFrameRef.current = requestAnimationFrame(animateAll);
      }
    };

    // Cancel previous animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Start new animation
    animationFrameRef.current = requestAnimationFrame(animateAll);

    // Cleanup on unmount
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [worldMap, dimensions, PlayerStore.playerCoords, fontsReady]);

  // Track player position changes for smooth movement
  useEffect(() => {
    const { playerCoords } = PlayerStore;
    const playerAnim = playerAnimationRef.current;
    
    // Initialize on first load
    if (playerAnim.currentX === 0 && playerAnim.currentY === 0) {
      playerAnim.currentX = playerCoords.x;
      playerAnim.currentY = playerCoords.y;
      playerAnim.targetX = playerCoords.x;
      playerAnim.targetY = playerCoords.y;
      return;
    }
    
    // Check if player position changed
    if (playerCoords.x !== playerAnim.targetX || playerCoords.y !== playerAnim.targetY) {
      playerAnim.targetX = playerCoords.x;
      playerAnim.targetY = playerCoords.y;
      playerAnim.isAnimating = true;
    }
  }, [PlayerStore.playerCoords]);

  // Track actor position changes for smooth movement
  useEffect(() => {
    const { actors } = ActorStore;
    const actorAnimations = actorAnimationsRef.current;
    
    actors.forEach(actor => {
      if (!actor.id) return;
      
      let actorAnim = actorAnimations.get(actor.id);
      
      // Initialize new actors
      if (!actorAnim) {
        actorAnim = {
          currentX: actor.xCoord,
          currentY: actor.yCoord,
          targetX: actor.xCoord,
          targetY: actor.yCoord,
          isAnimating: false
        };
        actorAnimations.set(actor.id, actorAnim);
        return;
      }
      
      // Check if actor position changed
      if (actor.xCoord !== actorAnim.targetX || actor.yCoord !== actorAnim.targetY) {
        actorAnim.targetX = actor.xCoord;
        actorAnim.targetY = actor.yCoord;
        actorAnim.isAnimating = true;
      }
    });
    
    // Clean up removed actors
    const currentActorIds = new Set(actors.map(a => a.id).filter(id => id !== null));
    actorAnimations.forEach((actorAnim, actorId) => {
      if (!currentActorIds.has(actorId)) {
        actorAnimations.delete(actorId);
      }
    });
  }, [ActorStore.actors]);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !fontsReady) return;

    const ctx = canvas.getContext('2d', { 
      alpha: false, // No transparency, better performance
      desynchronized: true // Better performance for animations
    });
    if (!ctx) return;

    // Disable antialiasing and smoothing aggressively
    ctx.imageSmoothingEnabled = false;
    
    // Try to disable browser-specific smoothing (with type assertion)
    const ctxAny = ctx as any;
    ctxAny.webkitImageSmoothingEnabled = false;
    ctxAny.mozImageSmoothingEnabled = false;
    ctxAny.msImageSmoothingEnabled = false;
    ctxAny.oImageSmoothingEnabled = false;
    
    // Set image smoothing quality to lowest (forces nearest neighbor)
    if (ctx.imageSmoothingQuality) {
      ctx.imageSmoothingQuality = 'low';
    }
    
    // Disable text antialiasing
    ctxAny.textRenderingOptimization = 'optimizeSpeed';
    ctxAny.textBaseline = 'top';

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // With 854x480 resolution, allocate space for UI panels
    const uiPanelHeight = 120; // UI panels take 120px of the 480px total height
    const gameHeight = dimensions.height - uiPanelHeight; // Game area is 360px (480-120)
    
    // Fixed 16x16 tile size
    const tileSize = 16;
    const tilesX = Math.floor(dimensions.width / tileSize);
    const tilesY = Math.floor(gameHeight / tileSize);
    
    // Center the game area if there's extra space
    const gameAreaWidth = tilesX * tileSize;
    const gameAreaHeight = tilesY * tileSize;
    const offsetX = (dimensions.width - gameAreaWidth) / 2;
    const offsetY = (gameHeight - gameAreaHeight) / 2;

    const render = () => {
      // Use smooth camera position
      const currentCameraOffset = cameraPositionRef.current;
      
      // Calculate base font size from tile size for consistent scaling
      const baseFontSize = tileSize * 0.8; // Font should be smaller than tile size

    // Function to draw 16x16 pixel tiles
    const drawTile = (tileType: string, worldX: number, worldY: number, visible: boolean, explored: boolean) => {
      // Convert world coordinates to screen coordinates using camera offset
      const screenX = worldX - currentCameraOffset.x;
      const screenY = worldY - currentCameraOffset.y;
      
      // Don't draw if outside visible screen area
      if (screenX < 0 || screenX >= tilesX || screenY < 0 || screenY >= tilesY) return;
      
      // Round to whole pixels to prevent gaps between tiles
      const pixelX = Math.round(offsetX + screenX * tileSize);
      const pixelY = Math.round(offsetY + screenY * tileSize);
      
      if (!visible && !explored) {
        // Unexplored - draw black
        ctx.fillStyle = '#000000';
        ctx.fillRect(pixelX, pixelY, tileSize, tileSize);
        return;
      }
      
      const alpha = visible ? 1.0 : 0.5; // Dim explored but not visible tiles
      
      switch (tileType) {
        case 'floor':
          ctx.fillStyle = visible ? '#8B4513' : '#2D1B0A';
          ctx.fillRect(pixelX, pixelY, tileSize, tileSize);
          // Add some texture dots
          ctx.fillStyle = visible ? '#A0522D' : '#3D2B1A';
          for (let i = 0; i < 3; i++) {
            ctx.fillRect(pixelX + 2 + i * 5, pixelY + 8, 1, 1);
          }
          break;
          
        case 'wall':
          ctx.fillStyle = visible ? '#808080' : '#404040';
          ctx.fillRect(pixelX, pixelY, tileSize, tileSize);
          // Add brick pattern
          ctx.fillStyle = visible ? '#606060' : '#303030';
          for (let i = 0; i < 2; i++) {
            ctx.fillRect(pixelX, pixelY + i * 8, tileSize, 1);
            ctx.fillRect(pixelX + 8, pixelY + 4 + i * 8, tileSize - 8, 1);
          }
          break;
          
        case 'grass':
          ctx.fillStyle = visible ? '#228B22' : '#114411';
          ctx.fillRect(pixelX, pixelY, tileSize, tileSize);
          // Add grass blades
          ctx.fillStyle = visible ? '#32CD32' : '#196619';
          for (let i = 0; i < 4; i++) {
            ctx.fillRect(pixelX + 2 + i * 3, pixelY + 12, 1, 4);
          }
          break;
          
        case 'tree':
          ctx.fillStyle = visible ? '#228B22' : '#114411';
          ctx.fillRect(pixelX, pixelY, tileSize, tileSize);
          // Tree trunk
          ctx.fillStyle = visible ? '#8B4513' : '#452209';
          ctx.fillRect(pixelX + 6, pixelY + 10, 4, 6);
          // Tree crown
          ctx.fillStyle = visible ? '#00FF00' : '#008000';
          ctx.fillRect(pixelX + 4, pixelY + 4, 8, 8);
          break;
          
        case 'bush':
          ctx.fillStyle = visible ? '#228B22' : '#114411';
          ctx.fillRect(pixelX, pixelY, tileSize, tileSize);
          // Bush shape
          ctx.fillStyle = visible ? '#006400' : '#003200';
          ctx.fillRect(pixelX + 3, pixelY + 8, 10, 6);
          ctx.fillRect(pixelX + 5, pixelY + 6, 6, 4);
          break;
          
        case 'soil':
          ctx.fillStyle = visible ? '#8B4513' : '#452209';
          ctx.fillRect(pixelX, pixelY, tileSize, tileSize);
          // Soil texture
          ctx.fillStyle = visible ? '#A0522D' : '#502916';
          for (let i = 0; i < 8; i++) {
            ctx.fillRect(pixelX + (i % 4) * 4 + 1, pixelY + Math.floor(i / 4) * 8 + 3, 2, 2);
          }
          break;
          
        case 'stairsDown':
          ctx.fillStyle = visible ? '#8B4513' : '#452209';
          ctx.fillRect(pixelX, pixelY, tileSize, tileSize);
          // Stairs going down (>)
          ctx.fillStyle = visible ? '#FFFFFF' : '#808080';
          for (let i = 0; i < 8; i++) {
            ctx.fillRect(pixelX + 4 + i, pixelY + 4 + i, 1, 1);
            ctx.fillRect(pixelX + 4 + i, pixelY + 12 - i, 1, 1);
          }
          break;
          
        case 'stairsUp':
          ctx.fillStyle = visible ? '#8B4513' : '#452209';
          ctx.fillRect(pixelX, pixelY, tileSize, tileSize);
          // Stairs going up (<)
          ctx.fillStyle = visible ? '#FFFFFF' : '#808080';
          for (let i = 0; i < 8; i++) {
            ctx.fillRect(pixelX + 12 - i, pixelY + 4 + i, 1, 1);
            ctx.fillRect(pixelX + 12 - i, pixelY + 12 - i, 1, 1);
          }
          break;
          
        default:
          ctx.fillStyle = '#FF00FF'; // Magenta for unknown tiles
          ctx.fillRect(pixelX, pixelY, tileSize, tileSize);
      }
    };

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

        drawTile(tile.type, x, y, tile.visible, tile.explored);
      });

      // Draw player using animated position
      const playerAnim = playerAnimationRef.current;
      const playerScreenX = playerAnim.currentX - currentCameraOffset.x;
      const playerScreenY = playerAnim.currentY - currentCameraOffset.y;
      
      // Only draw player if they're visible on screen
      if (playerScreenX >= 0 && playerScreenX < tilesX && playerScreenY >= 0 && playerScreenY < tilesY) {
        const pixelX = Math.round(offsetX + playerScreenX * tileSize);
        const pixelY = Math.round(offsetY + playerScreenY * tileSize);
        
        // Player sprite (simple @ character as 16x16 pixels)
        ctx.fillStyle = '#FFFF00'; // Yellow player
        ctx.fillRect(pixelX + 4, pixelY + 2, 8, 6); // Head
        ctx.fillRect(pixelX + 6, pixelY + 8, 4, 8); // Body
        ctx.fillRect(pixelX + 3, pixelY + 10, 3, 6); // Left arm
        ctx.fillRect(pixelX + 10, pixelY + 10, 3, 6); // Right arm
      }

      // Draw actors using animated positions
      const { actors } = ActorStore;
      const actorAnimations = actorAnimationsRef.current;
      if (actors && actors.length > 0) {
        actors.forEach(actor => {
          if (!actor.id) return;
          
          const actorAnim = actorAnimations.get(actor.id);
          if (!actorAnim) return;
          
          const actorScreenX = actorAnim.currentX - currentCameraOffset.x;
          const actorScreenY = actorAnim.currentY - currentCameraOffset.y;
          
          // Only draw actors if they're visible on screen
          if (actorScreenX >= 0 && actorScreenX < tilesX && actorScreenY >= 0 && actorScreenY < tilesY) {
            // Use actual position for visibility check (not animated position)
            const tile = worldMap[getIndexFromXY(actor.xCoord, actor.yCoord)];
            if (tile && tile.visible) {
              const pixelX = Math.round(offsetX + actorScreenX * tileSize);
              const pixelY = Math.round(offsetY + actorScreenY * tileSize);
              
              // Simple actor sprite
              ctx.fillStyle = actor.charColor;
              ctx.fillRect(pixelX + 5, pixelY + 3, 6, 5); // Head
              ctx.fillRect(pixelX + 6, pixelY + 8, 4, 6); // Body
              ctx.fillRect(pixelX + 4, pixelY + 10, 2, 4); // Left leg
              ctx.fillRect(pixelX + 10, pixelY + 10, 2, 4); // Right leg
            }
          }
        });
      }

      // Draw items
      const { items } = ItemStore;
      if (items && items.length > 0) {
        items.forEach(item => {
            if (item.carriedBy === null) { // Only draw items on the ground
                const itemScreenX = item.xCoord - currentCameraOffset.x;
                const itemScreenY = item.yCoord - currentCameraOffset.y;
                
                // Only draw items if they're visible on screen
                if (itemScreenX >= 0 && itemScreenX < tilesX && itemScreenY >= 0 && itemScreenY < tilesY) {
                    const tile = worldMap[getIndexFromXY(item.xCoord, item.yCoord)];
                    if (tile && tile.visible) {
                        const pixelX = Math.round(offsetX + itemScreenX * tileSize);
                        const pixelY = Math.round(offsetY + itemScreenY * tileSize);
                        
                        // Simple item sprite (small square)
                        ctx.fillStyle = item.color;
                        ctx.fillRect(pixelX + 6, pixelY + 10, 4, 4);
                    }
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
      ctx.font = `${Math.round(baseFontSize * 0.8)}px Pixuf`; // Proportional to tile size
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
      ctx.font = `${Math.round(baseFontSize * 0.7)}px Pixuf`; // Proportional to tile size, smaller for logs
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
    // Simple synchronous render - fonts should be loaded by now
    render();
  }, [worldMap, dimensions, turn, logMessages, scaledDimensions, fontsReady, renderTrigger]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      width: '100vw',
      height: '100vh',
      backgroundColor: '#000',
      overflow: 'hidden',
      imageRendering: 'pixelated',
      fontSmooth: 'never',
      WebkitFontSmoothing: 'none',
      MozOsxFontSmoothing: 'unset'
    } as React.CSSProperties & {
      fontSmooth?: string;
      WebkitFontSmoothing?: string;
      MozOsxFontSmoothing?: string;
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
        } as React.CSSProperties} 
      />
    </div>
  );
};

export default GameView;