import React from "react";
import styled from "styled-components";
import { TileType } from "../scripts/world/tileTypes";
import { WORLD_HEIGHT, WORLD_WIDTH } from "../scripts/game";
import Canvas from "../Canvas";

const MapContainer = styled.div`
  width: 100%;
  height: 0;
  padding-bottom: ${(WORLD_HEIGHT / WORLD_WIDTH) * 100}%;
  position: relative;
`;

const CanvasWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

interface Props {
  worldMap: TileType[];
}

export const WorldMap: React.FC<Props> = ({ worldMap }) => {
  return (
    <MapContainer>
      <CanvasWrapper>
        <Canvas worldMap={worldMap} />
      </CanvasWrapper>
    </MapContainer>
  );
};

export default WorldMap;