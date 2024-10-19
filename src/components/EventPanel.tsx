import React from "react";
import styled from "styled-components";
import GameStore from "../store/GameStore";

const EventWindowContainer = styled.div`
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    text-align: left;

    font-size: 18px;

    background-color: black;

    height: 100px;

    padding: 1%;
    margin: 1%;

    overflow: hidden;
`;

const LogMessage = styled.div<{ messageIndex: number }>`
    opacity: ${(p) =>
        p.messageIndex === 0 ? 1 : (11 - p.messageIndex) / 10} !important ;
    color: ${(p) => (p.messageIndex === 0 ? "white" : "DarkGrey")};
`;

export const EventPanel = () => {
    const { completeLogMessages } = GameStore;

    return (
        <EventWindowContainer>
            {completeLogMessages.slice(0, 4).map((logMessagesPerTurn, i) => (
                <LogMessage messageIndex={i} key={i}>
                    {logMessagesPerTurn}
                    <br />
                </LogMessage>
            ))}
        </EventWindowContainer>
    );
};
