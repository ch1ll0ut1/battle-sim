# API Documentation

## Core APIs

### Unit System

```typescript
interface Unit {
  readonly id: string;
  readonly attributes: UnitAttributes;
  readonly combat: CombatComponent;
  readonly body: BodyComponent;
  readonly movement: MovementComponent;
  readonly work: WorkComponent;
  
  update(deltaTime: number): void;
  serialize(): UnitState;
  deserialize(state: UnitState): void;
}

interface UnitAttributes {
  age: number;
  gender: Gender;
  health: number;
  stamina: number;
  experience: number;
  
  update(deltaTime: number): void;
  modifyAttribute(name: string, value: number): void;
}

interface CombatComponent {
  attack: number;
  defense: number;
  weapon: Weapon | null;
  
  performAttack(target: Unit): void;
  defend(attack: Attack): void;
  calculateDamage(): number;
}
```

### Event System

```typescript
interface Event {
  type: string;
  payload: any;
  timestamp: number;
}

interface EventBus {
  emit(event: Event): void;
  on(type: string, handler: (event: Event) => void): void;
  off(type: string, handler: (event: Event) => void): void;
  once(type: string, handler: (event: Event) => void): void;
}
```

### Battle System

```typescript
interface CombatEngine {
  processAttack(attack: Attack): CombatResult;
  calculateHitChance(attacker: Unit, defender: Unit): number;
  applyTerrainModifiers(position: Position): CombatModifiers;
}

interface InjuryManager {
  createInjury(damage: number, type: DamageType): Injury;
  processInjury(unit: Unit, injury: Injury): void;
  healInjury(injury: Injury, amount: number): void;
}
```

### Terrain System

```typescript
interface TerrainGrid {
  getCell(position: Position): TerrainCell;
  getHeight(position: Position): number;
  getFeatures(position: Position): TerrainFeature[];
  modifyTerrain(position: Position, modification: TerrainModification): void;
}

interface PathfindingManager {
  findPath(start: Position, end: Position, options: PathOptions): Promise<Path>;
  getMovementCost(unit: Unit, cell: TerrainCell): number;
  isPassable(position: Position, unit: Unit): boolean;
}
```

### Performance Systems

```typescript
interface SpatialHashGrid {
  updateUnit(unit: Unit): void;
  query(position: Position, range: number): Unit[];
  getNearbyUnits(unit: Unit, range: number): Unit[];
  remove(unit: Unit): void;
}

interface BatchProcessor {
  processBatch<T>(items: T[], processor: (item: T) => void): void;
  addBatch(name: string, items: any[], processor: Function): void;
  removeBatch(name: string): void;
}
```

### Network System

```typescript
interface BattleCoordinator {
  startBattle(config: BattleConfig): void;
  updateBattleState(state: BattleState): void;
  endBattle(result: BattleResult): void;
  broadcastUpdate(update: BattleUpdate): void;
}

interface WebSocketServer {
  broadcast(type: string, data: any): void;
  send(client: WebSocket, type: string, data: any): void;
  onClientConnect(handler: (client: WebSocket) => void): void;
}
```

## State Changes and Events

### State Change Events

These events are emitted when state changes occur. They contain both the new state (for UI) and the previous state (for logging).

#### Unit State Events

```typescript
interface UnitMovedEvent {
  unitId: string;
  oldPosition: Position;  // For logging
  newPosition: Position;  // For UI update
}

interface UnitHealthChangedEvent {
  unitId: string;
  attackerId: string;
  damage: number;
  oldHealth: number;     // For logging
  newHealth: number;     // For UI update
}

interface UnitDiedEvent {
  unitId: string;
  cause: string;
  killedBy: string;
}

interface UnitCreatedEvent {
  unitId: string;
  position: Position;
  type: string;
}
```

#### Combat Events

```typescript
interface CombatAttackEvent {
  attackerId: string;
  targetId: string;
  damage: number;
  type: string;
}
```

### Direct Method Calls

State changes should be performed through methods, which then emit events:

```typescript
class Unit {
  move(newPosition: Position) {
    const oldPosition = this.position;
    this.position = newPosition;
    
    eventBus.emit('unit.moved', {
      unitId: this.id,
      oldPosition,
      newPosition
    });
  }

  receiveHit(damage: number, attacker: Unit) {
    const oldHealth = this.health;
    this.health = Math.max(0, this.health - damage);
    
    eventBus.emit('unit.healthChanged', {
      unitId: this.id,
      attackerId: attacker.id,
      damage,
      oldHealth,
      newHealth: this.health
    });

    if (this.health <= 0) {
      eventBus.emit('unit.died', { 
        unitId: this.id,
        cause: 'combat',
        killedBy: attacker.id
      });
    }
  }
}
```

### Event Subscribers

#### Logger

```typescript
class BattleLogger {
  constructor(private logLevel: LogLevel) {
    this.setupSubscriptions();
  }

  private setupSubscriptions() {
    if (this.logLevel >= LogLevel.Debug) {
      eventBus.on('unit.moved', this.logUnitMoved);
      eventBus.on('unit.healthChanged', this.logUnitHealth);
      eventBus.on('unit.died', this.logUnitDied);
    }
  }

  private logUnitMoved = (event: UnitMovedEvent) => {
    logger.debug('Unit moved', {
      unitId: event.unitId,
      from: event.oldPosition,
      to: event.newPosition
    });
  }

  private logUnitHealth = (event: UnitHealthChangedEvent) => {
    logger.debug('Unit health changed', {
      unitId: event.unitId,
      attackerId: event.attackerId,
      damage: event.damage,
      from: event.oldHealth,
      to: event.newHealth
    });
  }
}
```

#### UI Updates

```typescript
class BattleView {
  constructor() {
    this.setupSubscriptions();
  }

  private setupSubscriptions() {
    eventBus.on('unit.moved', this.updateUnitPosition);
    eventBus.on('unit.healthChanged', this.updateUnitHealth);
    eventBus.on('unit.died', this.removeUnit);
    eventBus.on('unit.created', this.addUnit);
  }

  private updateUnitPosition = (event: UnitMovedEvent) => {
    // Use only new state for UI
    this.moveUnitSprite(event.unitId, event.newPosition);
  }

  private updateUnitHealth = (event: UnitHealthChangedEvent) => {
    // Use only new state for UI
    this.updateHealthBar(event.unitId, event.newHealth);
  }
}
```

### Usage Examples

#### Battle System

```typescript
class Battle {
  private processUnitAction(unit: Unit) {
    // Direct method calls trigger events
    if (unit.shouldAttack(target)) {
      unit.performAttack(target);
    }
    
    if (unit.shouldMove()) {
      unit.move(newPosition);
    }
  }
}
```

#### Pathfinding Example

```typescript
// Following path - direct calls trigger events
for (const waypoint of path) {
  unit.move(waypoint);
  
  const target = unit.findTarget();
  if (target) {
    unit.performAttack(target);
  }
}
```

This approach provides several benefits:

1. Single source of truth for state changes
2. Complete state change history for logging
3. Efficient UI updates
4. Clear separation between state changes and their effects
5. Easy to add new subscribers without modifying core logic
