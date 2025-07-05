# Contributing Guide

## Project Structure

We follow a modular approach where each module is self-contained with its own implementation, tests, and types:

```
/ModuleName/
  ModuleName.ts         # Main implementation
  ModuleName.test.ts    # Tests
  calculateStuff.ts     # Helper functions used only by this module
  calculateStuff.test.ts
```

## Development Workflow

1. **Setup**
   ```bash
   # Install dependencies
   npm install
   
   # Run tests
   npm test
   
   # Start development server
   npm run dev
   ```

2. **Making Changes**
   - Work in small, focused iterations
   - Write tests before implementation
   - Keep modules self-contained
   - Run tests frequently

3. **Code Organization**
   - One class/component per file
   - Keep files under 300 lines
   - Place private methods at end of file
   - Group related functionality in modules

## Coding Standards

### TypeScript Usage

```typescript
// DO: Let TypeScript infer types when obvious
const battle = new Battle(config);

// DO: Explicitly type complex objects
interface BattleConfig {
  units: Unit[];
  terrain: TerrainGrid;
  objectives: Objective[];
}

// DON'T: Add unnecessary return type annotations
// Bad
function getName(): string {
  return this.name;
}

// Good
function getName() {
  return this.name;
}

// DO: Use type inference for simple functions
const double = (n: number) => n * 2;

// DO: Type complex function parameters
function processCombat(
  attacker: Unit,
  defender: Unit,
  options: CombatOptions
) {
  // Implementation
}
```

### Testing

```typescript
// DO: Test behavior, not implementation
describe('Unit', () => {
  it('should take damage when hit', () => {
    const unit = new Unit({ health: 100 });
    unit.takeDamage(20);
    expect(unit.health).toBe(80);
  });
});

// DON'T: Test private methods
// Bad
describe('Unit', () => {
  it('should calculate internal damage modifier', () => {
    expect(unit['calculateDamageModifier']()).toBe(1.5);
  });
});
```

### Performance Considerations

1. **Batch Processing**
   ```typescript
   // DO: Process units in batches
   function updateUnits(units: Unit[]) {
     // Process 1000 units at a time
     for (let i = 0; i < units.length; i += 1000) {
       const batch = units.slice(i, i + 1000);
       processBatch(batch);
     }
   }
   ```

2. **Spatial Queries**
   ```typescript
   // DO: Use spatial partitioning
   function findNearbyUnits(position: Position, range: number) {
     return spatialGrid.query(position, range);
   }
   
   // DON'T: Check all units
   // Bad
   function findNearbyUnits(position: Position, range: number) {
     return allUnits.filter(unit => 
       distance(unit.position, position) <= range
     );
   }
   ```

### Module Organization

```typescript
// DO: Group related functionality
/UnitSystem/
  Unit.ts              // Core unit functionality
  UnitFactory.ts       // Unit creation
  UnitState.ts         // State management
  components/          // Unit components
    Combat.ts
    Movement.ts
    Work.ts
  utils/              // Unit-specific utilities
    calculateDamage.ts
    pathfinding.ts
```

## Common Pitfalls

1. **Memory Management**
   ```typescript
   // DON'T: Keep references to removed units
   // Bad
   class Battle {
     private allUnits: Unit[] = [];
     
     removeUnit(unit: Unit) {
       // Just removing from active units but keeping in allUnits
       this.activeUnits = this.activeUnits.filter(u => u !== unit);
     }
   }
   
   // DO: Clean up all references
   class Battle {
     private units: Unit[] = [];
     
     removeUnit(unit: Unit) {
       this.units = this.units.filter(u => u !== unit);
       this.spatialGrid.remove(unit);
       unit.dispose(); // Clean up unit resources
     }
   }
   ```

2. **Performance**
   ```typescript
   // DON'T: Create objects in update loop
   // Bad
   update() {
     const state = { x: this.x, y: this.y }; // New object every frame
   }
   
   // DO: Reuse objects
   class Unit {
     private stateObject = { x: 0, y: 0 };
     
     update() {
       this.stateObject.x = this.x;
       this.stateObject.y = this.y;
     }
   }
   ```

## Best Practices

1. **Error Handling**
   ```typescript
   // DO: Use specific error types
   class UnitError extends Error {
     constructor(message: string) {
       super(`Unit Error: ${message}`);
     }
   }
   
   // DO: Handle errors at boundaries
   async function handleBattleCommand(command: Command) {
     try {
       await processBattleCommand(command);
     } catch (error) {
       logger.error('Battle command failed', { command, error });
       throw new BattleError(`Command failed: ${error.message}`);
     }
   }
   ```

2. **State Management**
   ```typescript
   // DON'T: Modify state directly
   // Bad
   class Unit {
     health = 100;
     
     attack(target: Unit) {
       target.health -= 20; // Direct state modification
     }
   }
   
   // DO: Use methods for state changes and log them
   class Unit {
     private health = 100;
     
     takeDamage(amount: number) {
       const oldHealth = this.health;
       this.health = Math.max(0, this.health - amount);
       logger.debug('Unit took damage', { 
         unitId: this.id, 
         damage: amount,
         oldHealth,
         newHealth: this.health 
       });
     }
     
     attack(target: Unit) {
       target.takeDamage(20);
     }
   }
   ```

3. **Resource Management**
   ```typescript
   // DO: Clean up resources
   class Battle {
     dispose() {
       this.units.forEach(unit => unit.dispose());
       this.terrain.dispose();
       this.spatialGrid.clear();
     }
   }
   ```

## Pull Request Guidelines

1. **Description**
   - Explain the changes
   - Reference related issues
   - List breaking changes

2. **Checklist**
   - [ ] Tests added/updated
   - [ ] Documentation updated
   - [ ] Performance impact considered
   - [ ] Breaking changes documented

3. **Code Review**
   - Review your own code first
   - Respond to comments promptly
   - Keep discussions focused 