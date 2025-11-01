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

## Coding Standards

**IMPORTANT:** For comprehensive coding standards, always refer to `/docs2/CODING_GUIDELINES.md`.

This document contains detailed guidelines for:
- TypeScript type system (strict typing, no escape hatches)
- File organization (SRP, max 300 lines, export patterns)
- Class design patterns (composition, when to use classes vs functions)
- Error handling (fail fast, type-driven validation)
- Testing standards (what to test, how to structure tests)
- Documentation (JSDoc on public API, inline comments for complex logic)
- Performance (profile-guided optimization)
- Code style (naming, state management, avoiding common pitfalls)

These guidelines must be followed for all code changes to maintain senior developer quality standards.

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

## Documentation Guidelines

### Game Mechanics Documentation

**Location:** `/docs2/game-mechanics/` - Contains all game design and mechanics specifications

**Before creating or updating documentation:**
1. **Read the templates guide** - Always read `/docs2/templates/README.md` first
2. **Choose appropriate template** - Select the correct template based on document type:
   - `system-mechanics-template.md` - For individual game systems (combat, stamina, shields, etc.)
   - `design-principles-template.md` - For philosophy, balance, and performance strategy
   - `folder-readme-template.md` - For folder-level navigation and overviews
3. **Follow the template structure** - Use the exact sections and format specified in the template
4. **Stay within length limits** - Keep docs concise and focused (see template README for limits)

**Documentation principles:**
- Technical and concise - use formulas, tables, and specific values
- Cross-reference related systems - link to dependencies and affected systems
- Include concrete examples - show calculations and scenarios
- Separate concerns - one system per document, split if too large
- No speculation - only document what is designed and specified

**Review criteria for each new document:**
Before finalizing any game mechanics document, review against these questions:
1. **Does this make sense?** - Is the system logical and internally consistent?
2. **Is the system thought through?** - Are edge cases, interactions, and implications considered?
3. **Does this mechanic give a feeling of realism on a 2d topdown view with 10000 units?** - Will players perceive realistic behavior at scale?
4. **Can the player understand and see the mechanic in action?** - Is the system visible and comprehensible to players?
5. **Is the performance cost worth it for player fun?** - Does the computational cost justify the gameplay value?

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

## PIXI.js Development Guidelines

When working with PIXI.js framework in the `/pixi-ui/` directory:

1. **Always reference PIXI.js documentation** - Use `/pixi-ui/docs/pixeljs-documentation.md` as the primary reference for PIXI.js API and best practices
2. **Extended documentation** - When the primary documentation is insufficient, refer to `/pixi-ui/docs/pixel-documentation-full.md` for comprehensive PIXI.js information
3. **Follow PIXI.js conventions** - Use established PIXI.js patterns for scene management, rendering, and event handling
4. **Performance optimization** - Leverage PIXI.js performance features like object pooling, batching, and efficient rendering practices

## Additional User and Workspace Rules for Claude Code

The following rules are defined by the user and workspace configuration. Claude Code must follow these in addition to all other project guidelines:

### Workspace-Level Rules
- All files in the folder "_OLD" are deprecated and only remain to use as example and maybe extract some logic and values later.

### Workflow and Process Rules
- Propose solutions and present options for the user to choose from
- Private methods should be at the end of a file
- Never do a git reset unless the user is asked and confirms
- Add multiline comments to every method, function, and class
- Only do what is asked; do not do extra work. Make suggestions afterwards without causing any changes
- Develop in small iterations to give the user time to review changes and do git commits in between
- Tests should follow the guidelines in `/docs2/CODING_GUIDELINES.md`
- The assistant should inspect the actual code rather than speculate when diagnosing issues
- To run TypeScript scripts directly, use `npx tsx script.ts` instead of `npx ts-node` or building first
- Documentation files should be placed in the `/docs` directory
- The user prefers code that is simple, obvious, and has easy-to-follow references (KISS principle)
