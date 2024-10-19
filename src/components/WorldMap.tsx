import { toJS } from "mobx";
import React from "react";
import styled from "styled-components";
import { TileType } from "../scripts/world/tileTypes";
import WorldTile from "./WorldTile";
import { WORLD_HEIGHT, WORLD_WIDTH } from "../scripts/game";

const MapContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(${WORLD_WIDTH}, 15px);
    grid-template-rows: repeat(${WORLD_HEIGHT}, 25px);
    margin: 10px;
`;

const BlackSpace = styled.div`
    width: 100%;
    height: 100%;
    background-color: black;
`;

interface Props {
    worldMap: TileType[];
}

export const WorldMap: React.FC<Props> = ({ worldMap }) => {
    return (
        <MapContainer>
            {worldMap.map((tile, index) => (
                tile.visible || tile.explored ? (
                    <WorldTile tile={toJS(tile)} key={index} index={index} />
                ) : (
                    <BlackSpace key={index} />
                )
            ))}
        </MapContainer>
    );
};
