# Battle Simulation - Game Mechanics

## Core Philosophy

Individual soldier simulation creating emergent army-level behavior. Each soldier is a person with attributes, injuries, and psychological state. Realistic physics-based combat where formations naturally become messy under pressure.

---

## Core Stats (Per Soldier)

### Dynamic States

**Trauma (0-100)**

- Unified injury/damage system
- Replaces: pain, shock, blood loss, consciousness
- Increases: when taking damage
- Effects: Reduces all performance (movement, combat, accuracy)
- Death: trauma ≥ 100
- Recovery: ~1% per day while resting
- Bleeding: trauma > 30 → slowly increases until 100 or treated

**Stamina (0-100)**

- Energy/fatigue level
- Decreases: combat actions, running, carrying weight
- Recovers: 8% per second while resting, 1% per second in combat, 0% while moving
- Effects: Below thresholds reduces speed and combat effectiveness
  - >75%: Full performance
  - 50-75%: 80% performance
  - 25-50%: 60% performance, -10 morale
  - 10-25%: 30% performance, -20 morale
  - <10%: Exhausted, 10% performance, no recovery

**Morale (0-100)**

- Will to fight / psychological state
- Base: 60 (modified by experience)
- Changes: ±20 from battlefield events
- Effects on decision making:
  - 80-100: Aggressive, will press attack
  - 60-79: Normal, follows orders
  - 40-59: Cautious, defensive
  - 20-39: May retreat if opportunity
  - 0-19: Will attempt to flee

### Static Attributes

**Strength (20-100)**

- Determines damage output, equipment capacity, weapon selection
- 20: Untrained adult
- 40: Regular training
- 60: Athletic
- 80: Elite athlete
- 100: Peak human

**Weight (40-120 kg)**

- Body weight + equipment weight
- Optimal fighting weight: 70-85 kg
- Effects: Movement speed, stamina costs, acceleration
- Heavy armor significantly increases total weight

**Experience (0-1)**

- Training and combat exposure
- 0.0: Untrained civilian
- 0.3: Basic training
- 0.6: Combat veteran
- 0.9: Elite warrior
- Effects:
  - +30% combat effectiveness at max
  - Reduces stamina costs up to 30%
  - Faster action execution up to 25%
  - Improves reaction time up to 20%
  - Reduces morale penalties from stress
  - Higher base morale (+30 at maximum)
  - Unlocks special techniques: feint, power strike, riposte

---

## Combat Effectiveness

**Formula:**

```
combatEffectiveness = (1 - trauma/100) × staminaEffect × (1 + experience × 0.3)

Where:
staminaEffect = 
  stamina > 75 → 1.0
  stamina > 50 → 0.8
  stamina > 25 → 0.6
  stamina > 10 → 0.3
  stamina ≤ 10 → 0.1
```

**Application:**

- Damage output = baseDamage × combatEffectiveness
- Hit chance = baseHitChance × combatEffectiveness
- Action speed = baseSpeed / combatEffectiveness

**Examples:**

- Fresh veteran (0 trauma, 100 stamina, 0.6 exp): 1.0 × 1.0 × 1.18 = **1.18** (118% effective)
- Wounded soldier (50 trauma, 60 stamina, 0.3 exp): 0.5 × 0.8 × 1.09 = **0.44** (44% effective)
- Exhausted elite (20 trauma, 15 stamina, 0.9 exp): 0.8 × 0.3 × 1.27 = **0.30** (30% effective)

---

## Movement System

### Realistic Momentum-Based Physics

**Base Parameters:**

- Walking speed: 1.4 m/s
- Running speed: 2.8 m/s
- Acceleration: 3.0 m/s² (modified by strength/weight ratio)
- Deceleration: 6.0 m/s² (faster than acceleration)
- Turn rate: 360°/second (2π radians/second)

**Speed Modifiers:**

```
maxSpeed = baseSpeed 
  × (1 - trauma/100)                    // Injury penalty
  × staminaEffect                       // Fatigue penalty
  × (1 + (strength - 50) × 0.005)       // Strength bonus (max +25%)
  × (1 - (totalWeight - 70) × 0.003)    // Weight penalty (-0.3% per kg)
  × terrainMultiplier                   // Terrain effects
```

**Turning Mechanics:**

- Continuous rotation (no discrete turns)
- Turn rate decreases with movement speed
- Momentum penalty: Faster movement = slower turns
- Mass penalty: Heavier units turn slower
- Sharp turns naturally reduce forward velocity

**Stamina Costs (Physics-Based):**

```
staminaCost per second = 0.009 × (currentSpeed / 1.0)² × (totalWeight / 70)

Modified by:
- Weight: Higher weight = more drain
- Experience: Up to 30% reduction in costs
- Terrain: Mud doubles drain, hills increase 50%
```

