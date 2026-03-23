# Combat Stances

## Overview
**Purpose:** Physical and psychological preparation posture affecting action readiness and combat behavior
**Scope:** Stance types, postural mechanics, timing effects, switching conditions, external control priorities

## Key Concepts

- **Stance:** Physical posture and mental preparation (weight distribution, ready position, focus)
- **Weight Distribution:** Forward (aggressive) vs backward (defensive) affects strike power and readiness
- **Response Time:** How quickly unit recognizes and responds to threats based on attention focus
- **Execution Time:** How quickly actions execute based on physical preparation for that action type

## Mechanics

### Stance Types

**Three available stances:**

| Stance | Posture | Focus | Physical Preparation |
|--------|---------|-------|---------------------|
| AGGRESSIVE | Weight on front foot, weapon ready to strike | Attacking, pressing forward | Ready to deliver powerful strikes |
| BALANCED | Neutral weight, weapon/shield ready | Situational awareness | Ready for either offense or defense |
| DEFENSIVE | Weight on back foot, shield/weapon ready to block | Watching for threats, prepared to retreat | Ready to block and counter |

### Physical Mechanics

**AGGRESSIVE:**
```
Physical posture:
- Weight forward, hips rotated for power
- Weapon chambered for strike
- Watching opponent's openings

Natural consequences:
- Strike power: Full body weight behind blow (realistic sword fighting principle)
- Attack execution: ~20% faster (already in striking position)
- Block execution: ~20% slower (must transition from offensive posture)
- Threat response: ~20% slower (focused on attacking, not watching for threats)
```

**BALANCED:**
```
Physical posture:
- Neutral weight distribution
- Weapon/shield in ready position
- General awareness

Natural consequences:
- Strike power: Normal (baseline)
- Attack execution: Baseline timing
- Block execution: Baseline timing
- Threat response: Baseline timing
```

**DEFENSIVE:**
```
Physical posture:
- Weight on back foot
- Shield/weapon positioned for blocking
- Vigilant watching for incoming attacks

Natural consequences:
- Strike power: Reduced (cannot commit body weight, arm-only strikes)
- Attack execution: ~20% slower (must transition from defensive posture)
- Block execution: ~20% faster (already in blocking position)
- Threat response: ~20% faster (actively watching for threats)
```

### Stance Switching Logic

**Event-Based Triggers:**

Stance switches occur in response to specific conditions:

**Switch to DEFENSIVE:**
```
Triggers:
- Threat assessment indicates high danger (2+ strong enemies)
- Morale drops below survival threshold
- Stamina drops below exhaustion threshold
- Individual survival instinct override
```

**Switch to AGGRESSIVE:**
```
Triggers:
- Low/no immediate threats detected
- High morale and sufficient stamina
- General orders (formation attack command)
```

**Switch to BALANCED:**
```
Triggers:
- Default state when no strong triggers present
- Moderate threat levels
- Standard combat engagement
```

**Priority System:**

Stance is controlled by multiple systems with clear priority:

| Priority | Source | Override Conditions |
|----------|--------|-------------------|
| 1 (Highest) | Individual Survival | Exhaustion, panic, routing |
| 2 | General Orders | Formation commands (attack/defend/hold) |
| 3 | Individual Threat Assessment | Calculated response to local tactical situation |

**Rules:**
- Higher priority overrides lower priority
- Survival instinct cannot be overridden (exhausted soldier always defensive)
- General can command formation stance, but individuals override for survival
- Stance changes are immediate (discrete, not gradual)

## Integration Points

**Depends on:**
- [threat-assessment.md](./threat-assessment.md) - Provides high/low threat signals for switching
- [../core-systems/morale-system.md](../core-systems/morale-system.md) - Morale thresholds trigger switches
- [../core-systems/stamina-system.md](../core-systems/stamina-system.md) - Exhaustion triggers defensive stance
- [../formations/formation-system.md](../formations/formation-system.md) - General orders control formation stance

**Affects:**
- [actions.md](./actions.md) - Modifies all action execution times (~20% faster/slower) and strike power (weight distribution)

## Examples

