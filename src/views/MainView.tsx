import { useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import { EventPanel } from "../components/EventPanel";
import { WorldMap } from "../components/WorldMap";
import GameStore from "../store/GameStore";
import { tryMoveActor } from "../scripts/actors/movement";
import { createWorldMap} from "../scripts/world/mapCreator";
import { TileType } from "../scripts/world/tileTypes";
import { checkForRandomEvent } from "../scripts/world/randomEvents";
import { StatPanel } from "../components/StatPanel";
import { handleKeyPress } from "../scripts/player/handleKeyPress";
import { populate } from "../scripts/actors/populate";
// import ModalWindow from "../components/ModalWindow";
import PlayerStore from "../store/PlayerStore";
import { updatePlayerFOV } from "../scripts/player/fov";
import { movementKeys } from "../scripts/player/handleKeyPress";
import { observer } from "mobx-react-lite";
import { reaction } from "mobx";

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  box-sizing: border-box;
`;

const UIContainer = styled.div`
  width: 100%;
`;

const MainView = observer(() => {
    const [currentWorldMap, setCurrentWorldMap] = useState<TileType[]>([]);
    const [turn, setTurn] = useState(0);
    // const [modalOpen, setModalOpen] = useState(false);

    const { playerIsCaught } = PlayerStore;
    const generateNewWorld = useCallback((mapType: 'tunnels' | 'forest' | 'cave' = 'tunnels') => {
        createWorldMap(mapType);
        populate();
        const { worldMap } = GameStore;
        setCurrentWorldMap(worldMap);
        updatePlayerFOV();
    }, []);

    useEffect(() => {
        const disposer = reaction(
          () => GameStore.worldMap,
          (newWorldMap) => {
            setCurrentWorldMap(newWorldMap);
          }
        );
      
        return () => disposer();
    }, []);

    // create world map on first render
    useEffect(() => {
        generateNewWorld();
    }, [generateNewWorld]);

    // listen keypresses
    useEffect(() => {
        const { addCompleteLogMessage } = GameStore;
        const keyPress = (event: KeyboardEvent) => {
            if (event.repeat) {
                return;
            }
            const key = event.key;

            // Save map with Ctrl + S
            if (event.ctrlKey && key.toLowerCase() === 's') {
                event.preventDefault();
                const mapName = `Map ${new Date().toLocaleString()}`;
                GameStore.saveCurrentMap(mapName);
                GameStore.addLogMessage(`Map saved as: ${mapName}`);
                addCompleteLogMessage();
                return;
            }

            // Load last saved map with Ctrl + L
            if (event.ctrlKey && key.toLowerCase() === 'l') {
                event.preventDefault();
                const savedMaps = GameStore.getAllSavedMaps();
                if (savedMaps.length > 0) {
                    const lastMap = savedMaps[savedMaps.length - 1];
                    GameStore.loadMap(lastMap.id);
                    GameStore.addLogMessage(`Loaded map: ${lastMap.name}`);
                    addCompleteLogMessage();
                    updatePlayerFOV();
                }
                return;
            }

            if (movementKeys.includes(key)) {
                handleKeyPress(key);
                setTurn(turn + 1);
                checkForRandomEvent();
                addCompleteLogMessage();
                tryMoveActor();
            } else if (key.toLowerCase() === "p") {
                setCurrentWorldMap(prevMap => 
                    prevMap.map(tile => ({ ...tile, visible: true }))
                );
            } else if (key === "F") {
                generateNewWorld('forest');
                setCurrentWorldMap(prevMap => 
                    prevMap.map(tile => ({ ...tile, visible: true }))
                );
                setTurn(0);
            } else if (key === "C") {
                generateNewWorld('cave');
                setCurrentWorldMap(prevMap => 
                    prevMap.map(tile => ({ ...tile, visible: true }))
                );
                setTurn(0);
            } else if (key === "T") {
                generateNewWorld('tunnels');
                setCurrentWorldMap(prevMap => 
                    prevMap.map(tile => ({ ...tile, visible: true }))
                );
                setTurn(0);
            } else {
                setTurn(turn + 1);
                checkForRandomEvent();
                addCompleteLogMessage();
                tryMoveActor();
            }
        };

        window.addEventListener("keydown", keyPress);

        return () => window.removeEventListener("keydown", keyPress);
    }, [turn, playerIsCaught, generateNewWorld]);

    return (
        <MainContainer>
            <WorldMap worldMap={currentWorldMap} />
            <UIContainer>
                <StatPanel turn={turn} />
                <EventPanel />
            </UIContainer>
            {/* <ModalWindow
                open={modalOpen}
                onClose={() => setModalOpen(false)}
              
            /> */}
        </MainContainer>
    );
});

export default MainView;