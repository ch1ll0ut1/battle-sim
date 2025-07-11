# Battle Simulation Game Mechanics

## System Overview

The battle simulation uses a combination of physical and psychological systems to create realistic combat behavior.

### System Interactions

```bash
Physical Systems:
Experience ──┬─► Combat Effectiveness
            ├─► Morale
            ├─► Pain Resistance
            └─► Stamina Management

Weight ─────┬─► Movement Speed
            ├─► Stamina Costs
            ├─► Equipment Capacity
            └┬► Conditioning ──► Stamina Pool
             └─────────────────┘

Strength ───┬─► Damage Output
            ├─► Equipment Capacity
            ├─► Weapon Selection
            └┬► Conditioning ──► Stamina Pool
             └─────────────────┘

Weapon ─────┬─► Damage Output
            ├─► Hit Probability
            ├─► Stamina Costs
            └─► Action Speed

Blood Loss ─┬─► Combat Effectiveness
            ├─► Consciousness
            └─► Morale

Consciousness ┬─► Combat Effectiveness
              ├─► Decision Making
              └─► Action Success

Injuries ───┬─► Combat Effectiveness
            ├─► Morale
            ├─► Pain
            ├─► Blood Loss
            ├─► Body Part Functionality
            └─► Shock ──► Consciousness

Pain ───────┬─► Combat Effectiveness
            ├─► Morale
            └─► Consciousness

Shock ──────► Consciousness

Stamina ────┬─► Combat Effectiveness
            ├─► Movement Speed
            └─► Morale

Body Part ──┬─► Action Availability
Functionality├─► Combat Effectiveness
            └─► Movement Speed

Psychological Systems:
Battlefield Events ─┐
Unit Status ───────┼─► Morale ──► Decision Making
Leadership ────────┘
```

## Physical Characteristics

### Base Attributes

- **Weight**: 40-120 kg (adult human range)
  - Affects movement speed, stamina, and equipment capacity
  - Optimal fighting weight: 70-85 kg
  - Every 10 kg above optimal reduces speed by 5%
  - Influences conditioning ratio (strength/weight)
  - Higher weight increases stamina costs for actions

- **Strength**: Scale 0-100
  - 20: Untrained adult
  - 40: Regular training
  - 60: Athletic
  - 80: Elite athlete
  - 100: Peak human strength
  - Determines weapon selection and equipment capacity
  - Higher strength improves damage output
  - Influences conditioning ratio (strength/weight)

### Conditioning

The relationship between strength and weight creates a conditioning bonus that affects stamina:

```ts
conditioningRatio = strength / weight
conditioningBonus = min(conditioningRatio * 10, 20) // Capped at 20
```

Effects:

- Improves stamina pool (up to +20)
- Better strength-to-weight ratio means more efficient movements
- Optimal ratio is around 1.0 (balanced strength and weight)
- Examples:
  - 80 strength, 80 kg: 1.0 ratio = +10 stamina
  - 100 strength, 70 kg: 1.43 ratio = +20 stamina (capped)
  - 60 strength, 90 kg: 0.67 ratio = +6.7 stamina

- **Experience**: Scale 0.0-1.0
  - Affects weapon handling, stamina management, and pain resistance
  - 0.0: No combat experience
  - 0.3: Basic training
  - 0.6: Combat veteran
  - 0.9: Elite warrior

## Combat Mechanics

### Action Timing

Each combat action has two distinct phases:

1. Execution Time:
   - Time required to perform the action
   - Can be interrupted during this phase
   - Default timings (seconds):
     - Attack: 0.4s
     - Block: 0.2s
     - Move: 0.1s
     - Rotate: 0.1s
     - Kick: 0.5s
     - Headbutt: 0.3s

2. Recovery Time:
   - Cooldown period after execution
   - Cannot be interrupted
   - Default timings (seconds):
     - Attack: 0.1s
     - Block: 0.05s
     - Move: 0.0s
     - Rotate: 0.0s
     - Kick: 0.2s
     - Headbutt: 0.1s

Example: Full Attack Sequence
1. Start attack (t=0)
2. Execution phase (0.4s)
   - Can be interrupted
   - Damage occurs at end
3. Recovery phase (0.1s)
   - Cannot be interrupted
   - Body part locked
4. Ready for next action (t=0.5s)

#### Timing Modifiers

Action timings are affected by various factors:

1. Injuries:
   - Reduced body part functionality increases execution time
   - Formula: executionTime *= (100/functionality)
   - Example: 60% arm functionality = 1.67x execution time
   - Critical injuries may prevent actions entirely

2. Stamina Effects:
   - Below 50% stamina: +20% execution time
   - Below 25% stamina: +50% execution time
   - Below 10% stamina: +100% execution time
   - Example: Attack at 20% stamina
     - Base execution: 0.4s
     - Modified: 0.6s (+50%)

3. Experience Benefits:
   - Reduces base execution time up to 25%
   - Improves recovery time up to 20%
   - Formula: time *= (1 - experience * 0.25)
   - Example: 0.8 experience
     - Base attack execution: 0.4s
     - Modified: 0.32s (-20%)

#### Parallel Actions

Different body parts can act independently, with specific limitations:

1. Valid Actions per Body Part:
   - Head: rotate (aiming), attack (headbutt)
   - Arms: attack, block, grab (each arm independent)
   - Legs: move, attack (kick)
     - Only one leg action at a time
     - Cannot kick while moving
     - One leg must always maintain stance
   - Torso: passive, affected by other actions

2. Coordination Rules:
   - Arms operate independently
     - Can attack with both arms
     - Can block with one, attack with other
     - Each arm has its own timing cycle
   - Legs are mutually exclusive
     - Walking/running uses both legs
     - Kicking requires stable stance (other leg)
     - Must complete leg action before starting new one
   - Maximum 3 simultaneous actions total

