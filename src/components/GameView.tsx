import React, { useRef, useEffect, useState } from 'react';
import { TileType } from "../scripts/world/tileTypes";
import { WORLD_WIDTH, WORLD_HEIGHT } from "../scripts/game";
import { getIndexFromXY } from "../utils/utils";
import PlayerStore from "../store/PlayerStore";
import ActorStore from "../store/ActorStore";
import ItemStore from '../store/ItemStore';
import tilesetImage from '../assets/LoBit Overworld sorted.png';
import foliageTilesetImage from '../assets/LoBit Basic foliage.png';

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
  const [tilesetLoaded, setTilesetLoaded] = useState(false);
  const [foliageTilesetLoaded, setFoliageTilesetLoaded] = useState(false);
  const tilesetRef = useRef<HTMLImageElement | null>(null);
  const foliageTilesetRef = useRef<HTMLImageElement | null>(null);
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
      // Base resolution: 427 × 240 (half of 854×480 for larger tiles/text)
      const baseWidth = 427;
      const baseHeight = 240;
      
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

    // Load main tileset image
    const tileset = new Image();
    tileset.onload = () => {
      console.log('Main tileset loaded successfully:', tileset.width, 'x', tileset.height);
      tilesetRef.current = tileset;
      setTilesetLoaded(true);
    };
    tileset.onerror = (error) => {
      console.error('Failed to load main tileset image:', error);
      console.error('Attempted path:', tilesetImage);
    };
    tileset.src = tilesetImage;

    // Load foliage tileset image
    const foliageTileset = new Image();
    foliageTileset.onload = () => {
      console.log('Foliage tileset loaded successfully:', foliageTileset.width, 'x', foliageTileset.height);
      foliageTilesetRef.current = foliageTileset;
      setFoliageTilesetLoaded(true);
    };
    foliageTileset.onerror = (error) => {
      console.error('Failed to load foliage tileset image:', error);
      console.error('Attempted path:', foliageTilesetImage);
    };
    foliageTileset.src = foliageTilesetImage;
  }, []);

  // Smooth camera animation system
  useEffect(() => {
    if (!worldMap || worldMap.length === 0 || !fontsReady || !tilesetLoaded || !foliageTilesetLoaded) return;

    const { playerCoords } = PlayerStore;
    const gameHeight = dimensions.height - 66; // Updated to match main rendering
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
    if (!canvas || !fontsReady || !tilesetLoaded || !foliageTilesetLoaded) return;

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

    // With 427x240 base resolution, allocate space for UI panels
    const uiPanelHeight = 66 * scaledDimensions.scale; // UI panels scaled (adjusted for balanced padding)
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
      
      // Don't draw if outside visible screen area (with 1-tile buffer for smooth scrolling)
      if (screenX < -1 || screenX > tilesX + 1 || screenY < -1 || screenY > tilesY + 1) return;
      
      // Round to whole pixels to prevent gaps between tiles
      const pixelX = Math.round(offsetX + screenX * tileSize);
      const pixelY = Math.round(offsetY + screenY * tileSize);
      
      if (!visible && !explored) {
        // Unexplored - draw black
        ctx.fillStyle = '#000000';
        ctx.fillRect(pixelX, pixelY, tileSize, tileSize);
        return;
      }
      
      const tileset = tilesetRef.current;
      if (!tileset) return;
      
      // Get sprite coordinates from tileset (20 tiles wide, 16px each)
      let spriteX = 0, spriteY = 0;
      
      switch (tileType) {
        case 'grass':
          // Use foliage tileset - row 6, tiles 1-8 (deterministic based on position)
          const grassVariant = ((worldX * 3 + worldY * 5) % 8) + 1; // Tiles 1-8
          spriteX = (grassVariant - 1) * 16; // Convert to pixel position (0, 16, 32, 48, 64, 80, 96, 112)
          spriteY = 5 * 16; // Row 6 (0-indexed = row 5, so 5 * 16 = 80)
          break;
        case 'soil':
          // Deterministic variant based on world position
          if ((worldX + worldY) % 2 === 0) {
            spriteX = 160; // 11th tile (10 * 16) - row 1
            spriteY = 0; // First row (0 * 16)
          } else {
            spriteX = 192; // 13th tile (12 * 16) - row 1
            spriteY = 0; // First row (0 * 16)
          }
          break;
        case 'tree':
          // Deterministic variant based on world position
          if ((worldX * 7 + worldY * 11) % 2 === 0) {
            spriteX = 112; // 8th tile (7 * 16) - row 2
            spriteY = 16; // Second row (1 * 16)
          } else {
            spriteX = 128; // 9th tile (8 * 16) - row 1
            spriteY = 0; // First row (0 * 16)
          }
          break;
        case 'bush':
          spriteX = 80; // 6th tile (5 * 16)
          spriteY = 0; // First row (0 * 16)
          break;
        case 'stairsDown':
          spriteX = 80; // 6th tile (5 * 16)
          spriteY = 448; // Row 29 (28 * 16)
          break;
        case 'floor':
          // Use a generic floor tile - using soil for now
          spriteX = 160; // 11th tile
          spriteY = 0; // First row
          break;
        case 'wall':
          // Use second tile as wall for now
          spriteX = 16; // 2nd tile (1 * 16)
          spriteY = 0; // First row (0 * 16)
          break;
        case 'stairsUp':
          // Use same as stairs down for now
          spriteX = 80; // 6th tile
          spriteY = 448; // Row 29
          break;
        default:
          // Default to first tile
          spriteX = 0;
          spriteY = 0;
      }
      
      // Apply dimming for explored but not visible tiles
      if (!visible && explored) {
        ctx.globalAlpha = 0.5;
      } else {
        ctx.globalAlpha = 1.0;
      }
      
      // Ensure pixel-perfect rendering for sprites (disable all smoothing)
      ctx.imageSmoothingEnabled = false;
      (ctx as any).webkitImageSmoothingEnabled = false;
      (ctx as any).mozImageSmoothingEnabled = false;
      (ctx as any).msImageSmoothingEnabled = false;
      
      // Choose the correct tileset based on tile type
      const currentTileset = tileType === 'grass' ? foliageTilesetRef.current : tileset;
      if (!currentTileset) return;
      
      // Draw the sprite from appropriate tileset, scaling from 16x16 to current tile size
      ctx.drawImage(
        currentTileset,
        spriteX, spriteY, 16, 16, // Source: 16x16 from tileset
        pixelX, pixelY, tileSize, tileSize // Destination: scaled tile size
      );
      
      // Reset alpha
      ctx.globalAlpha = 1.0;
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
      const statPanelY = gameHeight + (2 * scaledDimensions.scale);
      const statPanelHeight = 28 * scaledDimensions.scale; // Increased height for more bottom padding
      
      // Draw stat panel background
      ctx.fillStyle = '#353540';
      ctx.fillRect(5 * scaledDimensions.scale, statPanelY, scaledDimensions.width - (10 * scaledDimensions.scale), statPanelHeight);
      
      // Draw stat panel border
      ctx.strokeStyle = '#bfb8b4';
      ctx.lineWidth = scaledDimensions.scale;
      ctx.strokeRect(5 * scaledDimensions.scale, statPanelY, scaledDimensions.width - (10 * scaledDimensions.scale), statPanelHeight);
      
      // Draw stat text with more padding
      ctx.fillStyle = '#ede4da';
      ctx.font = `${Math.round(baseFontSize * 0.6)}px Pixuf`; // Smaller, consistent font size
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`Turn: ${turn}`, 10 * scaledDimensions.scale, statPanelY + (5 * scaledDimensions.scale));
    };

    const drawEventPanel = () => {
      const eventPanelY = gameHeight + (32 * scaledDimensions.scale); // Moved down slightly for stat panel height increase
      const eventPanelHeight = 32 * scaledDimensions.scale; // Slightly increased height for better balance
      
      // Draw event panel background
      ctx.fillStyle = '#353540';
      ctx.fillRect(5 * scaledDimensions.scale, eventPanelY, scaledDimensions.width - (10 * scaledDimensions.scale), eventPanelHeight);
      
      // Draw event panel border
      ctx.strokeStyle = '#bfb8b4';
      ctx.lineWidth = scaledDimensions.scale;
      ctx.strokeRect(5 * scaledDimensions.scale, eventPanelY, scaledDimensions.width - (10 * scaledDimensions.scale), eventPanelHeight);
      
      // Draw log messages with more padding
      ctx.font = `${Math.round(baseFontSize * 0.6)}px Pixuf`; // Same font size as stat panel
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
            ctx.fillText(combinedMessage, 10 * scaledDimensions.scale, eventPanelY + (4 * scaledDimensions.scale) + (index * 8 * scaledDimensions.scale)); // Slightly increased top padding
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