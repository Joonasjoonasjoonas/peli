import React from "react";
import styled from "styled-components";

const StatWindowContainer = styled.div`
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    text-align: left;

    color: white;
    background-color: black;

    height: 100px;

    margin-bottom: 1%;
    margin-left: 1%;
    margin-right: 1%;
    padding: 1%;
`;

interface Props {
    turn: number;
}

export const StatWindow: React.FC<Props> = ({ turn }) => {
    return <StatWindowContainer>Turn: {turn}</StatWindowContainer>;
};