3. Combined Action Examples:
   - Walking Attack:
     - Legs: continuous move (0.1s cycles)
     - Either arm: full attack sequence (0.5s)
     - Result: 30% reduced attack accuracy
     - Cannot kick during this sequence

   - Dual Weapon Attack:
     - Left arm: attack sequence (0.5s)
     - Right arm: attack sequence (0.5s)
     - Can be synchronized or alternating
     - 20% increased stamina cost
     - Must maintain stable stance (no leg actions)

   - Kick Combination:
     - Initial stance: both legs planted
     - Right leg: kick (0.5s total)
     - Arms: can still act independently
     - Cannot move until kick completes
     - Left leg: maintains stability

### Reaction Time

Base reaction time for combat decisions: 280ms

- Experience can improve reaction time up to 20%
- Fatigue increases reaction time up to 50%
- Head injuries and blood loss can increase reaction time up to 30%

Formula: `finalReactionTime = baseTime * (1 - experienceBonus) * (1 + fatiguePenalty) * (2 - headFunctionality) * (1 + bloodLossPenalty)`

- Clamped between 220ms (peak performance) and 600ms (severely impaired)

### Movement

Movement uses realistic momentum-based physics with acceleration, deceleration, and turning mechanics.

#### Movement States

Movement states represent the unit's linear motion only. Turning happens simultaneously and continuously:

- **Stationary**: Unit is not moving (velocity = 0)
- **Accelerating**: Unit is building up speed from stationary or slower state
- **Moving**: Unit is at steady-state movement (walking or running speed)
- **Decelerating**: Unit is slowing down to stop or change to slower movement

Note: Turning is not a separate state - units can rotate while in any movement state.

#### Base Movement Parameters

- **Base Walking Speed**: 1.4 m/s (maximum sustainable speed)
- **Base Running Speed**: 2.8 m/s (2x walking, high stamina cost)
- **Base Acceleration**: 3.0 m/s² (modified by strength/weight ratio)
- **Base Deceleration**: 6.0 m/s² (typically faster than acceleration)
- **Base Turn Speed**: 360°/second (2π radians/second, modified by momentum and weight)

#### Total Weight Calculation

```ts
totalWeight = bodyWeight + equipmentWeight
// Equipment weight includes armor, weapons, and carried items
// Examples:
// - Light infantry: 70kg body + 15kg equipment = 85kg total
// - Heavy knight: 80kg body + 35kg equipment = 115kg total
// - Scout: 65kg body + 8kg equipment = 73kg total
```

#### Maximum Speed Modifiers

```ts
// Base speed calculation
baseSpeed = isRunning ? 2.8 : 1.4 // m/s

// Strength bonus: Muscle power for acceleration and sustained speed
strengthBonus = min(0.25, (strength - 50) * 0.005) // +0.5% per point above 50, max +25%

// Total weight penalty: Affects both acceleration and max speed
optimalWeight = 70 // kg (unencumbered adult)
weightPenalty = max(0, (totalWeight - optimalWeight) * 0.003) // -0.3% per kg above optimal

// Stamina effect: Exponential degradation below 50%
staminaEffect = stamina > 50 ? 1.0 : 0.4 + (stamina / 50) * 0.6 // Linear from 40% to 100%

// Leg injury effect: Minimum of both legs
legEffect = min(leftLegFunctionality, rightLegFunctionality) / 100

// Final calculation
maxSpeed = baseSpeed * (1 + strengthBonus) * (1 - weightPenalty) * staminaEffect * legEffect
```

#### Acceleration Mechanics

```ts
// Acceleration affected by strength-to-weight ratio and stamina
baseAcceleration = 3.0 // m/s²
strengthFactor = strength / 50 // Muscle power
massInertiaFactor = 70 / totalWeight // Heavier = harder to accelerate
staminaFactor = stamina > 25 ? 1.0 : 25 / stamina // Penalty factor when low stamina

acceleration = baseAcceleration * strengthFactor * massInertiaFactor * staminaFactor * legEffect

// Deceleration is typically higher but still affected by mass
deceleration = acceleration * 2.0 // Can brake harder than accelerate
```

#### Turning Mechanics

Turning happens continuously and simultaneously with linear movement. Turn rate is limited by momentum and weight:

- **Base Turn Rate**: 360°/second (2π radians/second when stationary)
- **Continuous Process**: No discrete execution/recovery time
- **Speed-Dependent**: Turn rate decreases with current movement speed

```ts
// Turn rate calculation - continuous and speed-dependent
baseTurnRate = 2 * Math.PI // radians per second when stationary

// Mass inertia: Heavier units have more rotational inertia
massInertiaPenalty = totalWeight / 70

// Linear momentum: Faster movement reduces turn rate significantly  
speedRatio = currentSpeed / maxSpeed
linearMomentumPenalty = 1 + (speedRatio * speedRatio) * 2 // Quadratic penalty

// Equipment momentum: Heavy equipment adds rotational inertia beyond just weight
equipmentWeight = totalWeight - bodyWeight
equipmentMomentumPenalty = 1 + (equipmentWeight / 30) * 0.5 // Additional penalty for gear

// Stamina penalty: Low stamina affects coordination
staminaPenalty = stamina > 25 ? 1.0 : 25 / stamina // Penalty factor when low

// Final turn rate  
currentTurnRate = baseTurnRate / (massInertiaPenalty * linearMomentumPenalty * equipmentMomentumPenalty * staminaPenalty)

// Sharp turns naturally reduce speed due to physics
// Units automatically slow down when attempting tight turns at speed
```

#### Stamina Costs

**Note**: Stamina costs only apply when using the **physics movement system** (`movementSystem: 'physics'` in config/movement.ts). The simple movement system does not consume stamina.

Stamina costs are calculated using realistic movement physics based on speed and weight:

