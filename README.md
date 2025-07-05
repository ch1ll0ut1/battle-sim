# Realistic Battle Simulator

A comprehensive battle simulation system that models realistic combat mechanics, unit characteristics, and battlefield dynamics.

## Core Concepts

### Unit Characteristics

**Physical Attributes:**

- **Experience** (0.0-1.0): Determines combat skill, defensive awareness, weapon handling, shock resistance, and pain resistance
- **Strength** (0-100): Affects damage output, armor capacity, and weapon wielding ability
- **Weight** (0-200): Influences movement, stamina, and armor carrying capacity
- **Stamina**: Dynamic resource calculated from weight, strength, experience, and conditioning that affects combat effectiveness

**Body System:**

- **Body Parts**: Head, torso, left/right arms, left/right legs
- **Injury System**: Minor, moderate, severe, critical, and fatal injuries
- **Injury Effects**: Damage, bleeding, pain, shock, and permanent damage
- **Consciousness**: Affected by injuries, blood loss, and shock
- **Armor Integration**: Armor reduces injury effects based on coverage

**Stamina System:**

- Automatically calculated based on weight, strength, experience, and conditioning
- Well-conditioned units (high strength-to-weight ratio) have better stamina and recovery
- Affects all combat actions and movement
- Units become less effective as stamina depletes
- Recovery rates vary based on activity and conditioning

**Experience System:**

- **Combat Skill**: Higher experience improves weapon handling and hit rates
- **Defensive Awareness**: Experienced units defend better from side and back attacks
- **Stamina Management**: Veterans have better conditioning and stamina recovery
- **Shock Resistance**: Combat experience provides psychological resilience to injury shock
- **Pain Resistance**: Veterans have better tolerance to pain effects from combat exposure
- **Weapon Proficiency**: Experienced units handle heavy weapons more effectively
- **Situational Awareness**: Veterans have better tactical positioning and decision-making

### Combat Mechanics

**Hit Rate Calculation:**

- Base hit rate modified by weapon weight and unit experience
- Heavy weapons reduce accuracy but experienced units handle them better
- Units without weapons have reduced effectiveness

**Weapon System:**

- Different weapon types (swords, axes, spears, etc.)
- Weight affects handling and stamina drain
- Units must meet strength requirements to wield weapons effectively
- Two-handed vs one-handed attacks with different damage and speed trade-offs

**Attack Types:**

- **Direction**: Front, side, back attacks with different effectiveness
- **Style**: Stab vs slash attacks with different armor penetration
- **Handedness**: One-handed (faster, less damage) vs two-handed (slower, more damage)

### Defensive Systems

**Armor System:**

- Full body or partial armor coverage
- Different armor types with varying protection and weight
- Armor weight affects movement and stamina
- Units must meet strength/weight requirements to wear armor
- Armor reduces injury effects based on coverage and material

**Shield System:**

- Additional defensive equipment
- Affects blocking ability and stamina costs

**Defensive Awareness:**

- Experience level determines ability to defend from different angles
- Side and back attacks are harder to defend against
- Experienced units have better situational awareness

**Blocking and Dodging:**

- Active defensive actions that cost stamina
- Effectiveness varies with experience and equipment

### Movement and Positioning

**Movement States:**

- Stationary: No stamina drain, fastest recovery
- Walking: Light stamina drain, moderate recovery
- Running: Higher stamina drain, reduced recovery
- Circling: Tactical movement for positioning

**Combat Positioning:**

- Units can attack from different angles
- Positioning affects hit rates and defensive effectiveness
- Movement costs stamina and affects recovery

## Implemented Systems

### ✅ Core Unit System

- Unit creation with physical characteristics (experience, weight, strength)
- Body system with injury management and consciousness tracking
- Combat system with stamina management and action validation
- Integration between body and combat systems
- Experience-based shock and pain resistance (veterans are more resistant to injury effects)

### ✅ Body System

- Body part management (head, torso, arms, legs)
- Injury system with severity levels and effects
- Injury processing with damage, bleeding, pain, and shock
- Consciousness tracking affected by injuries
- Armor integration for injury reduction
- Blood loss and death mechanics

### ✅ Combat System

- Dynamic stamina calculation based on unit characteristics
- Action-based stamina costs for different combat actions
- Passive stamina drain from equipment and movement
- Recovery rates based on activity and conditioning
- Combat effectiveness calculation considering multiple factors
- Action validation (stamina, consciousness, body part functionality)
- Weapon wielding and equipment management

### ✅ Weapon System

- Comprehensive weapon types with realistic properties
- Weapon wielding requirements based on unit strength
- Hit rate modifications based on weapon weight and unit experience
- Weapon categorization and management
- Equipment compatibility checking

### ✅ Armor System

- Detailed armor types with coverage and protection properties
- Armor weight and strength requirements
- Injury reduction based on armor coverage and material
- Equipment integration with body system

### ✅ Combat Engine (Basic)

- Basic combat result structure
- Placeholder for hit rate calculations
- Foundation for future combat mechanics

## Systems To Implement

### 🚧 Combat Engine (Advanced)

- **Complete hit rate calculation with weapon and experience factors**
- **Attack resolution with hit/miss/block/dodge outcomes**
- **Damage calculation considering armor, weapon type, and attack style**
- **Critical hit system for weak point targeting**
- **Combat flow management with action queuing**

### 🚧 Advanced Weapon System