**Endurance Examples:**

- Fresh civilian (35 str, 82kg, 0.0 exp): ~33 min running, ~2.2 hrs walking
- Trained recruit (45 str, 76kg, 0.3 exp): ~60 min running, ~4.0 hrs walking
- Veteran soldier (60 str, 75kg, 0.6 exp): ~106 min running, ~7.1 hrs walking
- Elite soldier (90 str, 72kg, 0.9 exp): ~222 min running, ~14.8 hrs walking

---

## Combat Actions

### Action Timing

Each action has two phases:

**1. Execution Time:**

- Time to perform the action
- Can be interrupted during this phase
- Default timings:
  - Attack: 0.4s
  - Block: 0.2s
  - Move: 0.1s
  - Rotate: 0.1s
  - Kick: 0.5s
  - Headbutt: 0.3s

**2. Recovery Time:**

- Cooldown after execution
- Cannot be interrupted
- Default timings:
  - Attack: 0.1s
  - Block: 0.05s
  - Move: 0.0s
  - Rotate: 0.0s
  - Kick: 0.2s
  - Headbutt: 0.1s

**Timing Modifiers:**

- Trauma: Reduces speed proportionally
- Stamina: <50% = +20%, <25% = +50%, <10% = +100%
- Experience: Up to 25% faster execution
- Weapon weight: Heavy weapons slower

### Reaction Time

Base: 280ms
Range: 220ms (peak) to 600ms (severely impaired)

**Modified by:**

- Experience: Up to 20% improvement
- Fatigue: Up to 50% penalty
- Trauma: Up to 30% penalty

### Hit Probability

Base: 70%

**Modified by:**

```
hitChance = baseChance 
  × combatEffectiveness
  × (1 + experience × 0.3)
  × (1 - targetMovementSpeed × 0.15)    // Per m/s
  × (1 - distancePenalty × 0.10)        // Per meter beyond 1m

Clamped: 20% to 95%
```

### Damage Calculation

```
damage = weaponBaseDamage
  × combatEffectiveness
  × (1 + (strength - 50) / 100)         // Strength bonus
  × momentumBonus                        // Charge attacks
  × weaponMassBonus                      // Heavy weapons
  
finalDamage = damage - armorProtection
trauma += finalDamage
```

---

## Combat Types

### Melee Combat

**Standard Attack:**

- Single target
- Base execution: 0.4s
- Stamina cost: 3-5 (weapon dependent)

**Charge Attack:**

- Momentum bonus: velocity × mass
- Increased damage with running start
- Can knock back lighter opponents
- Shield charges push based on strength/weight difference

**Swing Attack:**

- Hits multiple targets in arc
- Slower execution: +50% time
- Higher stamina cost: +100%
- Good for surrounded situations

**Special Techniques (Experience-gated):**

- **Feint** (exp > 0.5): +40% hit chance, 20 stamina
- **Power Strike** (exp > 0.6): 2x damage, slow, 30 stamina
- **Riposte** (exp > 0.7): Counter-attack on successful block, 15 stamina

### Positional Bonuses

**Flanking:**

- Side attack: +25% damage, -10 morale to defender
- Rear attack: +50% damage, -20 morale to defender

**Elevation:**

- Per meter above target: +15% damage, +10 morale

**Surrounded:**

- -5 morale per surrounding enemy
- Defender must face multiple directions
- Reduced block effectiveness

### Combat Stances

**Aggressive:**

- +30% damage output
- -20% armor effectiveness (exposing self)
- +50% stamina costs
- More likely to press attack

**Defensive:**

- +40% armor effectiveness
- -20% damage output
- -30% stamina costs
- Prioritizes blocking/dodging

**Balanced:**

- Standard values
- Default tactical stance

---

## Equipment System

### Weapons

**Properties:**

- Damage type: cut/pierce/blunt
- Base damage: 20-80
- Weight: 0.5-3.5 kg
- Length: 25-200 cm
- Speed modifier: light faster, heavy slower

**Weight Categories:**

*Light (0.5-1.5 kg):*

- +10% hit chance
- -20% action time
- Lower damage
- Examples: Dagger, short sword, rapier

*Medium (1.5-2.5 kg):*

- Balanced stats
- Standard reference point
- Examples: Long sword, battle axe, spear

*Heavy (2.5-3.5 kg):*

- -10% hit chance
- +20% action time
- Higher damage
- Examples: Great sword, war hammer, poleaxe

*Massive (3.5+ kg):*

- -20% hit chance
- +40% action time
- Devastating damage
- Examples: Zweihander, dane axe, pike

**Strength Requirements:**