```ts
// Net stamina calculation: Physics consumption vs. recovery
const baseCost = 0.009; // Calibrated base cost in stamina units per second
const baseSpeed = 1.0; // m/s reference speed

// Movement consumption (UnitMovementPhysics.ts)
const speedFactor = Math.pow(currentSpeed / baseSpeed, 2); // Quadratic relationship
const weightFactor = totalWeight / 70; // Weight impact on energy expenditure
const staminaCostPerSecond = baseCost * speedFactor * weightFactor;

// Recovery during movement (UnitStamina.ts)
const movingRecoveryRate = 0.0; // No recovery during movement - physiologically realistic
const recoveryPerSecond = movingRecoveryRate * maxStamina * experienceBonus;

// Net stamina change per second = recovery - consumption
const netStaminaChange = recoveryPerSecond - staminaCostPerSecond;

// Key insight: Walking has LESS net stamina consumption than running
// All movement now causes net stamina loss, but walking drains much slower than running
```

**Net Stamina Change Examples (with DOUBLE weight modifier as per actual code):**

1. **Veteran Soldier Walking** (75kg, 60 strength, 104 max stamina, 0.6 exp, 1.4 m/s):
   - Physics consumption: 0.009 × (1.4/1.0)² × (75/70) = **0.0203 units/sec**
   - UnitStamina weight modifier: 1.0 + (75-70)*0.01 - (60-50)*0.01 = **0.95** (applied AGAIN)
   - Experience modifier: 1 - (0.6 × 0.3) = **0.82** (18% reduction)
   - Final consumption: 0.0203 × 0.95 × 0.82 = **0.0158 units/sec**
   - Recovery: 0.0 × 104 × (1 + 0.6×0.2) = **0.0 units/sec**
   - **Net: -0.0158 units/sec** (stamina LOSS while walking)

2. **Veteran Soldier Running** (75kg, 60 strength, 104 max stamina, 0.6 exp, 2.8 m/s):
   - Physics consumption: 0.009 × (2.8/1.0)² × (75/70) = **0.0810 units/sec**
   - UnitStamina modifiers: **0.95** weight × **0.82** experience = **0.779**
   - Final consumption: 0.0810 × 0.779 = **0.0631 units/sec**
   - Recovery: 0.0 × 104 = **0.0 units/sec**
   - **Net: -0.0631 units/sec** (stamina LOSS while running)

3. **Fresh Civilian Walking** (82kg, 35 strength, 49 max stamina, 0.0 exp, 1.4 m/s):
   - Physics consumption: 0.009 × (1.4/1.0)² × (82/70) = **0.0232 units/sec**
   - UnitStamina weight modifier: 1.0 + (82-70)*0.01 - (35-50)*0.01 = **1.27** (27% penalty)
   - Experience modifier: **1.0** (no reduction)
   - Final consumption: 0.0232 × 1.27 × 1.0 = **0.0295 units/sec**
   - Recovery: 0.0 × 49 = **0.0 units/sec**
   - **Net: -0.0295 units/sec** (significant stamina LOSS while walking)

**Key Physics Insight**: Walking has **much less net stamina consumption** than running due to the quadratic speed relationship. With 0 recovery during movement, all movement causes stamina loss, but walking drains ~5x slower than running. This creates realistic endurance behavior where soldiers can walk for hours but only run for 30-200 minutes depending on fitness level.

#### Example Calculations

**Realistic Unit Performance Examples (from integration tests with 0 recovery during movement):**

1. **Fresh Civilian** (35 strength, 82kg, 0.0 experience):
   - **Running endurance**: 32.8 minutes before exhaustion (5.3 km)
   - **Walking capability**: 10.6 km in 2.2 hours (limited endurance)
   - **Characteristics**: Basic human fitness, no military conditioning

2. **Trained Recruit** (45 strength, 76kg, 0.3 experience):
   - **Running endurance**: 60.3 minutes sustained running (9.9 km)
   - **Walking capability**: 19.9 km in 4.0 hours (basic training standard)
   - **Characteristics**: Completed basic training, improved fitness

3. **Veteran Soldier** (60 strength, 75kg, 0.6 experience):
   - **Running endurance**: 106.0 minutes sustained running (17.8 km)
   - **Walking capability**: 35.6 km in 7.1 hours (operational standard)
   - **Characteristics**: Field-tested conditioning, optimized gear ratio

4. **Elite Soldier** (90 strength, 72kg, 0.9 experience):
   - **Running endurance**: 221.5 minutes (3.7 hours) sustained running (37.2 km)
   - **Walking capability**: 74.4 km in 14.8 hours (special forces level)
   - **Characteristics**: Peak conditioning, extensive experience, lean build

#### Movement State Transitions

```
Stationary ◄──► Accelerating ◄──► Moving ◄──► Decelerating ◄──► Stationary
    │                │              │              │              │
    └── Turning can happen during any state (continuous) ──────────┘

Rules:
- Turning is continuous and can happen during any movement state
- Turn rate automatically limited by current speed and momentum
- Sharp turns naturally cause speed reduction through physics
- Emergency stops: instant deceleration at 2x normal rate, high stamina cost
```

#### Realistic Movement Behavior

1. **Starting Movement**: Units take time to reach full speed based on acceleration
2. **Stopping**: Units cannot stop instantly, momentum carries them forward  
3. **Simultaneous Movement**: Units can walk/run and turn at the same time like real humans
4. **Speed-Dependent Turning**: Turn rate automatically decreases with movement speed
5. **Natural Physics**: Sharp turns at speed naturally reduce forward velocity
6. **Equipment Impact**: Heavy equipment significantly affects acceleration and turning
7. **Stamina Integration**: Realistic costs with turning adding to movement costs
8. **Injury Effects**: Leg injuries dramatically impact all movement capabilities

Examples of realistic behavior:
- **Gentle Curve**: Walking while turning slightly = no speed penalty
- **Sharp Corner**: Running + sharp turn = automatic speed reduction to ~40%
- **Combat Maneuver**: Full-speed movement + maximum turn rate = very slow turning
- **Formation Movement**: Group can maintain formation while all gradually turning

## Experience System

Experience represents a unit's training and combat exposure, ranging from 0.0 (untrained) to 1.0 (legendary).

### Effects

1. Combat:
   - Improved accuracy
   - Better damage control
   - Faster action execution

