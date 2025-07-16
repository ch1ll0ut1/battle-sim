# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a realistic battle simulation system designed to model complex combat mechanics, unit behavior, and battlefield dynamics. The project consists of three main components:

1. **Backend** (`/backend/`) - Core simulation engine written in TypeScript
2. **Frontend** (`/frontend/`) - React-based web UI for battle visualization  
3. **PIXI UI** (`/pixi-ui/`) - PIXI.js-based UI for map editing and main menu

## Development Commands

### Backend (Core Simulation)
```bash
cd backend
npm install
npm run dev          # Watch mode TypeScript compilation
npm run build        # Build for production
npm test             # Run Jest tests
npm test:watch       # Watch mode for tests
npm test:coverage    # Run tests with coverage
npm run battle       # Run CLI battle simulation
npm run server       # Start WebSocket server
```

### Frontend (Battle Visualization)
```bash
cd frontend
npm install
npm run dev          # Start Vite development server
npm run build        # Build for production
npm test             # Run Jest tests
```

### PIXI UI (Map Editor & Main Menu)
```bash
cd pixi-ui
npm install
npm run dev          # Start Vite development server
npm run build        # Build with linting
npm run lint         # Run ESLint
```

## Architecture Overview

### Core System Design
- **Component-based architecture** with clear separation of concerns
- **Event-driven communication** between systems using EventBus
- **Modular design** where each system is self-contained
- **Performance-optimized** for large-scale battle simulations

### Key Components

#### Game Engine (`/backend/src/GameEngine/`)
- Central orchestrator for game simulation
- Manages game modes, timing, and state
- Handles different simulation phases (initialized, running, paused, finished)

#### Game Modes (`/backend/src/GameMode/`)
- **BattleMode** - Combat simulation with AI
- **MovementSandbox** - Movement testing and validation
- Extensible system for adding new game modes

#### Unit System (`/backend/src/Unit/`)
- **Unit.ts** - Core unit representation with attributes, combat, body, movement components
- **UnitAttributes.ts** - Physical characteristics (experience, strength, weight, stamina)
- **UnitMovement.ts** - Movement mechanics with physics and pathfinding
- **UnitStamina.ts** - Dynamic stamina system affecting combat effectiveness

#### Combat System (`/backend/src/_OLD/combat/`)
- **CombatEngine** - Core combat calculations and mechanics
- **BattleEngine** - Higher-level battle orchestration
- Injury system with realistic damage modeling

#### Map System (`/backend/src/Map/`)
- **Map.ts** - Terrain representation and management
- **MapGenerator.ts** - Procedural map generation
- **Terrain/** - Different terrain types (trees, obstacles)

#### Network Layer (`/backend/src/GameServer/`)
- **GameServer.ts** - WebSocket server for real-time communication
- **SimulationController.ts** - Controls simulation flow for networked games
- **WebsocketServer.ts** - WebSocket utilities and message handling

### Testing Strategy
- **Component-focused testing** with Jest
- **Integration tests** for system interactions
- **Behavior-driven development** approach
- Test files co-located with source code using `.test.ts` extension

### Code Organization Principles
- **One class per file** with matching filename
- **Self-contained modules** with their own tests and utilities
- **Files under 300 lines** for maintainability
- **TypeScript with strict mode** for type safety

## Development Guidelines

### Module Structure
Each module follows this pattern:
```
/ModuleName/
  ModuleName.ts         # Main implementation
  ModuleName.test.ts    # Unit tests
  helperFunction.ts     # Module-specific utilities
  helperFunction.test.ts
```

### TypeScript Usage
- Let TypeScript infer types when obvious
- Explicitly type complex interfaces and function parameters
- Use strict mode with proper error handling
- Avoid unnecessary return type annotations for simple functions

### Performance Considerations
- **Spatial partitioning** for efficient unit queries
- **Batch processing** for large unit collections
- **Worker threads** for pathfinding and AI (planned)
- **Object pooling** to avoid garbage collection overhead

### State Management
- Use methods for all state changes (never direct property modification)
- Log important state changes for debugging
- Clean up resources properly in dispose methods
- Use event-driven architecture for cross-component communication

## Key Features

### Realistic Combat Mechanics
- **Experience-based skill system** affecting combat effectiveness
- **Physical attributes** (strength, weight, stamina) impact performance
- **Body part damage system** with injury effects
- **Armor and weapon systems** with realistic properties

### Advanced Unit Behavior
- **Stamina system** dynamically calculated from unit characteristics
- **Movement physics** with terrain effects
- **AI decision making** for autonomous behavior
- **Formation and tactical systems** (planned)

### Map and Terrain
- **Procedural map generation** with forests, rivers, and obstacles
- **Terrain effects** on movement and combat
- **Pathfinding system** with terrain cost calculations
- **Visual map editor** using PIXI.js

### Performance Optimization
- **Spatial hash grid** for efficient collision detection
- **Batch processing** for large unit updates
- **Event-driven updates** to minimize unnecessary calculations
- **Memory management** with proper resource cleanup

## File Structure Notes

### Backend Organization
- `/src/GameEngine/` - Core simulation engine
- `/src/GameMode/` - Different game modes and AI
- `/src/Unit/` - Unit system and components
- `/src/Map/` - Terrain and map generation
- `/src/GameServer/` - Network layer and WebSocket handling
- `/src/_OLD/` - Legacy code being refactored (avoid extending)
- `/src/utils/` - Shared utilities (Logger, WebSocket, etc.)

### Frontend Structure
- `/src/BattleMap/` - Battle visualization components
- Uses React with TypeScript for battle visualization
- WebSocket client for real-time updates from backend
- first attempt of building game ui client (ignore and work on pixi ui app)

### PIXI UI Structure
- `/src/MainMenu/` - Main menu screen
- `/src/MapEditor/` - Map editor interface
- `/src/Navigation/` - Screen management system
- `/src/UI/` - Reusable UI components

## Important Implementation Details

### Game Loop
- **Turn-based simulation** with configurable time steps (default 100ms)
- **Event-driven updates** broadcasted to connected clients
- **Pause/resume capability** for debugging and control

### Unit Components
Units use a component-based architecture:
- **UnitAttributes** - Core stats and characteristics
- **CombatComponent** - Combat capabilities and actions
- **BodyComponent** - Physical representation and injury system
- **MovementComponent** - Movement and positioning
- **WorkComponent** - Non-combat activities

### Network Protocol
- **WebSocket-based** real-time communication
- **JSON message format** for commands and state updates
- **Event broadcasting** for game state changes
- **Command handling** for simulation control (start/stop/reset)

### Error Handling
- **Specific error types** for different failure modes
- **Comprehensive logging** for debugging and monitoring
- **Graceful degradation** when components fail
- **Resource cleanup** on errors and shutdown

## Development Workflow

1. **Start with tests** - Write tests before implementation
2. **Small iterations** - Keep changes focused and incremental
3. **Component isolation** - Keep modules self-contained
4. **Performance monitoring** - Use built-in performance monitoring
5. **Code review** - Follow pull request guidelines in CONTRIBUTING.md

## Dependencies

### Backend
- **TypeScript** - Type-safe JavaScript
- **Jest** - Testing framework
- **ws** - WebSocket library
- **tsx** - TypeScript execution

### Frontend
- **Vite** - Build tool
- **SolidJS** - Alternative frontend framework
- **Jest** - Testing framework

### PIXI UI
- **PIXI.js** - 2D graphics library
- **@pixi/ui** - UI components for PIXI
- **Vite** - Build tool
- **ESLint** - Code linting