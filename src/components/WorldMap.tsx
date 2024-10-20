import { toJS } from "mobx";
import React from "react";
import styled from "styled-components";
import { TileType } from "../scripts/world/tileTypes";
import WorldTile from "./WorldTile";
import { WORLD_HEIGHT, WORLD_WIDTH } from "../scripts/game";

const MapContainer = styled.div`
    display: grid;
    grid-template-columns: 15px repeat(${WORLD_WIDTH}, 15px) 15px;
    grid-template-rows: 25px repeat(${WORLD_HEIGHT}, 25px) 25px;
    margin: 10px;
`;

const BlackSpace = styled.div`
    width: 100%;
    height: 100%;
    background-color: black;
`;

const BorderTile = styled.div`
    width: 100%;
    height: 100%;
    background-color: black;
    display: flex;
    justify-content: center;
    align-items: center;
    color: grey;
    font-size: 20px;
`;

interface Props {
    worldMap: TileType[];
}

export const WorldMap: React.FC<Props> = ({ worldMap }) => {
    return (
        <MapContainer>
            {/* Top border */}
            <BorderTile>┌</BorderTile>
            {Array(WORLD_WIDTH).fill(0).map((_, index) => (
                <BorderTile key={`top-${index}`}>─</BorderTile>
            ))}
            <BorderTile>┐</BorderTile>

            {worldMap.map((tile, index) => {
                const row = Math.floor(index / WORLD_WIDTH);
                const col = index % WORLD_WIDTH;

                return (
                    <React.Fragment key={index}>
                        {/* Left border */}
                        {col === 0 && <BorderTile>│</BorderTile>}

                        {tile.visible || tile.explored ? (
                            <WorldTile tile={toJS(tile)} index={index} />
                        ) : (
                            <BlackSpace />
                        )}

                        {/* Right border */}
                        {col === WORLD_WIDTH - 1 && <BorderTile>│</BorderTile>}
                    </React.Fragment>
                );
            })}

            {/* Bottom border */}
            <BorderTile>└</BorderTile>
            {Array(WORLD_WIDTH).fill(0).map((_, index) => (
                <BorderTile key={`bottom-${index}`}>─</BorderTile>
            ))}
            <BorderTile>┘</BorderTile>
        </MapContainer>
    );
};
