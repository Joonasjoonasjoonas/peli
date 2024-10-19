import React from "react";
import styled from "styled-components";
import GameStore from "../store/GameStore";

const EventPanelContainer = styled.div`
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    text-align: left;
    font-size: 18px;
    background-color: black;
    height: 100px;
    padding: 10px;
    margin: 10px;
    overflow: hidden;
    width: calc(94 * 15px); // Match the width of the MapContainer
`;

const LogMessage = styled.div<{ messageIndex: number }>`
    opacity: ${(p) =>
        p.messageIndex === 0 ? 1 : (11 - p.messageIndex) / 10} !important ;
    color: ${(p) => (p.messageIndex === 0 ? "white" : "DarkGrey")};
`;

export const EventPanel = () => {
    const { completeLogMessages } = GameStore;

    return (
        <EventPanelContainer>
            {completeLogMessages.slice(0, 4).map((logMessagesPerTurn, i) => (
                <LogMessage messageIndex={i} key={i}>
                    {logMessagesPerTurn}
                    <br />
                </LogMessage>
            ))}
        </EventPanelContainer>
    );
};
