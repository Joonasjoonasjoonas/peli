import { useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import { EventWindow } from "../components/EventWindow";
import { WorldMap } from "../components/WorldMap";
import GameStore from "../store/GameStore";
import { tryMoveActor } from "../scripts/actors/movement";
import { createWorldMap} from "../scripts/world/map";
import { TileType } from "../scripts/world/tileTypes";
import { checkForRandomEvent } from "../scripts/world/randomEvents";
import { StatWindow } from "../components/StatWindow";
import { handleKeyPress } from "../scripts/player/handleKeyPress";
import { populate } from "../scripts/actors/populate";
import ModalWindow from "../components/ModalWindow";
import PlayerStore from "../store/PlayerStore";
import { updatePlayerFOV } from "../scripts/player/fov";

const MainContainer = styled.div`
    display: flex;
    flex-direction: column;
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
            const lowercaseKey = event.key.toLowerCase();
            if (
                ["w", "a", "x", "d", "q", "z", "c", "e"].includes(lowercaseKey)
            ) {
                updatePlayerFOV();
                handleKeyPress(lowercaseKey);
                setTurn(turn + 1);
                checkForRandomEvent();
                addCompleteLogMessage();
                tryMoveActor();
            } else if (lowercaseKey === "p") {
                generateNewWorld();
                setTurn(0);
            }
        };

        window.addEventListener("keydown", keyPress);

        return () => window.removeEventListener("keydown", keyPress);
    }, [turn, playerIsCaught, generateNewWorld]);

    return (
        <MainContainer>
            <WorldMap worldMap={currentWorldMap} allVisible={false} />
            <UIContainer>
                <StatWindow turn={turn} />
                <EventWindow />
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