### Example 1: Fresh Soldier, No Immediate Threats
**Setup:**
- Stamina: 85%
- Morale: 75
- Nearby enemies: 1 (moderate threat level)
- General orders: None (independent)

**Stance Decision:**
```
Priority 1 (Survival): Not triggered (good stamina, not exhausted)
Priority 2 (General): No orders
Priority 3 (Threat Assessment): Low threat → AGGRESSIVE
```

**Outcome:** AGGRESSIVE stance
- Weight forward, ready to strike
- Attack execution ~20% faster
- Block execution ~20% slower
- Full power strikes (body weight committed)

### Example 2: Surrounded by Multiple Enemies
**Setup:**
- Stamina: 60%
- Morale: 55
- Nearby enemies: 3 (high threat assessment)
- General orders: Hold position

**Stance Decision:**
```
Priority 1 (Survival): Not triggered (adequate stamina)
Priority 2 (General): Hold position (DEFENSIVE)
Priority 3 (Threat Assessment): High threat → DEFENSIVE
```

**Outcome:** DEFENSIVE stance
- Weight back, shield/weapon ready to block
- Block execution ~20% faster
- Attack execution ~20% slower
- Reduced strike power (cannot commit weight)
- Watching for incoming attacks

### Example 3: Exhausted Fighter (Survival Override)
**Setup:**
- Stamina: 12% (exhaustion)
- Morale: 65
- Nearby enemies: 1 (moderate threat)
- General orders: Attack formation (AGGRESSIVE)

**Stance Decision:**
```
Priority 1 (Survival): TRIGGERED - exhaustion → DEFENSIVE
Priority 2 (General): Attack order → AGGRESSIVE (OVERRIDDEN)
Priority 3 (Threat Assessment): Irrelevant (overridden)
```

**Outcome:** DEFENSIVE stance
- Survival instinct overrides general's attack order
- Cannot physically maintain aggressive posture
- Focuses on blocking and retreating
- Reduced strike power acceptable (survival priority)

### Example 4: Formation Attack Order
**Setup:**
- Stamina: 70%
- Morale: 68
- Nearby enemies: 2 (moderate threat)
- General orders: Formation advance (AGGRESSIVE)

**Stance Decision:**
```
Priority 1 (Survival): Not triggered
Priority 2 (General): Formation advance → AGGRESSIVE
Priority 3 (Threat Assessment): Would prefer DEFENSIVE (overridden by orders)
```

**Outcome:** AGGRESSIVE stance
- Following formation commander's orders
- Part of coordinated push
- Individual threat assessment overridden by tactics
- Maintains offensive posture with formation

## Implementation Notes

**Performance:**
- Stance evaluation is event-driven (triggered by specific conditions)
- O(1) per trigger - simple priority check and assignment
- No continuous polling or complex calculations
- Scales efficiently to 10,000+ units

**Update Triggers:**
- Threat assessment level changes (high/medium/low)
- Morale/stamina cross thresholds
- General issues formation orders
- Immediate response (no delay)

**Edge Cases:**
- Unconscious/dead units → stance irrelevant (no combat)
- Routing units → stance irrelevant (flee behavior active)
- Action in progress → stance switch queued until action completes
- Conflicting orders → priority system resolves (survival > general > individual)

**Visual Representation:**
- MVP: Simple color indicator or icon above unit
- Future: Body posture/lean (forward/neutral/back)
- Future: Shield position (lowered/ready/raised)
- Future: Weapon position (chambered/ready/defensive)

## References

**Related Systems:**
- [threat-assessment.md](./threat-assessment.md) - Triggers stance switches based on danger level
- [actions.md](./actions.md) - All action execution times (attack/block/dodge) and strike power modified by stance
- [../core-systems/morale-system.md](../core-systems/morale-system.md) - Morale thresholds trigger switches
- [../core-systems/stamina-system.md](../core-systems/stamina-system.md) - Exhaustion triggers defensive stance
- [../formations/formation-system.md](../formations/formation-system.md) - General orders control formation stance

**Research:**
- HEMA: Weight commitment essential for powerful strikes
- Historical: Defensive postures when fatigued/outnumbered
- Sword fighting: Forward weight = power, backward weight = safety
- Medieval combat: Posture determines action readiness
