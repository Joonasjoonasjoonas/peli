import { useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import { GameView } from "../components/GameView";
import GameStore from "../store/GameStore";
import { TileType } from "../scripts/world/tileTypes";
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


const MainView = observer(() => {
    const [currentWorldMap, setCurrentWorldMap] = useState<TileType[]>([]);
    const [turn, setTurn] = useState(0);
    const { currentMapType, setCurrentMapType } = GameStore;
  
    // const [modalOpen, setModalOpen] = useState(false);

  

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
    }, [turn, currentMapType]);

    return (
        <MainContainer>
            <GameView 
                worldMap={currentWorldMap} 
                turn={turn} 
                logMessages={GameStore.completeLogMessages}
            />
            {/* <ModalWindow
                open={modalOpen}
                onClose={() => setModalOpen(false)}
              
            /> */}
        </MainContainer>
    );
});

export default MainView;