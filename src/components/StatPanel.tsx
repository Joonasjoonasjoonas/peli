import React from "react";
import styled from "styled-components";

import { WORLD_WIDTH } from "../scripts/game";

const StatPanelContainer = styled.div`
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    text-align: left;
    color: white;
    background-color: black;
    height: 100px;
    margin-bottom: 10px;
    margin-left: 10px;
    margin-right: 10px;
    padding: 10px;
    width: calc(${WORLD_WIDTH + 2} * 15px;
`;

interface Props {
    turn: number;
}

export const StatPanel: React.FC<Props> = ({ turn }) => {
    return <StatPanelContainer>Turn: {turn}</StatPanelContainer>;
};
