import { toJS } from "mobx";
import React from "react";
import styled from "styled-components";
import { TileType } from "../scripts/world/map";
import WorldTile from "./WorldTile";

const MapContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(94, 15px);
    grid-template-rows: repeat(20, 25px);
    margin: 1%;
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
                tile.visible ? (
                    <WorldTile tile={toJS(tile)} key={index} index={index} />
                ) : (
                    <BlackSpace key={index} />
                )
            ))}
        </MapContainer>
    );
};
