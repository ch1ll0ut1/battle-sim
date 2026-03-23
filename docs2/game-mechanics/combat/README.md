# Combat Systems

## Purpose
Mechanics governing individual unit combat behavior, from stance selection through threat recognition to strike resolution.

## System Overview
Combat flows through stages: **Stance → Threat Recognition → Defense Selection → Strike Resolution → Damage/Effects**

Units dynamically adjust their combat stance based on situation (stamina, health, morale, tactical position). When an enemy attacks, the defender's ability to recognize and respond to the threat depends on their stance and experience. Strike resolution determines dodge/block/hit outcomes, with block quality affecting stamina costs and counter-opportunities.

## Documents

- **[combat-stances.md](./combat-stances.md)** - Physical posture affecting action readiness and strike power
- **[threat-assessment.md](./threat-assessment.md)** - Attack recognition and event-driven detection
- **[actions.md](./actions.md)** - All combat actions (attack, block, dodge, parry), timing, execution, strike resolution, damage
- **[combat-effectiveness.md](./combat-effectiveness.md)** - How stats combine into effectiveness

## Related Domains
- [../core-systems/](../core-systems/) - Attributes, stamina, morale, trauma
- [../equipment/](../equipment/) - Weapons, armor, shields

## Key Interactions

```
[Stance State: AGGRESSIVE/BALANCED/DEFENSIVE]
         ↓ (modifies execution timing & strike power)

Action Flow:
[Enemy Attacks] → [Threat Assessment] → [Defender Responds]
                         ↓                       ↓
                 [Time Until Strike]    [Defense Action]
                         ↓                       ↓
                   [Strike Resolution: Dodge/Hit/Block/Damage]
                         ↓
                   [Apply Effects]
```

## Design Goals
- **Realistic fight duration:** Experienced fighters last 2-5 minutes, novices 30-60 seconds
- **Event-driven performance:** Scales to 10,000+ units via event triggers, not continuous polling
- **Emergent behavior:** Simple probabilistic rules create varied, realistic combat
- **Historical accuracy:** Based on HEMA research for timing and mechanics