- **Weapon reach and range calculations**
- **Weapon durability and maintenance**
- **Special weapon properties (piercing, slashing, blunt)**
- **Weapon-specific attack patterns and combos**
- **Ammunition system for ranged weapons**

### 🚧 Formation and Tactics

- **Unit formations and their tactical benefits**
- **Flanking and surrounding mechanics**
- **Terrain effects on movement and combat**
- **Command and control systems**
- **Morale and unit cohesion**

### 🚧 Environmental Factors

- **Weather effects on combat and movement**
- **Terrain types and their impact**
- **Time of day and visibility effects**
- **Fatigue from extended combat**
- **Supply and logistics considerations**

### 🚧 Advanced Unit States

- **Medical treatment and recovery**
- **Permanent disabilities from severe injuries**
- **Psychological effects (fear, panic, berserker rage)**

### 🚧 Battlefield AI

- **Tactical decision making**
- **Formation adaptation**
- **Retreat and surrender mechanics**
- **Unit coordination and communication**
- **Learning from combat experience**

### 🚧 Equipment and Logistics

- **Equipment wear and tear**
- **Supply lines and ammunition**
- **Equipment maintenance and repair**
- **Looting and equipment recovery**
- **Economic considerations**

### 🚧 Historical Accuracy

- **Period-specific equipment and tactics**
- **Cultural and training differences**
- **Technological evolution over time**
- **Realistic unit sizes and organization**
- **Historical battle scenarios**

## Technical Architecture

### Component-Based Design

The system uses a component-based architecture for maximum flexibility and maintainability:

```typescript
class Unit {
  readonly attributes: UnitAttributes;  // Core stats
  readonly combat: CombatComponent;     // Combat capabilities
  readonly body: BodyComponent;         // Physical representation
  readonly movement: MovementComponent; // Movement and positioning
  readonly work: WorkComponent;         // Non-combat activities
}
```

### Core Systems

#### Event System

- Decoupled communication between components
- Event-based state updates
- Battle event logging and replay

#### Time Management

- Simulation timing control
- Update cycle coordination
- Pause/resume functionality

#### Performance Optimization

- Spatial partitioning for efficient unit queries
- Batch processing for large unit counts
- Worker threads for pathfinding and AI

### Terrain System

- Grid-based terrain representation
- Height, forest, river, and obstacle features
- Pathfinding with terrain costs
- Combat modifiers based on terrain

### Visualization

- Multiple view modes (Battle, Tactical, Strategic)
- Canvas-based 2D rendering
- Zoom-dependent detail levels
- Real-time unit visualization

### Network Layer

- WebSocket-based real-time updates
- State synchronization
- Battle coordination
- Client management

For detailed architecture information, see [ARCHITECTURE_PLAN.md](ARCHITECTURE_PLAN.md).

## Game Modes

### Test Battle Mode

- Quick battle simulations
- Predefined unit configurations
- Performance testing
- Combat system validation

### Test Visual Mode

- Real-time battle visualization
- Playback controls
- Debug information
- System monitoring

### Game Mode (Future)

- Large-scale battles
- City building elements
- Unit lifecycle simulation
- Strategic map control

## Development Approach

### Code Organization

- Self-contained modules with clear responsibilities
- Component-based unit system
- Event-driven communication
- Worker-based performance optimization

### Testing Strategy

- Comprehensive component testing
- Integration tests for system interaction
- Performance benchmarking
- Behavior-driven development

### Performance Goals

- Support for thousands of units
- Efficient spatial queries
- Optimized batch processing
- Asynchronous pathfinding

### Development Philosophy

- **Component-Based**: Clear separation of concerns with composable components
- **Event-Driven**: Decoupled communication through event system
- **Performance-Focused**: Optimized for large-scale battles
- **Modular Design**: Independent, testable components
- **Realistic Simulation**: Accurate combat and unit behavior
- **Iterative Development**: Small, focused changes with regular review

## Project Structure

```bash
backend/
├── src/
│   ├── BattleEngine/      # Core battle simulation
│   ├── utils/             # Shared utilities
│   └── index.ts           # Main entry point
│
frontend/
├── src/
│   ├── battle-map/        # Battle visualization
│   └── index.tsx          # Frontend entry point
```

## Getting Started

1. Clone the repository
2. Install dependencies:

   ```bash
   cd backend && npm install
   cd frontend && npm install
   ```

3. Start the development servers:

   ```bash
   # Terminal 1
   cd backend && npm run dev
   
   # Terminal 2
   cd frontend && npm run dev
   ```

## Documentation

### Development Guides

- [Contributing Guide](docs/CONTRIBUTING.md) - Development standards, best practices, and code organization
- [Technical Roadmap](docs/ROADMAP.md) - Implementation phases and planned features
- [API Documentation](docs/API.md) - Core APIs and interfaces documentation
- [Testing Strategy](docs/TESTING_STRATEGY.md) - Testing approach, patterns and best practices

### Architecture & Design

- [Architecture Plan](docs/ARCHITECTURE_PLAN.md) - Detailed system architecture and design decisions
- [Architecture Diagram](docs/architecture-diagram.puml) - High-level system architecture visualization
- [Component Interactions](docs/component-interactions.puml) - PlantUML diagram showing system component relationships
- [Combat Sequence Diagram](docs/combat-sequence.puml) - PlantUML diagram showing combat sequence
- [Movement Sequence Diagram](docs/movement-sequence.puml) - PlantUML diagram showing movement sequence

## Contributing

Please see our [Contributing Guide](docs/CONTRIBUTING.md) for development standards, best practices, and workflow guidelines.