2. Resistance:
   - Pain and shock reduced by up to 50%
   - Stamina drain reduced by up to 30%
   - Morale stress resistance (see Morale System)
     - Reduces negative morale effects by up to 20 points
     - Higher base morale (+30 at maximum experience)

## Pain System

Pain represents accumulated trauma and its impact on performance.

### Pain Effects

1. Physical Impact:
   - Reduces action speed
   - Increases stamina costs
   - May cause unconsciousness

2. Mental Impact:
   - Above 50 pain reduces morale
   - Each 2 points above 50 = -1 morale
   - Experience reduces this morale penalty

## Stamina System

Stamina represents a unit's current energy level and ability to perform actions. The system is calibrated for realistic military endurance where soldiers can run for 20-45 minutes and march for hours.

### Stamina Effects

1. Physical Performance:
   - Action execution speed
   - Damage output
   - Movement speed

2. Mental State:
   - Below 50%: -10 morale
   - Below 25%: -20 morale
   - Affects decision making through morale system

### Maximum Stamina Calculation

```ts
// Calibrated formula for realistic endurance
baseStamina = strength * 1.4  // Strength determines endurance capacity
experienceBonus = experience * 20  // Combat training improves stamina pool
conditioningBonus = min(strength/weight * 10, 20)  // Strength-to-weight ratio bonus
maxStamina = baseStamina + experienceBonus + conditioningBonus
```

**Examples:**
- Recruit (45 strength, 76kg, 0.3 exp): 63 + 6 + 5.9 = **75 stamina**
- Veteran (60 strength, 75kg, 0.6 exp): 84 + 12 + 8.0 = **104 stamina**
- Elite (90 strength, 72kg, 0.9 exp): 126 + 18 + 12.5 = **157 stamina**

### Action Costs (absolute stamina units)

**Combat Actions:**
- Light Attack: 3-5 units (modified by weapon weight)
- Heavy Attack: 6-10 units (modified by weapon weight)
- Block: 2-3 units
- Dodge: 4-6 units

**Movement Costs** (per second, physics-based):
- Calculated using realistic movement physics
- Base cost depends on movement speed squared
- Modified by total weight and terrain

### Recovery Rates (absolute stamina units per second)

**Recovery Context System:**
```ts
const recoveryRates = {
    resting: 0.08,     // 8% of max stamina per second - full aerobic recovery
    moving: 0.0,       // No recovery during movement - physiologically realistic
    combat: 0.01,      // 1% per second - adrenaline provides slight recovery
    exhausted: 0       // No recovery when below 10% stamina
};
```

**Realistic Recovery Examples:**
- **Veteran at rest** (104 max): 8.3 units/sec → recovers 25% in ~3 seconds
- **Veteran walking** (104 max): 0.0 units/sec → no recovery during movement
- **Veteran in combat** (104 max): 1.04 units/sec → slow recovery during combat
- **Exhausted unit**: No natural recovery until above 10% threshold

### Stamina Modifiers

1. **Experience Impact:**
   - **Consumption reduction**: Up to 30% less stamina cost
     - Formula: `cost *= (1 - experience * 0.3)`
     - Elite soldier (0.9 exp): 27% reduction in all costs
   
   - **Recovery improvement**: Up to 20% faster recovery
     - Formula: `recovery *= (1 + experience * 0.2)`
     - Elite soldier (0.9 exp): 18% faster recovery

2. **Weight Impact (Calibrated System):**
   ```ts
   // Realistic baseline approach (70kg baseline, 50 strength baseline)
   const weightDifference = totalWeight - 70;
   const strengthDifference = strength - 50;
   const modifier = 1.0 + (weightDifference * 0.01) - (strengthDifference * 0.01);
   const weightModifier = Math.max(0.8, Math.min(1.5, modifier));
   ```
   
   **Examples:**
   - Light scout (73kg, 70 strength): 1.03 - 0.20 = **0.83x modifier** (17% bonus)
   - Standard soldier (75kg, 60 strength): 1.05 - 0.10 = **0.95x modifier** (5% bonus)
   - Heavy infantry (85kg, 50 strength): 1.15 - 0.00 = **1.15x modifier** (15% penalty)
   - Overburdened unit (100kg, 45 strength): 1.30 + 0.05 = **1.35x modifier** (35% penalty)

3. **Pain Effects:**
   - Each 10 points of pain: +10% stamina costs, -5% recovery rate
   - Experience reduces pain impact by up to 50%

### Performance Thresholds

1. **Above 75% stamina:**
   - Full performance and maximum recovery
   - No movement speed penalties

2. **50-75% stamina:**
   - 90% action speed, normal recovery
   - Slight movement speed reduction

3. **25-50% stamina:**
   - 75% action speed, -10 morale
   - Noticeable movement speed reduction
   - Reduced recovery rates

4. **10-25% stamina:**
   - 50% action speed, -20 morale
   - Significant movement speed penalties
   - Minimal recovery

5. **Below 10% stamina (Exhausted):**
   - 25% action speed, essential actions only
   - No natural recovery until above threshold
   - Severe movement limitations

### Realistic Endurance Behavior

**Running Endurance (Calibrated Test Results with 0 Recovery During Movement):**
- **Fresh civilian**: ~33 minutes before exhaustion
- **Trained recruit**: ~60 minutes sustained running  
- **Veteran soldier**: ~106 minutes sustained running
- **Elite soldier**: ~200 minutes (3+ hours) sustained running

**Walking/Marching Endurance:**
- **Fresh civilian**: ~2.2 hours walking endurance (limited capability)
- **Trained recruit**: ~4 hours walking endurance (basic training standard)
- **Veteran soldier**: ~7 hours walking endurance (operational standard)  
- **Elite soldier**: ~15 hours walking endurance (special forces level)

**Key System Characteristics:**
- **Graduated performance**: Clear differentiation between unit types
- **Realistic military standards**: Matches real-world endurance capabilities
- **Finite endurance**: All movement gradually depletes stamina - no perpetual motion
- **Recovery balance**: Only true rest provides stamina recovery (0% during movement)
- **No instant recovery**: Realistic rest periods required between intense activities

