import { useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import { EventPanel } from "../components/EventPanel";
import { WorldMap } from "../components/WorldMap";
import GameStore from "../store/GameStore";
import { TileType } from "../scripts/world/tileTypes";
import { StatPanel } from "../components/StatPanel";
import { generateNewWorld, handleKeyboardEvent } from "../scripts/player/handleKeyPress";
// import ModalWindow from "../components/ModalWindow";
import PlayerStore from "../store/PlayerStore";
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
    const [currentMapType, setCurrentMapType] = useState<'tunnels' | 'forest' | 'cave'>('forest');
    // const [modalOpen, setModalOpen] = useState(false);

    const { playerIsCaught } = PlayerStore;

    useEffect(() => {
        GameStore.clearAllLevels();
    }, []);
    const generateNewWorldCallback = useCallback((mapType: 'tunnels' | 'forest' | 'cave' = 'forest') => {
        setCurrentMapType(mapType);
        const newMap = generateNewWorld(mapType);
        setCurrentWorldMap(newMap);
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
        generateNewWorldCallback();
    }, [generateNewWorldCallback]);

    // Updated keypress listener
    useEffect(() => {
        const keyPressHandler = (event: KeyboardEvent) => {
            handleKeyboardEvent(event, {
                setTurn,
                setCurrentWorldMap,
                currentMapType
            });
        };

        window.addEventListener("keydown", keyPressHandler);
        return () => window.removeEventListener("keydown", keyPressHandler);
    }, [turn, playerIsCaught, currentMapType]);

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