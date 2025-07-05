# Battle Simulation Architecture

## Overview

The Battle Simulation system is designed to simulate large-scale battles with realistic unit behavior, terrain effects, and combat mechanics. The architecture follows component-based design principles to maintain modularity while keeping the code simple and easy to follow.

## Component Descriptions

### Core Systems

#### Event Bus

- **Purpose**: Provides decoupled communication between system components
- **Responsibilities**:
  - Event publishing and subscription
  - Handling system-wide notifications
  - Managing event history for replay
- **Key Relationships**:
  - Used by all components for event-based communication
  - Primary channel for state updates and important game events

#### Time Manager

- **Purpose**: Controls simulation timing and synchronization
- **Responsibilities**:
  - Managing simulation time steps
  - Handling pause/resume
  - Coordinating update cycles
- **Key Relationships**:
  - Drives Unit Manager updates
  - Coordinates with Combat Engine
  - Synchronizes with Network Layer

#### Performance Monitor

- **Purpose**: Tracks and optimizes system performance
- **Responsibilities**:
  - Monitoring frame times
  - Tracking system metrics
  - Suggesting optimizations
- **Key Relationships**:
  - Monitors all major systems
  - Provides data to BatchProcessor
  - Guides WorkerThreadPool allocation

### Unit System

#### Unit Component

- **Purpose**: Core unit representation and state management
- **Subcomponents**:

  ```typescript
  class Unit {
    readonly attributes: UnitAttributes;  // Core stats
    readonly combat: CombatComponent;     // Combat capabilities
    readonly body: BodyComponent;         // Physical representation
    readonly movement: MovementComponent; // Movement and positioning
    readonly work: WorkComponent;         // Non-combat activities
  }
  ```

- **Key Relationships**:
  - Coordinated by UnitManager
  - Interacts with TerrainGrid through MovementComponent
  - Communicates with CombatEngine through CombatComponent

#### Unit Manager

- **Purpose**: Manages collections of units and their lifecycle
- **Responsibilities**:
  - Unit creation and destruction
  - Batch updates
  - Unit queries and filtering
- **Key Relationships**:
  - Uses SpatialHashGrid for efficient queries
  - Coordinates with BatchProcessor
  - Updates through TimeManager

### Combat System

#### Combat Engine

- **Purpose**: Handles all combat-related calculations and outcomes
- **Responsibilities**:

  ```typescript
  class CombatEngine {
    calculateDamage(attacker: Unit, defender: Unit): number;
    processAttack(attack: Attack): CombatResult;
    handleCombatEffects(effects: CombatEffect[]): void;
  }
  ```

- **Key Relationships**:
  - Works with InjuryManager
  - Uses TerrainGrid for modifiers
  - Notifies EventBus of outcomes

#### Injury Manager

- **Purpose**: Handles unit damage and injury effects
- **Responsibilities**:
  - Injury creation and application
  - Wound management
  - Health state tracking
- **Key Relationships**:
  - Updates Unit BodyComponent
  - Reports to CombatEngine
  - Emits events through EventBus

### Terrain System

#### Terrain Grid

- **Purpose**: Manages the battlefield environment
- **Responsibilities**:

  ```typescript
  class TerrainGrid {
    private cells: TerrainCell[][];
    
    getCell(position: Position): TerrainCell;
    getMovementCost(unit: Unit, cell: TerrainCell): number;
    getCombatModifiers(position: Position): CombatModifiers;
  }
  ```

- **Key Relationships**:
  - Provides data to PathfindingManager
  - Affects MovementComponent calculations
  - Influences CombatEngine outcomes

#### Pathfinding Manager

- **Purpose**: Handles unit movement planning
- **Responsibilities**:
  - Path calculation
  - Movement cost evaluation
  - Path optimization
- **Key Relationships**:
  - Uses TerrainGrid data
  - Works with WorkerThreadPool
  - Serves MovementComponent requests

### Performance Optimization

#### Spatial Hash Grid

- **Purpose**: Optimizes spatial queries and collision detection
- **Implementation**:

  ```typescript
  class SpatialHashGrid {
    private cells: Map<string, Unit[]>;
    private cellSize: number;
    
    updateUnit(unit: Unit): void;
    query(position: Position, range: number): Unit[];
    getNeighbors(cell: GridCell): Unit[];
  }
  ```

- **Key Relationships**:
  - Used by UnitManager
  - Assists CombatEngine
  - Optimizes MovementComponent

#### Batch Processor

- **Purpose**: Efficiently processes large numbers of units
- **Responsibilities**:
  - Grouping similar operations
  - Optimizing update order
  - Managing update priorities
- **Key Relationships**:
  - Works with UnitManager
  - Coordinates with TimeManager
  - Uses PerformanceMonitor data

### Network Layer

#### Battle Coordinator

- **Purpose**: Manages battle state and synchronization
- **Responsibilities**:
  - State synchronization
  - Update broadcasting
  - Client management
- **Key Relationships**:
  - Controls WebSocketServer
  - Coordinates with UnitManager
  - Monitors CombatEngine

## Implementation Discoveries

1. Component Communication
   - Event-based communication works well for most cases
   - Direct method calls are better for time-critical operations
   - Hybrid approach: Events for state changes, direct calls for calculations

2. Performance Optimization
   - Spatial partitioning is crucial for large unit counts
   - Batch processing significantly reduces update overhead
   - Worker threads essential for pathfinding and AI

3. State Management
   - Component-based architecture simplifies state management
   - Each component handles its own state
   - EventBus for cross-component state changes

4. Terrain Integration
   - Grid-based system with terrain features
   - Terrain affects both movement and combat
   - Efficient pathfinding through worker threads

## System Interactions

### Combat Flow

```typescript
// Example of systems working together in combat
class CombatComponent {
  performAttack(target: Position): void {
    // 1. Find targets using spatial partitioning
    const nearbyUnits = this.spatialGrid.query(
      this.unit.position,
      this.weapon.range
    );
    
    // 2. Apply terrain modifiers
    const terrainMods = this.terrainGrid.getCombatModifiers(
      this.unit.position
    );
    
    // 3. Process combat
    const result = this.combatEngine.processAttack({
      attacker: this.unit,
      target: nearbyUnits[0],
      modifiers: terrainMods
    });
    
    // 4. Handle results
    this.eventBus.emit('combat.result', result);
  }
}
```

### Movement Flow

```typescript
// Example of movement system interaction
class MovementComponent {
  async moveTo(target: Position): Promise<void> {
    // 1. Get path from worker
    const path = await this.pathfindingManager.findPath(
      this.unit.position,
      target
    );
    
    // 2. Follow path with collision detection
    for (const waypoint of path) {
      const collisions = this.spatialGrid.query(
        waypoint,
        this.unit.radius
      );
      
      if (collisions.length === 0) {
        this.unit.position = waypoint;
        this.spatialGrid.updateUnit(this.unit);
      }
    }
  }
}
```

## Testing Strategy

Each component should have comprehensive tests focusing on:

1. Core functionality
2. Integration with other components
3. Performance characteristics
4. Edge cases and error conditions

Example test structure:

```typescript
describe('CombatEngine', () => {
  it('should apply terrain modifiers to combat calculations', () => {
    const terrain = new TerrainGrid();
    const combatEngine = new CombatEngine(terrain);
    const result = combatEngine.processAttack(attacker, defender);
    expect(result.damage).toBeAffectedBy(terrain.getModifiers());
  });
});
```
