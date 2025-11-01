# Coding Guidelines

**Purpose:** Standards for producing clean, maintainable code at senior developer level.
**Audience:** Claude Code and human developers working on this project.

## Table of Contents

1. [TypeScript Type System](#typescript-type-system)
2. [File Organization](#file-organization)
3. [Class Design Patterns](#class-design-patterns)
4. [Error Handling](#error-handling)
5. [Testing Standards](#testing-standards)
6. [Documentation](#documentation)
7. [Performance](#performance)
8. [Code Style](#code-style)
9. [Common Pitfalls](#common-pitfalls)

---

## TypeScript Type System

### Strict Typing - No Escape Hatches

**Rule:** Never use `any`, `as` type assertions, or `!` non-null assertions.

**Don't:**
```typescript
// ❌ Using 'any' escape hatch
const speed = (unit.movement as any).currentSpeed;

// ❌ Using type assertion
const value = data as number;

// ❌ Using non-null assertion
const unit = units.find(u => u.id === id)!;
```

**Do:**
```typescript
// ✅ Proper type narrowing
const movementState = unit.movement as { currentSpeed?: number };
if (movementState.currentSpeed !== undefined) {
    const speed = movementState.currentSpeed;
}

// ✅ Type guards
function isNumber(value: unknown): value is number {
    return typeof value === 'number';
}

// ✅ Explicit undefined handling
const unit = units.find(u => u.id === id);
if (!unit) {
    throw new Error(`Unit ${id} not found`);
}
```

### Let TypeScript Infer

**Rule:** Let TypeScript infer types when obvious. Only annotate when clarity is needed.

**Don't:**
```typescript
// ❌ Unnecessary annotations
public update(deltaTime: number): void {
    const units: Unit[] = this.getAllUnits();
}
```

**Do:**
```typescript
// ✅ Inferred return type and variable types
public update(deltaTime: number) {
    const units = this.getAllUnits();
}

// ✅ Explicit when needed for clarity
public findNearestEnemy(unit: Unit): Unit | null {
    // Return type makes intent clear
}
```

---

## File Organization

### Single Responsibility Principle

**Rule:** Split files by SRP and domain. One class per file. Maximum 300 lines per file.

**Structure:**
```
/Unit/
  Unit.ts                    # Main entity (200 lines)
  Unit.test.ts              # Unit tests
  UnitMovement.ts           # Component (150 lines)
  UnitMovement.test.ts
  UnitCombat.ts             # Component (180 lines)
  UnitCombat.test.ts
  calculateDistance.ts      # Pure utility (20 lines)
  calculateDistance.test.ts
```

**Don't:**
```typescript
// ❌ Monolithic file with multiple responsibilities
// Unit.ts (1000 lines)
export class Unit { /* movement, combat, inventory, AI, rendering */ }
export class UnitRenderer { /* ... */ }
export class UnitAi { /* ... */ }
```

**Do:**
```typescript
// ✅ Focused, single-purpose files
// Unit.ts (200 lines)
export class Unit {
    movement: UnitMovement;
    combat: UnitCombat;
    health: UnitHealth;
}

// UnitMovement.ts (150 lines)
export class UnitMovement {
    // Only movement logic
}
```

### Export at Definition

**Rule:** Always export classes and enums at their definition.

**Don't:**
```typescript
// ❌ Separate export statement
class Unit { }
export { Unit };
```

**Do:**
```typescript
// ✅ Export at definition
export class Unit { }
export enum ActionType { }
```

### No Types Files

**Rule:** Never create `types.ts` files. Define types in the files where they're used.

**Don't:**
```
/Unit/
  types.ts              # ❌ Separated type definitions
  Unit.ts
```

**Do:**
```typescript
// ✅ Types defined near usage in Unit.ts
export interface UnitConfig {
    name: string;
    team: number;
}

export class Unit {
    constructor(config: UnitConfig) { }
}
```

---

## Class Design Patterns

### When to Use Classes

**Rule:** Use classes for entities and state management. Use pure functions for stateless operations.

**Classes for:**
- Game entities (Unit, Map, Terrain)
- Systems with state (CombatSystem, MovementSystem)
- Components (UnitMovement, UnitCombat)

**Functions for:**
- Calculations (distance, angle, damage)
- Transformations (coordinate conversions)
- Utilities (formatters, validators)

**Example:**
```typescript
// ✅ Class for stateful entity
export class Unit {
    private _health: number;

    constructor(config: UnitConfig) {
        this._health = config.maxHealth;
    }

    takeDamage(amount: number) {
        this._health = Math.max(0, this._health - amount);
    }
}

// ✅ Pure function for calculation
export function calculateDistance(
    pos1: { x: number; y: number },
    pos2: { x: number; y: number }
): number {
    return Math.sqrt(
        Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2)
    );
}
```

### Composition Over Inheritance

**Rule:** Prefer composition and component-based architecture.

**Don't:**
```typescript
// ❌ Deep inheritance hierarchy
class Entity { }
class LivingEntity extends Entity { }
class CombatEntity extends LivingEntity { }
class Unit extends CombatEntity { }
```

**Do:**
```typescript
// ✅ Composition with components
export class Unit {
    readonly id: string;
    readonly health: UnitHealth;
    readonly combat: UnitCombat;
    readonly movement: UnitMovement;
    readonly stamina: UnitStamina;

    constructor(config: UnitConfig) {
        this.health = new UnitHealth(config.maxHealth);
        this.combat = new UnitCombat(this);
        this.movement = new UnitMovement(config.position);
        this.stamina = new UnitStamina(config.maxStamina);
    }
}
```

### No Proxy Methods

**Rule:** No getter boilerplate or proxy methods to dependencies. Access directly.

**Don't:**
```typescript
// ❌ Unnecessary proxies
export class Unit {
    getHealth() {
        return this.health.getValue();
    }

    getPosition() {
        return this.movement.getPosition();
    }
}
```

**Do:**
```typescript
// ✅ Direct access
export class Unit {
    readonly health: UnitHealth;
    readonly movement: UnitMovement;
}

// Usage
const hp = unit.health.current;
const pos = unit.movement.position;
```

---

## Error Handling

### Fail Fast

**Rule:** Validate inputs early and throw errors immediately for invalid states.

**Don't:**
```typescript
// ❌ Silent failures
public addUnit(unit: Unit | null) {
    if (unit) {
        this.units.push(unit);
    }
}
```

**Do:**
```typescript
// ✅ Fail fast with clear errors
public addUnit(unit: Unit) {
    if (!unit) {
        throw new Error('Cannot add null unit');
    }
    if (this.units.some(u => u.id === unit.id)) {
        throw new Error(`Unit ${unit.id} already exists`);
    }
    this.units.push(unit);
}
```

### Type-Driven Validation

**Rule:** Use TypeScript's type system for validation. Narrow types to valid states.

**Don't:**
```typescript
// ❌ Runtime checks for preventable errors
function processAction(action: string) {
    if (action !== 'attack' && action !== 'block' && action !== 'dodge') {
        throw new Error('Invalid action');
    }
}
```

**Do:**
```typescript
// ✅ Type system prevents invalid values
export type ActionType = 'attack' | 'block' | 'dodge' | 'riposte';

function processAction(action: ActionType) {
    // No runtime check needed - TypeScript guarantees valid value
}
```

### Specific Error Types

**Don't:**
```typescript
// ❌ Generic errors
throw new Error('Something went wrong');
```

**Do:**
```typescript
// ✅ Specific, actionable errors
throw new Error(`Unit ${unitId} not found in battle`);
throw new Error(`Cannot perform ${action}: insufficient stamina`);
throw new Error(`Invalid position (${x}, ${y}): outside map bounds`);
```

---

## Testing Standards

### What to Test

**Rule:** Test business logic, edge cases, integration points, and performance bottlenecks. Quality over quantity - avoid massive test suites.

**Coverage priorities:**
1. **Business logic** - Combat calculations, movement physics, AI decisions
2. **Edge cases** - Zero values, negative numbers, boundary conditions
3. **Integration** - System interactions, event flows
4. **Performance** - Critical paths with 10k+ entities

**Don't test:**
- **Semantic details** - What something is rather than what it does
- **Already covered behavior** - If nested unit tests or integration tests cover it, don't duplicate
- **Implementation details** - Private methods, internal state management
- **Framework behavior** - Don't test that libraries work as documented

### Test Structure and Helper Methods

**Rule:** Keep test cases concise. Extract helper methods if test exceeds 10 lines. Use Arrange-Act-Assert pattern for clarity.

**Don't:**
```typescript
// ❌ Verbose test with repetitive setup (>10 lines)
it('should handle combat between multiple units', () => {
    const unit1 = new Unit({
        id: '1',
        name: 'Warrior',
        maxHealth: 100,
        position: { x: 0, y: 0 },
        attributes: { strength: 10, experience: 0.5 }
    });
    const unit2 = new Unit({
        id: '2',
        name: 'Knight',
        maxHealth: 150,
        position: { x: 50, y: 50 },
        attributes: { strength: 15, experience: 0.7 }
    });

    unit1.combat.startAction('attack', unit2);
    unit1.combat.update(1.0);

    expect(unit2.health.current).toBeLessThan(150);
});
```

**Do:**
```typescript
// ✅ Concise test with helper methods
describe('UnitCombat', () => {
    let attacker: Unit;
    let defender: Unit;

    beforeEach(() => {
        attacker = createTestUnit({ strength: 10, experience: 0.5 });
        defender = createTestUnit({ maxHealth: 150, strength: 15 });
    });

    it('should reduce target health when attack hits', () => {
        // Arrange - setup done in beforeEach

        // Act
        performAttack(attacker, defender);

        // Assert
        expect(defender.health.current).toBeLessThan(150);
    });

    it('should consume stamina when attacking', () => {
        // Arrange
        const initialStamina = attacker.stamina.current;

        // Act
        performAttack(attacker, defender);

        // Assert
        expect(attacker.stamina.current).toBeLessThan(initialStamina);
    });
});

// Helper methods in same file or shared test utilities
function createTestUnit(overrides?: Partial<UnitConfig>): Unit {
    return new Unit({
        id: generateId(),
        name: 'Test Unit',
        maxHealth: 100,
        position: { x: 0, y: 0 },
        ...overrides,
    });
}

function performAttack(attacker: Unit, target: Unit) {
    attacker.combat.startAction('attack', target);
    attacker.combat.update(1.0);
}
```

### Test Behavior, Not Implementation

**Rule:** Test the public API and observable behavior. Don't test internal implementation details.

**Don't:**
```typescript
// ❌ Testing implementation details
it('should call calculateDamage with correct parameters', () => {
    const spy = jest.spyOn(combat, 'calculateDamage');
    unit.attack(target);
    expect(spy).toHaveBeenCalledWith(expect.any(Number));
});

// ❌ Semantic testing - testing what it is
it('should have a health property', () => {
    expect(unit.health).toBeDefined();
});

// ❌ Testing private methods
it('should calculate internal damage modifier', () => {
    const modifier = (unit.combat as any).calculateDamageModifier();
    expect(modifier).toBeGreaterThan(0);
});
```

**Do:**
```typescript
// ✅ Testing observable behavior
it('should reduce target health when attack hits', () => {
    const initialHealth = target.health.current;

    attacker.combat.attack(target);

    expect(target.health.current).toBeLessThan(initialHealth);
});

// ✅ Testing business logic
it('should deal more damage with higher strength', () => {
    const weakAttacker = createTestUnit({ strength: 5 });
    const strongAttacker = createTestUnit({ strength: 20 });
    const target1 = createTestUnit({ maxHealth: 100 });
    const target2 = createTestUnit({ maxHealth: 100 });

    weakAttacker.combat.attack(target1);
    strongAttacker.combat.attack(target2);

    const weakDamage = 100 - target1.health.current;
    const strongDamage = 100 - target2.health.current;
    expect(strongDamage).toBeGreaterThan(weakDamage);
});
```

### Avoid Duplicate Coverage

**Rule:** If behavior is already covered by component tests or integration tests, don't test it again.

**Example:**
```typescript
// UnitMovement.test.ts - Tests movement logic
it('should move unit to target position', () => {
    movement.moveTo({ x: 100, y: 100 });
    expect(movement.position).toEqual({ x: 100, y: 100 });
});

// Unit.test.ts - Don't duplicate movement tests
// ❌ Don't do this - already tested in UnitMovement.test.ts
it('should move unit when moveTo is called', () => {
    unit.movement.moveTo({ x: 100, y: 100 });
    expect(unit.movement.position.x).toBe(100);
});

// ✅ Do this - test Unit's integration with movement
it('should stop movement when unit becomes unconscious', () => {
    unit.movement.moveTo({ x: 100, y: 100 });
    unit.health.takeDamage(1000); // Becomes unconscious

    expect(unit.movement.isMoving).toBe(false);
});
```

### No Missing Tests

**Rule:** Every module must have corresponding test file. Tests are mandatory, not optional. Focus on critical business logic over exhaustive coverage.

---

## Documentation

### JSDoc on Public API

**Rule:** Use multiline JSDoc comments on public classes, methods, and interfaces. Inline comments for complex logic.

**Don't:**
```typescript
// ❌ No documentation on public API
export class UnitCombat {
    public startAction(action: ActionType, target: Unit) { }
}
```

**Do:**
```typescript
/**
 * Manages combat actions and state for a unit
 * Handles action timing, interrupts, and combat effectiveness
 */
export class UnitCombat {
    /**
     * Initiates a combat action against a target
     * @param action - Type of action to perform (attack, block, dodge, etc.)
     * @param target - Target unit for the action
     * @throws Error if action is invalid or unit cannot perform action
     */
    public startAction(action: ActionType, target: Unit) {
        // Complex logic deserves inline comments
        if (this.currentAction && !this.currentAction.canInterrupt) {
            // Riposte actions cannot be interrupted (uninterruptible counter)
            throw new Error('Cannot interrupt current action');
        }
    }
}
```

### When to Comment

**Do comment:**
- Why decisions were made (not what the code does)
- Complex algorithms or formulas
- Non-obvious performance optimizations
- Workarounds or edge case handling

**Don't comment:**
- Obvious code
- What the code does (the code should be self-documenting)

**Example:**
```typescript
// ❌ Obvious comment
// Check if unit is alive
if (unit.health.isAlive()) { }

// ✅ Explains why
// Super experienced fighters (0.8+) can sense attacks from any direction
// This represents battlefield awareness gained through combat experience
if (unit.attributes.experience >= 0.8) {
    return true;
}
```

---

## Performance

### Profile-Guided Optimization

**Rule:** Only optimize proven bottlenecks. Profile first, then optimize.

**Process:**
1. Write clear, simple code first
2. Profile with realistic load (10k+ units)
3. Identify bottlenecks (>10% total time)
4. Optimize specific hotspots
5. Measure improvement

**Don't:**
```typescript
// ❌ Premature optimization
export class UnitManager {
    private spatialHashGrid: SpatialGrid; // Added for "performance"
    private objectPool: ObjectPool;        // Not proven necessary
    private cachedDistances: Map<string, number>;
}
```

**Do:**
```typescript
// ✅ Simple first, optimize later if needed
export class UnitManager {
    private units: Unit[] = [];

    findNearbyUnits(position: Vector2, range: number): Unit[] {
        // O(n) is fine for <1000 units
        // If profiling shows this is a bottleneck, add spatial partitioning
        return this.units.filter(u =>
            this.calculateDistance(u.position, position) <= range
        );
    }
}
```

### Known Bottlenecks

**Optimize these patterns:**
- O(n²) loops in update cycles
- Distance calculations in inner loops (use squared distance)
- Unnecessary object allocations in hot paths
- Event listener leaks

---

## Code Style

### Naming Conventions

**Rule:** PascalCase for classes/interfaces, camelCase for variables/functions, `_underscore` ONLY when paired with getter/setter.

**Examples:**
```typescript
// Classes and interfaces
export class UnitCombat { }
export interface UnitConfig { }
export enum ActionType { }

// Variables and functions
const maxHealth = 100;
const calculateDamage = (strength: number) => strength * 2;

// ✅ Underscore with getter/setter pair
export class Unit {
    private _health: number;

    get health() {
        return this._health;
    }

    set health(value: number) {
        this._health = Math.max(0, value);
    }
}

// ✅ Regular private without getter/setter - no underscore
export class UnitCombat {
    private currentAction: ActionType | null = null;
    private actionStartTime: number = 0;

    public startAction(action: ActionType) {
        this.currentAction = action;
        this.actionStartTime = Date.now();
    }
}

// ❌ Wrong - underscore without getter/setter
export class Bad {
    private _currentAction: ActionType;  // Should be: private currentAction
    private _startTime: number;          // Should be: private startTime
}
```

### No Defensive Copying

**Rule:** Do not use object cloning or defensive copying. Use direct property access and assignment.

**Don't:**
```typescript
// ❌ Unnecessary defensive copying
public getPosition(): Vector2 {
    return { ...this.position };
}

public setUnits(units: Unit[]) {
    this.units = [...units];
}

public updateConfig(config: Partial<Config>) {
    this.config = Object.assign({}, this.config, config);
}
```

**Do:**
```typescript
// ✅ Direct access
public getPosition(): Vector2 {
    return this.position;
}

public setUnits(units: Unit[]) {
    this.units = units;
}

public updateConfig(config: Partial<Config>) {
    Object.assign(this.config, config);
}
```

### Validate External Input

**Rule:** External data from APIs, user input, file loading, or network messages must be validated and sanitized at the boundary.

**External boundaries:**
- WebSocket messages from clients
- REST API requests
- File uploads / file system reads
- User input from UI forms
- Query parameters / URL data

**Don't:**
```typescript
// ❌ Trust external data without validation
export class GameServer {
    handleMessage(message: any) {
        const unit = this.units[message.unitId];
        unit.moveTo(message.position);
    }
}
```

**Do:**
```typescript
// ✅ Validate at external boundary
export class GameServer {
    handleMessage(rawMessage: unknown) {
        // Validate structure and types
        const message = this.validateMessage(rawMessage);

        // Validate business rules
        if (!this.units.has(message.unitId)) {
            throw new Error(`Unit ${message.unitId} not found`);
        }
        if (message.position.x < 0 || message.position.x > this.map.width) {
            throw new Error(`Invalid x position: ${message.position.x}`);
        }

        const unit = this.units.get(message.unitId);
        unit.moveTo(message.position);
    }

    private validateMessage(data: unknown): MoveCommand {
        if (!isObject(data)) {
            throw new Error('Message must be an object');
        }
        if (!('unitId' in data) || typeof data.unitId !== 'string') {
            throw new Error('unitId must be a string');
        }
        // ... validate all fields
        return data as MoveCommand;
    }
}

// ✅ Validate file input
export function loadMapFromFile(filepath: string): Map {
    const content = fs.readFileSync(filepath, 'utf-8');
    const json = JSON.parse(content);

    // Validate and sanitize unknown JSON data
    if (!isValidMapData(json)) {
        throw new Error('Invalid map file format');
    }

    // Clamp values to safe ranges
    const width = Math.max(100, Math.min(10000, json.width));
    const height = Math.max(100, Math.min(10000, json.height));

    return new Map({ width, height, terrain: json.terrain });
}

// ✅ Map external naming conventions to internal conventions
export function mapApiResponseToUnit(apiData: unknown): Unit {
    // Validate external data structure
    if (!isValidApiUnitData(apiData)) {
        throw new Error('Invalid API unit data');
    }

    // Map snake_case or other conventions to camelCase
    return new Unit({
        id: apiData.unit_id,                    // unit_id -> id
        name: apiData.display_name,             // display_name -> name
        maxHealth: apiData.max_health,          // max_health -> maxHealth
        experienceLevel: apiData.xp_level,      // xp_level -> experienceLevel
        position: {
            x: apiData.pos_x,                   // pos_x -> position.x
            y: apiData.pos_y,                   // pos_y -> position.y
        },
    });
}
```

### State Changes with Logging

**Rule:** State changes should be explicit methods (not direct property mutation) and logged for debugging.

**Don't:**
```typescript
// ❌ Direct mutation
unit.health.current = 50;
unit.movement.position.x = 100;
```

**Do:**
```typescript
// ✅ Explicit methods with logging
export class UnitHealth {
    private current: number;

    public takeDamage(amount: number) {
        const oldHealth = this.current;
        this.current = Math.max(0, this.current - amount);

        Logger.debug('health',
            `${this.unitId} took ${amount} damage: ${oldHealth} -> ${this.current}`
        );
    }
}
```

---

## Common Pitfalls

### Deal Breakers

**These patterns are unacceptable:**

❌ **Type Escape Hatches**
```typescript
// NEVER do this
const value = data as any;
const unit = units[0]!;
```

❌ **Over-Engineering**
```typescript
// NEVER add abstraction without proven need
class UnitFactory extends AbstractFactory<Unit>
    implements IFactory, IBuilder { }
```

❌ **Missing Tests**
```typescript
// NEVER commit code without tests
export class ImportantBusinessLogic {
    // 200 lines of untested code
}
```

❌ **Breaking Single Responsibility**
```typescript
// NEVER mix responsibilities
export class Unit {
    // Movement, combat, AI, rendering, networking all in one class
}
```

### YAGNI and KISS

**You Aren't Gonna Need It & Keep It Simple, Stupid**

**Don't:**
- Add features/abstractions for hypothetical future needs
- Create elaborate architectures for simple problems
- Abstract before you have 3+ concrete uses

**Do:**
- Solve the immediate problem simply
- Refactor when patterns emerge
- Add complexity only when justified by actual requirements

### SOLID Principles

**Focus on:**
- **Single Responsibility** - One reason to change
- **Open/Closed** - Extend via composition, not modification
- **Dependency Inversion** - Depend on interfaces, not concrete implementations

**Example:**
```typescript
// ✅ SRP: Each component has one responsibility
export class Unit {
    readonly combat: UnitCombat;      // Combat behavior
    readonly movement: UnitMovement;  // Movement behavior
    readonly health: UnitHealth;      // Health tracking
}

// ✅ Open/Closed: Extend via new components
export class UnitInventory {
    // Add inventory without modifying Unit class
}
```

---

## Quick Reference

### File Checklist
- [ ] One class per file, <300 lines
- [ ] Export at definition
- [ ] Has corresponding .test.ts file
- [ ] No `any`, `as`, or `!` type escape hatches
- [ ] JSDoc on public methods
- [ ] Follows SRP

### Code Review Checklist
- [ ] Tests cover business logic and edge cases
- [ ] No over-engineering or premature optimization
- [ ] Error messages are specific and actionable
- [ ] State changes use explicit methods
- [ ] No defensive copying or proxy methods
- [ ] Classes for state, functions for calculations
- [ ] Direct property access preferred

---

**Remember:** These guidelines serve the goal of writing clean, maintainable code that a senior developer would produce. When in doubt, favor simplicity, clarity, and testability.