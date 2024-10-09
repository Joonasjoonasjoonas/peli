import React from "react";
import { Box, Modal } from "@mui/material";
import styled from "styled-components";

const Container = styled.div`
    position: absolute;
    top: 30%;
    left: 50%;
    transform: translate(-50%, -30%);
    width: 400;
    background-color: black;
    border: 2px solid grey;
    box-shadow: 24;
    color: white;
    padding: 1%;
    font-family: dos;
    font-size: 20px;
    outline: 0;
`;

interface Props {
    textContent: string;
    open: boolean;
    onClose: () => void;
}

const ModalWindow: React.FC<Props> = ({ textContent, open, onClose }) => {
    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Container>
                <Box>{textContent}</Box>
            </Container>
        </Modal>
    );
};

export default ModalWindow;
