MANSEHACK - Game Design Document
=====================================

### 1. Game Overview

MANSEHACK is a roguelike game set in Tampere, Finland, where players navigate through dark woods and underground tunnels to reach Tampereen keskustori (Tampere Central Square).

### 2. Story

The game begins with an introductory text:

"You are supposed to get to the Tampereen keskustori to celebrate with the others but currently you are lost in the dark woods of Pyynikki. To get there, you need to descend to the underground tunnels of the Pyynikin harju and find your way towards the city center, then ascend to the market square. Torille!"

### 3. Gameplay

#### Core Mechanics

* Turn-based movement
* Field of View (FOV) system
* Random map generation
* NPC interactions
* Inventory management (to be implemented)
* Combat system (to be implemented)

#### Game Flow

1. Start in the woods of Pyynikki
2. Find entrance to underground tunnels
3. Navigate through tunnels beneath the city
4. Find exit to Tampereen keskustori
5. Reach the market square

#### Controls

Keyboard-based control system with movement keys.

### 4. World Design

#### Environments

1. Pyynikki Woods
2. Underground Tunnels
3. City Streets
4. Tampereen keskustori

#### Map Generation

Procedural generation for different map types: Forest, Cave, Tunnels.

### 5. Character System

#### Player Character

* Represented by '@' symbol
* Can move in 8 directions

#### NPCs

Various NPCs populate the game world, including TBA

### 6. User Interface

#### Main View

* World Map
* Stat Panel
* Event Panel
* Event Log
	+ Displays game events and messages.
* Stat Panel
	+ Shows game statistics, including the current turn.

### 7. Technical Specifications

#### Game Engine

Built using React and TypeScript.

#### Rendering

Utilizes HTML5 Canvas for efficient rendering.

#### State Management

Uses MobX for state management across GameStore, PlayerStore, and ActorStore.

### 8. Future Enhancements

1. Implement forest map generation
2. Add diverse NPCs and interactions
3. Introduce a combat system
4. Implement an inventory system
5. Add more Finnish cultural references and landmarks
6. Create multiple levels for the underground tunnels
7. Implement a quest system related to Finnish culture or Tampere's history

This document provides a concise overview of MANSEHACK, outlining its core mechanics, story, gameplay, and future enhancements.