## Injury System

### Blood Loss

Total blood volume: ~5L for average adult
Fatal threshold: 40% loss (~2L)

Blood Loss Effects:
- 10% loss (500ml): Minimal effects
- 15% loss (750ml): Early shock symptoms
  - Increased heart rate
  - Mild anxiety
  - -10 consciousness
- 25% loss (1.25L): Moderate shock
  - Marked anxiety
  - Rapid breathing
  - -30 consciousness
  - Combat effectiveness reduced 50%
- 35% loss (1.75L): Severe shock
  - Confusion
  - Very rapid breathing
  - -60 consciousness
  - Combat effectiveness reduced 80%
- 40% loss (2L): Fatal
  - Unconsciousness
  - Death within minutes without treatment

Bleeding Rates (blood volume per minute):
- Superficial Cut: 50ml/min (1% per minute)
- Deep Cut: 100ml/min (2% per minute)
- Arterial Cut: 250ml/min (5% per minute)
- Major Artery: 500ml/min (10% per minute)

Recovery:
- Natural clotting begins after 3-5 minutes
- Reduces bleeding rate by 50%
- Field treatment can reduce rate by 75%
- Full recovery requires 1% blood volume per day

### Body Parts and Damage

#### Pain and Shock Effects

Pain and shock are distinct systems that affect units differently:

Pain:

- Directly reduces combat effectiveness
- Scaled 0-100 for each injury
- Experience reduces pain impact by up to 50%
- Location multipliers:
  - Head: 1.8x (most painful)
  - Torso: 1.2x
  - Arms: 1.0x (standard)
  - Legs: 0.9x (least painful)
- Combat effectiveness reduction:

  ```ts
  painEffect = 1 - (totalPain/100) * (1 - experience * 0.5)
  ```

Shock:

- Immediately affects consciousness
- Scaled 0-100 for each injury
- Experience reduces shock impact by up to 50%
- Location multipliers:
  - Head: 2.0x (highest shock)
  - Torso: 1.5x
  - Arms: 0.8x
  - Legs: 0.6x (lowest shock)
- Consciousness reduction per second:

  ```ts
  shockEffect = (totalShock/100) * (1 - experience * 0.5)
  consciousness -= (shockEffect + bloodLossEffect) * deltaTime
  ```

Example: Severe Head Wound

- 80 base shock × 2.0 (head) = 160 shock
- 75 base pain × 1.8 (head) = 135 pain
- With 0.7 experience:
  - Pain reduction: 35% (0.7 * 0.5)
  - Final pain effect: 0.44 (56% combat effectiveness reduction)
  - Shock effect: 1.04 consciousness loss per second
  - Result: Unconscious in ~3 seconds

### Consciousness System

Consciousness Scale: 0-100

- 100: Fully alert
- 70-90: Combat capable
- 50-70: Impaired
- 30-50: Severely impaired
- Below 30: Unconscious

Factors Affecting Consciousness:

1. Blood Loss
   - 15% loss: -10 consciousness
   - 25% loss: -30 consciousness
   - 35% loss: -60 consciousness

2. Pain
   - Experience reduces pain impact by up to 50%
   - Each point of pain reduces consciousness by 0.5
   - Maximum pain from single injury: 50 points

3. Shock
   - Immediate consciousness reduction on injury
   - Recovery rate: 5 points per second
   - Experience reduces shock impact by up to 50%

## Combat Effectiveness System

Combat effectiveness replaces traditional health systems with a realistic measure of fighting capability. It's calculated as a multiplier (0.0-1.0) combining various factors:

### Core Components

1. Physical State (Multiplicative):

   ```ts
   physicalState = staminaEffect * painEffect * consciousnessEffect * bloodLossEffect
   ```

   - **Stamina Effect**:
     - >75%: 1.0x
     - >50%: 0.8x
     - >25%: 0.6x
     - >10%: 0.3x
     - ≤10%: 0.1x

   - **Pain Effect**:

     ```ts
     painEffect = 1 - (totalPain/100) * (1 - experience * 0.5)
     ```

     Example: 60 pain with 0.8 experience = 0.64x

   - **Consciousness Effect**:

     ```ts
     consciousnessEffect = consciousness/100
     // Consciousness affected by:
     // - Blood Loss (-10 at 15%, -30 at 25%, -60 at 35%)
     // - Pain (-0.5 per point)
     // - Shock (immediate reduction based on injury)
     ```

   - **Blood Loss Effect**:

     ```ts
     bloodLossEffect = 1 - (bloodLoss/40) // 40% is fatal threshold
     ```

2. Body Part Functionality (Multiplicative):

   ```ts
   // Critical parts (any of these at 0 means unit is incapacitated)
   criticalParts = min(head, torso)/100
   
   // Limb functionality
   limbFunctionality = min(leftArm, rightArm)/100 * min(leftLeg, rightLeg)/100
   
   // Combined functionality
   bodyFunctionality = criticalParts * limbFunctionality
   
   // Examples:
   // - Head/Torso at 0: bodyFunctionality = 0 (incapacitated)
   // - Head 50%, Torso 80%, Arms 100%, Legs 100%: bodyFunctionality = 0.5
   // - Head 100%, Torso 100%, One arm 0%: bodyFunctionality = 0.5
   ```

   - Critical body parts (head, torso) must be functional for any action
   - Each injury reduces relevant part functionality
   - Critical injuries may disable parts entirely
   - Affects available actions and their effectiveness

### Practical Applications

1. Action Success Probability:
   - Base chance × combat effectiveness
   - Example: 80% base hit chance with 0.6 effectiveness = 48% actual chance

2. Damage Output:
   - Base damage × combat effectiveness
   - Represents reduced force/accuracy from impairment

3. Decision Making:
   - AI uses effectiveness to evaluate unit capabilities
   - Retreat decisions based on effectiveness thresholds
   - Formation positioning based on unit effectiveness

