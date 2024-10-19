import React from "react";
import styled from "styled-components";
import { TileType } from "../scripts/world/tileTypes";
import ActorStore, { Actor } from "../store/ActorStore";
import PlayerStore from "../store/PlayerStore";
import { getDistance, getIndexFromXY } from "../utils/utils";

const Tile = styled.div<{ tile: TileType; distanceFromPlayer: number }>`
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: ${(p) =>
        p.distanceFromPlayer > 5
            ? "black"
            : p.tile.backgroundColor};
    color: ${(p) =>
        p.distanceFromPlayer > 5
            ? "#282828" // very dark gray
            : p.tile.color};
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

    const tileCoords = {
        x: index % 94,
        y: Math.floor(index / 94)
    };

    const distanceFromPlayer = getDistance(
        playerCoords.x,
        playerCoords.y,
        tileCoords.x,
        tileCoords.y
    );

    actors.forEach((actor) => {
        if (
            index === getIndexFromXY(actor.xCoord, actor.yCoord) &&
            distanceFromPlayer < 10
        )
            renderActor = actor;
    });

    return (
        <>
            <Tile tile={tile} distanceFromPlayer={distanceFromPlayer}>
                {!renderPlayer && !renderActor.id && (
                    <div>{tile.ascii}</div>
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
