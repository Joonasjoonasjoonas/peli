import React from "react";
import styled from "styled-components";
import { TileType } from "../scripts/world/tileTypes";
import ActorStore, { Actor } from "../store/ActorStore";
import PlayerStore from "../store/PlayerStore";
import { getIndexFromXY } from "../utils/utils";

const Tile = styled.div<{ tile: TileType; visible: boolean; explored: boolean }>`
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: ${(p) =>
        p.visible
            ? p.tile.backgroundColor
            : p.explored
            ? "black"
            : "transparent"};
    color: ${(p) =>
        p.visible
            ? p.tile.color
            : p.explored
            ? "#282828" // very dark gray
            : "transparent"};
    width: 100%;
    height: 100%;
    z-index: 1;
    font-size: 20px;
    line-height: 1;
`;

const StyledActor = styled.div<{ color: string }>`
    color: ${(p) => p.color};
    z-index: 2;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
`;

const Player = styled.div`
    color: white;
    z-index: 2;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
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
        char: "",
        hitpoints: 0,
        xCoord: 0,
        yCoord: 0,
        charColor: "",
        behaviour: "",
        destinationX: 0,
        destinationY: 0
    };

    actors.forEach((actor) => {
        if (
            index === getIndexFromXY(actor.xCoord, actor.yCoord) &&
            tile.visible
        )
            renderActor = actor;
    });

    return (
        <>
            <Tile tile={tile} visible={tile.visible} explored={tile.explored}>
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
