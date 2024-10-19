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
import ModalWindow from "../components/ModalWindow";
import PlayerStore from "../store/PlayerStore";
import { updatePlayerFOV } from "../scripts/player/fov";
import { movementKeys } from "../scripts/player/handleKeyPress";

const MainContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    padding: 10px;
    box-sizing: border-box;
`;

const UIContainer = styled.div`
    width: 100%;
`;

const MainView = () => {
    const [currentWorldMap, setCurrentWorldMap] = useState<TileType[]>([]);
    const [turn, setTurn] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);

    const { playerIsCaught } = PlayerStore;

    const generateNewWorld = useCallback(() => {
        createWorldMap('tunnels');
        populate();
        const { worldMap } = GameStore;
        setCurrentWorldMap(worldMap);
        updatePlayerFOV();
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
            } else if (key.toLowerCase() === "m") {
                generateNewWorld();
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
            <ModalWindow
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                textContent={"Nyt se nappas sut!"}
            />
        </MainContainer>
    );
};

export default MainView;
