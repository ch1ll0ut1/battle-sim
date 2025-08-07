# Battle Simulation App

A real-time battle simulation game built with TypeScript, featuring a web-based client using PIXI.js and a WebSocket server for game logic.

## Installation

### Prerequisites

- Node.js (version 20 or higher)
- npm

### Setup

1. Navigate to the app directory:

   ```bash
   cd app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

## Usage

The application consists of two main parts that work together:

### Option 1: Run Both Applications Simultaneously (Recommended)

```bash
npm start
```

This command starts both the client and server in parallel:

- **Client**: Web interface at `http://localhost:8080`
- **Server**: WebSocket server at `ws://localhost:8081`

### Option 2: Run Applications Separately

#### Start the Server

```bash
npm run start:server
```

- Runs the game server with WebSocket communication
- Listens on port `8081`
- Handles battle simulation logic and state management

#### Start the Client

```bash
npm run start:client
```

- Runs the web client with hot reload
- Available at `http://localhost:8080`
- Automatically connects to the server at `ws://localhost:8081`

### Additional Commands

#### Development & Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage
npm test:coverage

# Lint code
npm run lint

# Build for production
npm run build
```

#### Storybook (Component Development)

```bash
# Start Storybook development server
npm run storybook

# Build Storybook for deployment
npm run build-storybook
```

## Application Architecture

### Client Application (`start:client`)

- **Technology**: PIXI.js for 2D graphics rendering
- **Purpose**: Provides the visual interface for the battle simulation
- **Features**:
  - Real-time battle visualization
  - Interactive UI components (buttons, controls, menus)
  - Multiple screens (Load, Menu, Map)
  - WebSocket connection to game server

### Server Application (`start:server`)

- **Technology**: Node.js with WebSocket support
- **Purpose**: Handles game logic, simulation, and state management
- **Features**:
  - Battle simulation engine
  - Unit management (movement, stamina, attributes)
  - Map generation with terrain
  - WebSocket communication with clients
  - Multiple game modes (Battle, Movement Sandbox)

## Folder Structure

```text
app/
├── src/
│   ├── client/                    # Client-side code (web frontend)
│   │   ├── components/           # Reusable UI components
│   │   │   ├── Button/          # Button component with stories
│   │   │   ├── Label/           # Label component
│   │   │   └── PlaybackControls/ # Media control component
│   │   ├── screens/             # Different application screens
│   │   │   ├── LoadScreen/      # Initial loading screen
│   │   │   ├── MapScreen/       # Main battle visualization
│   │   │   └── MenuScreen/      # Main menu interface
│   │   └── utils/               # Client-side utilities
│   │
│   ├── engine/                   # Core game engine (shared)
│   │   ├── GameEngine/          # Main simulation engine
│   │   ├── GameMode/            # Different game modes
│   │   │   ├── BattleMode/      # Traditional battle simulation
│   │   │   ├── MovementSandbox/ # Movement testing mode
│   │   │   └── World/           # World management
│   │   ├── GameServer/          # Server-side game management
│   │   └── Renderer/            # Client-side rendering system
│   │       ├── Camera/          # Camera controls and transforms
│   │       ├── Input/           # Keyboard and mouse handling
│   │       └── Screen/          # Screen management system
│   │
│   ├── game/                     # Game-specific logic
│   │   ├── Unit/                # Unit system (movement, attributes, stamina)
│   │   ├── Map/                 # Map generation and terrain
│   │   ├── _OLD/                # Legacy code (deprecated, for reference)
│   │   └── events.ts            # Game event definitions
│   │
│   ├── config/                   # Configuration files
│   │   ├── camera.ts            # Camera settings
│   │   ├── colors.ts            # Color palette
│   │   ├── server.ts            # Server configuration
│   │   └── ...                  # Other config files
│   │
│   ├── data/                     # Static game data
│   │   ├── maps/                # Pre-defined map data
│   │   └── testUnits.ts         # Test unit configurations
│   │
│   ├── client.ts                # Client application entry point
│   └── server.ts                # Server application entry point
│
├── public/                       # Static assets
│   ├── assets/                  # Images and resources
│   └── style.css                # Global styles
│
├── package.json                 # Dependencies and scripts
├── vite.config.ts              # Vite build configuration
└── tsconfig.json               # TypeScript configuration
```

### Dependencies between core folders

- /config: none
- /data: none
- /engine: config
- /game: config, engine, data
- /client: config, engine, game, data
- /server: config, engine, game, data


### Key Architecture Patterns

- **Component-Based**: Units use a component system for modularity (movement, stamina, attributes)
- **Event-Driven**: GameEngine uses EventEmitter for state changes
- **Client-Server**: Real-time communication via WebSockets
- **Plugin System**: Renderer supports pluggable components
- **Test-Driven**: Comprehensive test coverage with Vitest

### Game Features

- **Unit Simulation**: Realistic unit movement, stamina, and attributes
- **Battle System**: Turn-based combat with multiple teams
- **Map Generation**: Procedural forest maps with terrain
- **Real-Time Visualization**: Live battle updates in the browser
- **Multiple Game Modes**: Battle mode and movement sandbox
- **Component Development**: Storybook integration for UI components

## Development Notes

- Uses **ESM modules** (`"type": "module"`)
- **TypeScript** for type safety
- **Vite** for fast development and building
- **WebSocket** for real-time client-server communication
- **PIXI.js** for hardware-accelerated 2D graphics
- Files in `_OLD/` are deprecated reference implementations

## Getting Started

1. Install dependencies: `npm install`
2. Start both applications: `npm start`
3. Open `http://localhost:8080` in your browser
4. The client will automatically connect to the server
5. Explore the battle simulation interface

For component development, run `npm run storybook` to access the component library.
