import { toJS } from "mobx";
import React from "react";
import styled from "styled-components";
import { TileType } from "../scripts/world/tileTypes";
import WorldTile from "./WorldTile";

const MapContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(94, 15px);
    grid-template-rows: repeat(20, 25px);
    margin: 10px;
`;

const BlackSpace = styled.div`
    width: 100%;
    height: 100%;
    background-color: black;
`;

interface Props {
    worldMap: TileType[];
    allVisible: boolean;
}

export const WorldMap: React.FC<Props> = ({ worldMap, allVisible }) => {
    return (
        <MapContainer>
            {worldMap.map((tile, index) => (
                allVisible || tile.visible || tile.explored ? (
                    <WorldTile tile={toJS(tile)} key={index} index={index} />
                ) : (
                    <BlackSpace key={index} />
                )
            ))}
        </MapContainer>
    );
};