```
minStrength = weaponWeight × 15
optimalStrength = weaponWeight × 25

Penalties below optimal:
- Hit chance: -3% per strength point below
- Action speed: +2% per strength point below
- Stamina cost: +3% per strength point below
```

**Reach and Engagement:**

- Short (25-60cm): Close quarters bonus
- Medium (60-100cm): Balanced range
- Long (100-200cm): Superior reach, penalty at close range

### Armor

**Properties:**

- Protection by damage type (cut/stab/crush)
- Weight: 0.3-8.0 kg per piece
- Movement penalty
- Stamina cost increase

**Material Types:**

*Leather (0.3-1.5 kg per piece):*

- Cut: 30-45% protection
- Stab: 20-35% protection
- Crush: 10-25% protection
- -5% speed per 2kg total
- +10% stamina costs

*Chainmail (0.8-3.0 kg per piece):*

- Cut: 80-90% protection
- Stab: 60-70% protection
- Crush: 30-40% protection
- -5% speed per 1.5kg total
- +20% stamina costs

*Plate (1.2-5.0 kg per piece):*

- Cut: 95-100% protection
- Stab: 90-95% protection
- Crush: 80-90% protection
- -5% speed per 1kg total
- +30% stamina costs

**Damage Reduction:**

```
finalDamage = baseDamage × (1 - armorProtection[damageType])

Special cases:
- Crushing: Ignores 50% of armor
- Critical hits: Ignore 30% of armor
- Worn/damaged: 50-80% effectiveness
```

---

## Ranged Combat

**Projectile Physics:**

- Arc trajectory with gravity
- Affected by wind (optional)
- Travel time based on distance
- Friendly fire possible

**Bow Properties:**

- Draw strength requirement
- Range: 15-200m depending on type
- Arrow velocity affects damage
- Accuracy decreases with distance

**Defense:**

- Shields can block arrows
- Cover provides protection
- Movement makes targeting harder

---

## Morale System

### Base Morale Calculation

```
startingMorale = 60 + experienceModifier

Experience modifiers:
- 0.0-0.2: -10 (untrained)
- 0.2-0.4: +0 (basic training)
- 0.4-0.6: +10 (veteran)
- 0.6-0.8: +20 (elite)
- 0.8-1.0: +30 (legendary)
```

### Major Morale Events

**Negative:**

- Witnessed ally death: -15
- Took injury: -10 to -20 (severity based)
- Leader death: -30
- Being surrounded: -5 per enemy
- High trauma: -1 per 2 trauma above 50
- Low stamina: -10 below 50%, -20 below 25%

**Positive:**

- Killed enemy: +10
- Enemy fleeing: +15
- In formation: +10
- Leader nearby: +10
- Allies nearby: +5 per ally within 10m
- Holding advantageous position: +10

**Experience Stress Resistance:**

```
stressResistance = experience × 20 (0-20 points)

Applied to negative events:
actualMoraleLoss = baseEvent + stressResistance

Example: Veteran (0.5 exp) seeing ally die
Base: -15, Resistance: +10 → Actual: -5
```

### Morale Contagion

**Panic Spreads:**

```
if (soldier.fleeing) {
  for (nearby within 10m) {
    nearby.morale -= 3 × (1 - nearby.experience)
  }
}
```

**Courage Spreads:**

```
if (soldier.charging && soldier.morale > 80) {
  for (nearby within 10m) {
    nearby.morale += 2
  }
}
```

### Decision Making

Morale directly affects AI behavior:

- High (80+): Aggressive actions, maintain formation, protect allies
- Normal (60-79): Follow orders, balanced behavior
- Low (40-59): Cautious, prefer defensive actions
- Breaking (20-39): Seek escape routes, may ignore orders
- Routing (<20): Active flight, abandon everything

---

## Formation System

### Formation Types

**Line:**

- Wide frontage, maximum engagement
- +10 morale bonus
- Vulnerable to flanking
- Good for meeting engagement

**Column:**

- Narrow front, concentrated force
- +5 morale bonus
- Can break through lines
- Good for breakthrough attacks

**Shield Wall:**

- Maximum frontal protection
- +20 morale bonus
- +40% armor effectiveness (front)
- Flanks vulnerable
- Immobile

**Square:**

- All-around defense
- +15 morale bonus
- Anti-cavalry formation
- Cannot advance
- Good when surrounded

**Skirmish:**

- Loose formation
- +0 morale
- Hard to hit
- Low melee effectiveness
- Good for ranged harassment

### Formation Mechanics

**Cohesion (0-100):**

- Starts at 100 when formed
- Decreases from casualties, fatigue, morale loss
- Below 50: Formation bonuses reduced 50%
- Below 25: Formation effectively broken

