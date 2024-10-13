import React from "react";
import styled from "styled-components";
import { TileType } from "../scripts/world/map";
import ActorStore, { Actor } from "../store/ActorStore";
import PlayerStore from "../store/PlayerStore";
import { getDistance, getIndexFromXY } from "../utils/utils";

const Tile = styled.div<{ tile: TileType }>`
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: ${(p) =>
        p.tile.type === "floor"
            ? "black"
            : p.tile.type === "wall"
            ? "grey"
            : "grey"};
    color: ${(p) =>
        p.tile.type === "floor"
            ? "grey"
            : p.tile.type === "wall"
            ? "grey"
            : "grey"};
    width: 100%;

    z-index: 1;
`;

const Player = styled.div`
    color: white;
    z-index: 2;
`;

const StyledActor = styled.div<{ color: string }>`
    color: ${(p) => p.color};
    z-index: 2;
`;

interface Props {
    index: number;
    tile: TileType;
}

const WorldTile: React.FC<Props> = ({ tile, index }) => {
    const { playerCoords } = PlayerStore;
    const { actors } = ActorStore;

    const renderPlayer =
        index === getIndexFromXY(playerCoords.x, playerCoords.y);

    let renderActor: Actor = {
        id: null,
        race: "",
        hitpoints: -1,
        char: "",
        xCoord: -1,
        yCoord: -1,
        charColor: "",
    };

    actors.forEach((actor) => {
        if (
            index === getIndexFromXY(actor.xCoord, actor.yCoord) &&
            getDistance(
                playerCoords.x,
                playerCoords.y,
                actor.xCoord,
                actor.yCoord
            ) < 10
        )
            renderActor = actor;
    });

    const terrainCharacter = tile.type === "floor" ? "." : tile.type === "wall";

    return (
        <>
            <Tile tile={tile}>
                {!renderPlayer && !renderActor.id && (
                    <div>{terrainCharacter}</div>
                )}
                {renderPlayer && <Player>@</Player>}
                {!!renderActor.id && (
                    <StyledActor color={renderActor.charColor}>
                        {renderActor.char}
                    </StyledActor>
                )}
            </Tile>
        </>
    );
};

export default WorldTile;