4. Visual Feedback:
   - Unit stance/animation reflects effectiveness
   - Helps players assess unit state realistically
   - More intuitive than abstract health bars

### Example Scenarios

1. Fresh Unit:
   - Full stamina (1.0x)
   - No pain (1.0x)
   - Full consciousness (1.0x)
   - All body parts functional (1.0x)
   - Total effectiveness: 1.0 (100% capable)

2. Wounded Veteran:
   - 40% stamina (0.6x)
   - 60 pain, 0.8 experience (0.64x)
   - 80% consciousness (0.8x)
   - Right arm at 50% (0.5x)
   - Total effectiveness: 0.154 (15.4% capable)
   - Can still fight but severely impaired

3. Critical State:
   - 15% stamina (0.3x)
   - 90 pain, 0.4 experience (0.37x)
   - 35% consciousness (0.35x)
   - Multiple injuries (0.4x)
   - Total effectiveness: 0.015 (1.5% capable)
   - Effectively combat ineffective

### Decision Making Integration

1. **AI Evaluation**:
   - Uses effectiveness to assess unit capabilities
   - Retreat decisions based on effectiveness thresholds
   - Formation positioning based on unit effectiveness

2. **Visual Feedback**:
   - Unit stance/animation reflects effectiveness
   - Helps players assess unit state realistically
   - More intuitive than abstract health bars

## Hit Probability

Base hit chance: 70%
Modified by:

- Body part functionality (0-100%)
- Experience bonus (up to +30%)
- Stamina (20-100% effect)
- Target movement (-15% per m/s)
- Distance (-10% per meter beyond 1m)

Formula:

```ts
hitChance = baseChance * partFunctionality * (1 + experienceBonus) * staminaEffect * (1 - movementPenalty - distancePenalty)
```

Clamped between 20% and 95%

## Damage System

Base damage: 45 units
Modified by:

- Body part functionality (0-100%)
- Strength bonus (up to +50%)
- Stamina (30-100% effect)
- Experience bonus (up to +20%)

Formula:

```ts
damage = baseDamage * partFunctionality * (1 + strengthBonus + experienceBonus) * staminaEffect
```

## Weapon System

Weapons affect combat through four main channels: Damage Output, Hit Probability, Stamina Costs, and Action Speed.

### Damage Output

#### Weapon Properties

- **Damage Type**
  - **Cutting**
    - Affected by edge sharpness (0-1 scale)
    - Most effective against unarmored targets
    - Examples: Swords, Axes
    - Reduced by flexible armor (chainmail)
    - Damage multiplier = edgeSharpness * (1 - armorCutProtection)

  - **Piercing**
    - Affected by point geometry (0-1 scale)
    - Good against gaps in armor
    - Examples: Spears, Daggers
    - Most effective thrust attacks
    - Damage multiplier = pointGeometry * (1 - armorStabProtection)

  - **Blunt**
    - Affected by impact area (cm²) and weapon mass
    - Effective against any armor type
    - Examples: Maces, Hammers
    - Transfers force through armor
    - Damage multiplier = (mass * velocity²/2) * (1 - armorCrushProtection)
    - Velocity affected by weapon length and user strength
    - Impact area determines force distribution:
      - Small (< 2cm²): Concentrated force, good for armor penetration
      - Medium (2-5cm²): Balanced between penetration and impact
      - Large (> 5cm²): Distributed force, better for unarmored targets

- **Weight**: Affects handling and stamina (in kg)
  - Light (0.5-1.5 kg): Fast, precise
    - Examples: Dagger (0.5kg), Short Sword (1.0kg), Rapier (1.2kg)
    - High accuracy, lower stamina cost
    - Ideal for quick strikes and precision
  
  - Medium (1.5-2.5 kg): Balanced
    - Examples: Long Sword (1.8kg), Battle Axe (1.5kg), Spear (1.8kg)
    - Good balance of speed and power
    - Versatile in most combat situations
  
  - Heavy (2.5-3.5 kg): Powerful
    - Examples: Great Sword (3.0kg), War Hammer (2.2kg), Poleaxe (2.8kg)
    - High damage, requires more strength
    - Effective against armored opponents
  
  - Massive (3.5+ kg): Devastating
    - Examples: Zweihander (3.2kg), Dane Axe (3.8kg), Pike (varies by length)
    - Extreme damage, requires exceptional strength
    - Very high stamina cost

- **Length**: Affects reach and handling (in cm)
  - Short (25-60cm): Quick, good in tight spaces
  - Medium (60-100cm): Balanced reach
  - Long (100-200cm): Superior reach, harder to use close

- **Edge Sharpness** (0-1)
  - 0.95-1.0: Surgically sharp, fresh honing (rare in combat)
  - 0.85-0.95: Razor sharp, just after proper sharpening
  - 0.75-0.85: Combat ready, typical military maintenance
  - 0.65-0.75: Field serviceable, needs maintenance
  - 0.50-0.65: Dulled but still cuts
  - < 0.50: Too dull for effective cutting, becomes more of a crushing weapon

- **Point Geometry** (0-1)
  - 0.95-1.0: Needle point (bodkin arrow, stiletto)
  - 0.85-0.95: Fine point (estoc, rapier)
  - 0.75-0.85: Military point (spear, sword)
  - 0.65-0.75: Practical point (typical battlefield condition)
  - 0.50-0.65: Worn point (still penetrates with force)
  - < 0.50: Blunted point, ineffective for stabbing

### Hit Probability & Action Speed

#### Weight Categories

Each category affects accuracy and action speed differently:

- **Light (0.5-1.5 kg)**
  - +10% hit probability
  - -20% action time
  - Examples: Dagger (0.5kg), Short Sword (1.0kg), Rapier (1.2kg)

- **Medium (1.5-2.5 kg)**
  - Base hit probability
  - Base action time
  - Examples: Long Sword (1.8kg), Battle Axe (1.5kg), Spear (1.8kg)

- **Heavy (2.5-3.5 kg)**
  - -10% hit probability
  - +20% action time
  - Examples: Great Sword (3.0kg), War Hammer (2.2kg), Poleaxe (2.8kg)