**Individual Formation AI:**

- Soldiers desire to maintain formation position
- Wounded/tired soldiers lag behind (creates natural gaps)
- Panic causes individuals to break away
- Veterans hold position better than recruits
- Formation quality emerges from individual behaviors

---

## Terrain System

### Terrain Types

**Grass/Open:**

- No modifiers
- Standard movement and combat

**Mud:**

- -50% movement speed
- +100% stamina drain
- -10 morale (unpleasant conditions)

**Hills/Elevation:**

- -30% movement speed uphill
- +15% damage per meter advantage
- +10 morale per meter advantage
- Defender sees farther

**Forest:**

- -40% movement speed
- Breaks line of sight
- Formations disrupted
- Ranged weapons less effective

**Chokepoints:**

- Limit engagement width
- Nullifies numerical superiority
- Defender advantage

---

## Spatial Systems

### Collision Detection

**Soldier-Soldier:**

- Cannot pass through each other
- Units physically block movement
- Creates natural formation compression
- Retreating units can get stuck in crowds

**Momentum Impacts:**

- High-speed collision causes trauma
- Shield charge pushes based on mass/strength difference
- Can knock down lighter units

### Spatial Partitioning

**Grid-based system for:**

- Proximity queries (who's nearby?)
- Collision detection
- Formation maintenance
- Morale contagion range
- Area-of-effect attacks

**Typical cell size:** 5-10 meters (weapon reach + buffer)

---

## Trauma & Healing

### Trauma Accumulation

**Sources:**

- Weapon damage (primary)
- Momentum impacts
- Fall damage
- Crushing (formations, cavalry)

**Bleeding Effect:**

```
if (trauma > 30) {
  trauma += 0.1 per second
  // Continuous increase until death or treatment
}
```

### Death Conditions

**Incapacitation/Death:**

- Trauma ≥ 100: Dead or unconscious
- Stamina = 0 for extended period: Collapsed (recoverable)
- Morale routing + caught: Captured or killed

### Recovery (Future Feature)

**Rest Recovery:**

- ~1% trauma healed per day
- Requires safe location
- Food and medical supplies improve rate

**Long-term Consequences:**

- Severe trauma may leave permanent effects
- Veteran soldiers accumulate scars
- Some injuries may cause permanent stat penalties

---

## Civilian Life Integration

### Soldier as Individual

Each soldier has:

- Name
- Age
- Profession (farmer, blacksmith, hunter, craftsman)
- Village of origin
- Family connections
- Training hours (affects experience)

### Lifecycle

**Peacetime:**

- Work profession (generate resources)
- Train for combat (build experience)
- Age and develop

**War:**

- Conscription from villages
- Combat performance reflects background
- Hunters have better stamina
- Blacksmiths have higher strength

**Post-Battle:**

- Survivors return to villages
- Trauma affects work capability
- Dead soldiers = lost labor
- Veterans provide village defense

### Social Bonds

**Same Village Units:**

- +5 morale when fighting together
- Witness death of village-mate: -25 morale
- Creates emergent unit cohesion

**Family Ties:**

- Brothers in same unit: +20 morale when nearby
- Death of family member: -50 morale, may break

---

## Advanced Mechanics (Future)

### Fatigue Management

- Units need rest between battles
- Forced marches possible but drain stamina
- Campaign pacing matters strategically

### Supply Lines

- Armies need food
- Cut supply = gradual weakening
- Foraging vs supply trains trade-offs

### Weather Effects

- Rain: -10% accuracy, -5 morale
- Snow: -20% movement, increased stamina drain
- Heat: Increased stamina drain, especially in armor

### Leadership

- Commander units provide morale aura
- Tactical abilities (rally, inspire)
- Commander death causes cascade morale failure

---

## Balance Principles

1. **No dominant strategies:** Rock-paper-scissors interactions
2. **Experience matters but doesn't guarantee victory:** Numbers and tactics can overcome skill
3. **Fatigue is real:** Can't fight indefinitely
4. **Armor has trade-offs:** Protection vs mobility
5. **Morale can break armies:** Psychological is as important as physical
6. **Individual variation creates emergence:** No two battles play out the same
7. **Position matters:** Flanking, elevation, terrain create tactical depth

---

## Design Goals Achieved

✓ Individual soldier simulation
✓ Emergent army behavior
✓ Formations naturally messy under stress
✓ Progressive degradation (fresh → tired → wounded → incapacitated)
✓ Psychological and physical systems interact
✓ Veterans outperform recruits realistically
✓ Equipment creates meaningful choices
✓ Tactical positioning rewarded
✓ Civilians-to-soldiers pipeline
✓ Story-generating potential (veteran with scars, heroic last stands, routing armies)
