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

    // Set canvas internal resolution to match display size (no CSS scaling needed)
    canvas.width = scaledDimensions.width;
    canvas.height = scaledDimensions.height;

    // With 854x480 base resolution, allocate space for UI panels
    const uiPanelHeight = 120 * scaledDimensions.scale; // UI panels scaled
    const gameHeight = scaledDimensions.height - uiPanelHeight; // Game area scaled
    
    // Fixed 16x16 tile size, scaled up
    const tileSize = 16 * scaledDimensions.scale;
    const tilesX = Math.floor(scaledDimensions.width / tileSize);
    const tilesY = Math.floor(gameHeight / tileSize);
    
    // Center the game area if there's extra space
    const gameAreaWidth = tilesX * tileSize;
    const gameAreaHeight = tilesY * tileSize;
    const offsetX = (scaledDimensions.width - gameAreaWidth) / 2;
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
          ctx.fillStyle = visible ? '#bdaa97' : '#604b3d';
          ctx.fillRect(pixelX, pixelY, tileSize, tileSize);
          // Add some texture dots (scaled)
          ctx.fillStyle = visible ? '#d4c2b6' : '#735b42';
          for (let i = 0; i < 3; i++) {
            ctx.fillRect(pixelX + (2 + i * 5) * scaledDimensions.scale, pixelY + 8 * scaledDimensions.scale, scaledDimensions.scale, scaledDimensions.scale);
          }
          break;
          
        case 'wall':
          ctx.fillStyle = visible ? '#918d8d' : '#353540';
          ctx.fillRect(pixelX, pixelY, tileSize, tileSize);
          // Add brick pattern (scaled)
          ctx.fillStyle = visible ? '#636167' : '#4d3f38';
          for (let i = 0; i < 2; i++) {
            ctx.fillRect(pixelX, pixelY + i * 8 * scaledDimensions.scale, tileSize, scaledDimensions.scale);
            ctx.fillRect(pixelX + 8 * scaledDimensions.scale, pixelY + (4 + i * 8) * scaledDimensions.scale, tileSize - 8 * scaledDimensions.scale, scaledDimensions.scale);
          }
          break;
          
        case 'grass':
          ctx.fillStyle = visible ? '#8b9150' : '#446350';
          ctx.fillRect(pixelX, pixelY, tileSize, tileSize);
          // Add more natural grass pattern (scaled)
          ctx.fillStyle = visible ? '#bda351' : '#557d55';
          // Scattered grass blades of varying heights
          ctx.fillRect(pixelX + 2 * scaledDimensions.scale, pixelY + 10 * scaledDimensions.scale, scaledDimensions.scale, 6 * scaledDimensions.scale);
          ctx.fillRect(pixelX + 5 * scaledDimensions.scale, pixelY + 12 * scaledDimensions.scale, scaledDimensions.scale, 4 * scaledDimensions.scale);
          ctx.fillRect(pixelX + 8 * scaledDimensions.scale, pixelY + 9 * scaledDimensions.scale, scaledDimensions.scale, 7 * scaledDimensions.scale);
          ctx.fillRect(pixelX + 11 * scaledDimensions.scale, pixelY + 11 * scaledDimensions.scale, scaledDimensions.scale, 5 * scaledDimensions.scale);
          ctx.fillRect(pixelX + 14 * scaledDimensions.scale, pixelY + 13 * scaledDimensions.scale, scaledDimensions.scale, 3 * scaledDimensions.scale);
          // Add some darker grass for depth
          ctx.fillStyle = visible ? '#8b9150' : '#3e554c';
          ctx.fillRect(pixelX + 4 * scaledDimensions.scale, pixelY + 14 * scaledDimensions.scale, scaledDimensions.scale, 2 * scaledDimensions.scale);
          ctx.fillRect(pixelX + 9 * scaledDimensions.scale, pixelY + 13 * scaledDimensions.scale, scaledDimensions.scale, 3 * scaledDimensions.scale);
          break;
          
        case 'tree':
          ctx.fillStyle = visible ? '#8b9150' : '#446350';
          ctx.fillRect(pixelX, pixelY, tileSize, tileSize);
          // Tree trunk (scaled)
          ctx.fillStyle = visible ? '#86735b' : '#604b3d';
          ctx.fillRect(pixelX + 6 * scaledDimensions.scale, pixelY + 10 * scaledDimensions.scale, 4 * scaledDimensions.scale, 6 * scaledDimensions.scale);
          // Tree crown (scaled)
          ctx.fillStyle = visible ? '#557d55' : '#3e554c';
          ctx.fillRect(pixelX + 4 * scaledDimensions.scale, pixelY + 4 * scaledDimensions.scale, 8 * scaledDimensions.scale, 8 * scaledDimensions.scale);
          break;
          
        case 'bush':
          ctx.fillStyle = visible ? '#8b9150' : '#446350';
          ctx.fillRect(pixelX, pixelY, tileSize, tileSize);
          // Bush shape (scaled)
          ctx.fillStyle = visible ? '#557d55' : '#3e554c';
          ctx.fillRect(pixelX + 3 * scaledDimensions.scale, pixelY + 8 * scaledDimensions.scale, 10 * scaledDimensions.scale, 6 * scaledDimensions.scale);
          ctx.fillRect(pixelX + 5 * scaledDimensions.scale, pixelY + 6 * scaledDimensions.scale, 6 * scaledDimensions.scale, 4 * scaledDimensions.scale);
          break;
          
        case 'soil':
          ctx.fillStyle = visible ? '#86735b' : '#604b3d';
          ctx.fillRect(pixelX, pixelY, tileSize, tileSize);
          // Soil texture (scaled)
          ctx.fillStyle = visible ? '#bdaa97' : '#735b42';
          for (let i = 0; i < 8; i++) {
            ctx.fillRect(pixelX + ((i % 4) * 4 + 1) * scaledDimensions.scale, pixelY + (Math.floor(i / 4) * 8 + 3) * scaledDimensions.scale, 2 * scaledDimensions.scale, 2 * scaledDimensions.scale);
          }
          break;
          
        case 'stairsDown':
          ctx.fillStyle = visible ? '#bdaa97' : '#604b3d';
          ctx.fillRect(pixelX, pixelY, tileSize, tileSize);
          // Stairs going down (>) (scaled)
          ctx.fillStyle = visible ? '#ede4da' : '#bfb8b4';
          for (let i = 0; i < 8; i++) {
            ctx.fillRect(pixelX + (4 + i) * scaledDimensions.scale, pixelY + (4 + i) * scaledDimensions.scale, scaledDimensions.scale, scaledDimensions.scale);
            ctx.fillRect(pixelX + (4 + i) * scaledDimensions.scale, pixelY + (12 - i) * scaledDimensions.scale, scaledDimensions.scale, scaledDimensions.scale);
          }
          break;
          
        case 'stairsUp':
          ctx.fillStyle = visible ? '#bdaa97' : '#604b3d';
          ctx.fillRect(pixelX, pixelY, tileSize, tileSize);
          // Stairs going up (<) (scaled)
          ctx.fillStyle = visible ? '#ede4da' : '#bfb8b4';
          for (let i = 0; i < 8; i++) {
            ctx.fillRect(pixelX + (12 - i) * scaledDimensions.scale, pixelY + (4 + i) * scaledDimensions.scale, scaledDimensions.scale, scaledDimensions.scale);
            ctx.fillRect(pixelX + (12 - i) * scaledDimensions.scale, pixelY + (12 - i) * scaledDimensions.scale, scaledDimensions.scale, scaledDimensions.scale);
          }
          break;
          
        default:
          ctx.fillStyle = '#a94949'; // Red from palette for unknown tiles
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
        
        // Player sprite (simple @ character as 16x16 pixels, scaled)
        ctx.fillStyle = '#e8c65b'; // Yellow from palette for player
        ctx.fillRect(pixelX + 4 * scaledDimensions.scale, pixelY + 2 * scaledDimensions.scale, 8 * scaledDimensions.scale, 6 * scaledDimensions.scale); // Head
        ctx.fillRect(pixelX + 6 * scaledDimensions.scale, pixelY + 8 * scaledDimensions.scale, 4 * scaledDimensions.scale, 8 * scaledDimensions.scale); // Body
        ctx.fillRect(pixelX + 3 * scaledDimensions.scale, pixelY + 10 * scaledDimensions.scale, 3 * scaledDimensions.scale, 6 * scaledDimensions.scale); // Left arm
        ctx.fillRect(pixelX + 10 * scaledDimensions.scale, pixelY + 10 * scaledDimensions.scale, 3 * scaledDimensions.scale, 6 * scaledDimensions.scale); // Right arm
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
              
              // Simple actor sprite (scaled)
              ctx.fillStyle = actor.charColor;
              ctx.fillRect(pixelX + 5 * scaledDimensions.scale, pixelY + 3 * scaledDimensions.scale, 6 * scaledDimensions.scale, 5 * scaledDimensions.scale); // Head
              ctx.fillRect(pixelX + 6 * scaledDimensions.scale, pixelY + 8 * scaledDimensions.scale, 4 * scaledDimensions.scale, 6 * scaledDimensions.scale); // Body
              ctx.fillRect(pixelX + 4 * scaledDimensions.scale, pixelY + 10 * scaledDimensions.scale, 2 * scaledDimensions.scale, 4 * scaledDimensions.scale); // Left leg
              ctx.fillRect(pixelX + 10 * scaledDimensions.scale, pixelY + 10 * scaledDimensions.scale, 2 * scaledDimensions.scale, 4 * scaledDimensions.scale); // Right leg
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
                        
                        // Simple item sprite (small square, scaled)
                        ctx.fillStyle = item.color;
                        ctx.fillRect(pixelX + 6 * scaledDimensions.scale, pixelY + 10 * scaledDimensions.scale, 4 * scaledDimensions.scale, 4 * scaledDimensions.scale);
                    }
                }
            }
        });
      }
    };

    const drawStatPanel = () => {
      const statPanelY = gameHeight + (5 * scaledDimensions.scale);
      const statPanelHeight = 50 * scaledDimensions.scale; // Scaled height
      
      // Draw stat panel background
      ctx.fillStyle = '#353540';
      ctx.fillRect(5 * scaledDimensions.scale, statPanelY, scaledDimensions.width - (10 * scaledDimensions.scale), statPanelHeight);
      
      // Draw stat panel border
      ctx.strokeStyle = '#bfb8b4';
      ctx.lineWidth = scaledDimensions.scale;
      ctx.strokeRect(5 * scaledDimensions.scale, statPanelY, scaledDimensions.width - (10 * scaledDimensions.scale), statPanelHeight);
      
      // Draw stat text
      ctx.fillStyle = '#ede4da';
      ctx.font = `${Math.round(baseFontSize * 0.8)}px Pixuf`; // Proportional to tile size
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`Turn: ${turn}`, 10 * scaledDimensions.scale, statPanelY + (8 * scaledDimensions.scale));
    };

    const drawEventPanel = () => {
      const eventPanelY = gameHeight + (60 * scaledDimensions.scale); // Position right below stat panel
      const eventPanelHeight = 55 * scaledDimensions.scale; // Scaled height
      
      // Draw event panel background
      ctx.fillStyle = '#353540';
      ctx.fillRect(5 * scaledDimensions.scale, eventPanelY, scaledDimensions.width - (10 * scaledDimensions.scale), eventPanelHeight);
      
      // Draw event panel border
      ctx.strokeStyle = '#bfb8b4';
      ctx.lineWidth = scaledDimensions.scale;
      ctx.strokeRect(5 * scaledDimensions.scale, eventPanelY, scaledDimensions.width - (10 * scaledDimensions.scale), eventPanelHeight);
      
      // Draw log messages
      ctx.font = `${Math.round(baseFontSize * 0.7)}px Pixuf`; // Proportional to tile size, smaller for logs
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      
      // Only render log messages if they exist
      if (logMessages && logMessages.length > 0) {
        logMessages.slice(0, 3).forEach((messagesPerTurn, index) => { // Reduced to 3 messages
          if (messagesPerTurn && Array.isArray(messagesPerTurn)) {
            // Use palette colors for text fading
            const textColors = ['#ede4da', '#bfb8b4', '#918d8d'];
            ctx.fillStyle = textColors[index] || '#636167';
            // Join the messages for this turn into a single string
            const combinedMessage = messagesPerTurn.join(' ');
            ctx.fillText(combinedMessage, 10 * scaledDimensions.scale, eventPanelY + (8 * scaledDimensions.scale) + (index * 15 * scaledDimensions.scale)); // Scaled spacing
          }
        });
      }
    };

      // Clear canvas
      ctx.clearRect(0, 0, scaledDimensions.width, scaledDimensions.height);
      
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