- **Massive (3.5+ kg)**
  - -20% hit probability
  - +40% action time
  - Examples: Zweihander (3.2kg), Dane Axe (3.8kg), Pike (varies by length)

#### Reach and Handling

- **Length** affects both hit probability and engagement range:
  - Short (25-60cm): +5% hit probability in close range
  - Medium (60-100cm): Base hit probability
  - Long (100-200cm): -5% hit probability in close range, +10% at optimal range

### Stamina Costs

Base stamina costs are modified by weapon weight:

```ts
staminaCost = baseActionCost * (weight/1.8) // 1.8kg is reference weight
```

Weight Category Modifiers:

- Light: 0.6x stamina cost
- Medium: 1.0x stamina cost  
- Heavy: 1.4x stamina cost
- Massive: 1.8x stamina cost

### Weapon Selection

Strength requirements determine which weapons a unit can effectively wield:

```ts
minStrength = weapon.weight * 15 // Minimum strength to wield
optimalStrength = weapon.weight * 25 // Strength for optimal performance
```

Performance penalties when strength is below optimal:

- Hit probability reduced by 3% per point below optimal
- Action speed increased by 2% per point below optimal
- Stamina costs increased by 3% per point below optimal

Examples:
- Dagger (0.5kg): Min 8 strength, Optimal 13 strength
- Long Sword (1.8kg): Min 27 strength, Optimal 45 strength  
- Great Sword (3.0kg): Min 45 strength, Optimal 75 strength
- Zweihander (3.2kg): Min 48 strength, Optimal 80 strength

## Armor System

Armor affects combat through three main channels: Protection, Movement Speed, and Stamina Costs.

### Protection by Material

#### Leather Armor

- **Weight Range**: 0.3-1.5 kg per piece
- **Protection**:
  - Cut: 30-45%
  - Stab: 20-35%
  - Crush: 10-25%
- **Movement**: -5% speed per 2kg total weight
- **Stamina**: +10% action costs
- **Typical Pieces**:
  - Boots: 0.5kg, 50% cut protection
  - Jerkin: 1.5kg, 60% cut protection
  - Cap: 0.7kg, 65% cut protection

#### Chainmail

- **Weight Range**: 0.8-3.0 kg per piece
- **Protection**:
  - Cut: 80-90%
  - Stab: 60-70%
  - Crush: 30-40%
- **Movement**: -5% speed per 1.5kg total weight
- **Stamina**: +20% action costs
- **Typical Pieces**:
  - Leggings: 3.5kg, 85% cut protection
  - Hauberk: 4.5kg, 90% cut protection
  - Coif: 2.5kg, 90% cut protection

#### Plate

- **Weight Range**: 1.2-5.0 kg per piece
- **Protection**:
  - Cut: 95-100%
  - Stab: 90-95%
  - Crush: 80-90%
- **Movement**: -5% speed per 1kg total weight
- **Stamina**: +30% action costs
- **Typical Pieces**:
  - Greaves: 3.0kg, 95% cut protection
  - Cuirass: 8.0kg, 100% cut protection
  - Helm: 3.5kg, 100% cut protection

### Movement Effects

Total armor weight affects movement speed:

```ts
speedPenalty = totalArmorWeight * armorTypePenaltyMultiplier
// Penalty multipliers:
// Leather: 0.025 (2.5% per kg)
// Chainmail: 0.033 (3.3% per kg)
// Plate: 0.05 (5% per kg)
```

### Stamina Impact

Armor increases the stamina cost of all actions:

```ts
staminaCostMultiplier = 1 + (totalArmorWeight * armorTypeMultiplier)
// Type multipliers:
// Leather: 0.02 (2% per kg)
// Chainmail: 0.03 (3% per kg)
// Plate: 0.04 (4% per kg)
```

### Protection Calculation

Damage reduction is calculated per damage type:

```ts
finalDamage = baseDamage * (1 - armorProtection[damageType])
// Additional effects:
// - Crushing damage ignores 50% of armor protection
// - Critical hits ignore 30% of armor protection
// - Worn/damaged armor provides 50-80% of normal protection
```

### Mixed Armor Examples

1. Light Scout (4kg total):
   - Leather armor set
   - -10% movement speed
   - +8% stamina costs
   - ~40% overall protection

2. Standard Infantry (12kg total):
   - Chainmail with leather
   - -30% movement speed
   - +30% stamina costs
   - ~70% overall protection

3. Heavy Knight (20kg total):
   - Full plate
   - -50% movement speed
   - +60% stamina costs
   - ~90% overall protection

## Combat Ranges

### Weapon Reach

- Dagger: 25cm
  - Optimal for grappling distance
  - Quick strikes, minimal telegraphing

- Short Sword: 60cm
  - Good for close quarters
  - Balanced offensive/defensive

- Long Sword: 100cm
  - Standard military reach
  - Versatile engagement range

- Spear: 200cm
  - Superior reach advantage
  - Excellent for formation fighting

- Halberd: 180cm
  - Good reach with versatility
  - Can hook and pull opponents

- Bow: 120-180cm (effective range)
  - Draw length affects power
  - Range varies with draw weight

### Engagement Distances

- Grappling: 0-25cm
  - Daggers and short weapons excel
  - Longer weapons at disadvantage

- Close Combat: 25-100cm
  - Swords and axes optimal
  - Room for proper footwork

- Pole Weapons: 150-200cm
  - Spears and halberds dominate
  - Formation fighting distance

- Ranged Combat
  - Short Bow: 15-50m effective, up to 100m maximum
  - Long Bow: 50-100m effective, up to 200m maximum
  - Crossbow: 30-60m effective, up to 150m maximum
  - Factors affecting range:
    - Archer's strength and skill
    - Weather conditions

## Combat Examples

### Heavy Armor vs Light Weapon

A dagger (2.0 damage) against plate armor (95% cut protection):

- Base damage reduced to 0.1
- Requires targeting weak points
- Best used for piercing attacks
- Practical application: Target joints or visor

### Fatigue in Extended Combat

A unit in plate armor (20kg total) fighting for 5 minutes:

- Base stamina drain: 3% per minute
- Armor weight adds 50% drain
- Total drain: 22.5% stamina lost
- Combat effectiveness reduced to 80%
- Recovery needed: 2-3 minutes rest

### Weapon vs Armor Matchups

Long Sword vs Chain Mail:

- Cut damage reduced by 85%
- Thrust attacks more effective
- Aim for less protected areas
- Stamina cost increased by 20%

Battle Axe vs Plate Armor:

- High impact force transfers through
- Crush damage more effective than cut
- Concentrated strikes on same area
- Focus on joints and gaps

## Morale System

Morale represents a unit's psychological state and willingness to fight. It's a separate core stat from combat effectiveness - while effectiveness represents physical capability, morale represents mental state and can change rapidly based on battlefield events.

### Base Morale

Scale: 0-100
Starting value: 60 (standard trained soldier)

Experience Modifier (added to base):

- Untrained (0.0-0.2): -10
- Basic Training (0.2-0.4): +0
- Combat Veteran (0.4-0.6): +10
- Elite Warrior (0.6-0.8): +20
- Legendary Fighter (0.8-1.0): +30

Example starting morale:

- Recruit (0.1 exp): 50 morale (60 - 10)
- Trained Soldier (0.3 exp): 60 morale
- Veteran (0.5 exp): 70 morale
- Elite (0.7 exp): 80 morale
- Champion (0.9 exp): 90 morale

### Morale Effects

1. Decision Making (Primary Effect):
   - 80-100: Aggressive, will press attack
   - 60-79: Follows orders normally
   - 40-59: Cautious, prefers defensive actions
   - 20-39: May retreat if opportunity arises
   - 0-19: Will attempt to flee

2. Action Selection:
   - High morale (80+):
     - More likely to choose aggressive actions
     - Will maintain position in formation
     - Might protect wounded allies

   - Low morale (below 40):
     - Prefers defensive actions
     - More likely to break formation
     - May abandon wounded allies

3. Tactical Behavior:
   - High morale units hold formation better
   - Low morale units may ignore orders
   - Breaking units seek escape routes
   - Units prefer to stay near higher morale allies

### Morale Modifiers (Fast-changing)

1. Immediate Battle Events:
   - Ally death witnessed: -15
   - Enemy death caused: +10
   - Taking an injury: -10 to -20
   - Leader death: -30
   - Enemy fleeing: +15
   - Being surrounded: -5 per surrounding enemy

2. Situational (Updated each second):
   - Leader nearby: +10
   - In formation: +10
   - Allies nearby: +5 per ally within 10m
   - Enemies nearby: -5 per enemy within 10m
   - Holding advantageous position: +10

### Morale Recovery

1. Out of Combat:
   - +5 per 10 seconds when no enemies nearby
   - +10 per 10 seconds when near allies
   - Cannot exceed starting morale without positive events

2. Combat Events:
   - Enemy unit flees: +10
   - Reinforcements arrive: +20
   - Leader rallies troops: +15
   - Reaching defensive position: +10

### Moral System - Example Scenarios

1. Formation Charge:
   - Veteran soldier (base 70)
   - In formation (+10)
   - Leader present (+10)
   - Allies nearby (+15)
   - Current morale: 105 (capped at 100)
   - Result: Aggressive fighting, maintains formation

2. Ambush Response:
   - Trained soldier (base 60)
   - Surprised by enemies (-20)
   - Two allies died (-30)
   - Surrounded (-15)
   - Current morale: 0 (minimum)
   - Result: Immediate flight response

3. Battle Line:
   - Mixed experience unit (base 65)
   - In formation (+10)
   - Even numbers (no modifier)
   - Leader nearby (+10)
   - Current morale: 85
   - Result: Strong fighting resolve, holds position

### Experience Impact on Morale

```ts
// Experience provides both base modifier and stress resistance
baseModifier = getExperienceModifier(experience) // -10 to +30 from table above
stressResistance = Math.floor(experience * 20) // 0-20 reduction to negative morale effects

// Example: Veteran (0.5 exp) taking injury (-20 base effect)
stressResistance = Math.floor(0.5 * 20) = 10
actualMoraleLoss = -20 + 10 = -10 // Veteran loses less morale from injury
```

Experience affects morale in two ways:

1. Base morale modifier (as shown in table above)
2. Stress resistance: Reduces negative morale effects
   - 0.0 exp: No reduction
   - 0.5 exp: 10-point reduction
   - 1.0 exp: 20-point reduction

Example scenarios:

- Recruit (0.1 exp) seeing ally die: -15 morale (full effect)
- Veteran (0.5 exp) seeing ally die: -7 morale (reduced by 8)
- Elite (0.9 exp) seeing ally die: -3 morale (reduced by 12)

### Unit Status Effects

1. Stamina Impact:

   ```ts
   if (stamina < 50) morale -= 10
   if (stamina < 25) morale -= 20
   ```

   - Above 50%: No effect
   - 25-50%: -10 morale
   - Below 25%: -20 morale
   - Updates dynamically as stamina changes

2. Injury Effects:

   ```ts
   // Per injury
   moraleLoss = Math.min(-5, -20 * injurySeverity)
   moraleLoss += stressResistance // Reduced by experience
   ```

   - Minor (0.25): -5 morale
   - Moderate (0.5): -10 morale
   - Severe (0.75): -15 morale
   - Critical (1.0): -20 morale
   - Multiple injuries stack
   - Experience reduces impact

3. Pain Integration:

   ```ts
   if (pain > 50) {
     moralePenalty = Math.floor((pain - 50) * 0.5)
     morale -= moralePenalty
   }
   ```

   - No effect below 50 pain
   - Each 2 points of pain above 50 = -1 morale
   - Example: 70 pain = -10 morale
   - Updates continuously with pain level
   - Experience reduces impact as above
