# Documentation Templates

This folder contains templates for creating consistent, technical game mechanics documentation.

## Available Templates

### system-mechanics-template.md
**Use for:** Individual game systems (stamina, threat-assessment, shields, combat-stances, etc.)

**Structure:**
- Overview (purpose, scope)
- Key Concepts (term definitions)
- Mechanics (formulas, parameters, rules)
- Integration Points (dependencies, effects)
- Examples (concrete scenarios with calculations)
- Implementation Notes (performance, frequency, edge cases)
- References (related systems, research)

**Target length:** 100-200 lines (max 300)

### design-principles-template.md
**Use for:** Philosophy, balance, performance strategy documents

**Structure:**
- Principle Statement
- Rationale (why it matters, what it prevents)
- Application (domain-specific examples)
- Validation (metrics, trade-offs)
- Examples (good vs bad)
- References

**Target length:** 80-150 lines (max 200)

### folder-readme-template.md
**Use for:** Folder-level README.md files for navigation

**Structure:**
- Purpose (what this domain encompasses)
- System Overview (how systems relate)
- Documents (categorized list with descriptions)
- Related Domains (cross-references)
- Key Interactions (diagram/list)

**Target length:** 50-100 lines (max 150)

## Writing Guidelines

### DO:
- Use formulas and pseudocode
- Provide specific numeric values in tables
- Give concrete examples with calculations
- Cross-reference related systems
- State assumptions and constraints
- Include performance notes

### DON'T:
- Use flowery language or marketing speak
- Explain obvious concepts
- Repeat information from other docs (link instead)
- Mix implementation details with mechanics (separate sections)
- Exceed maximum lengths (split into sub-systems instead)

## Cross-Reference Format

**Internal links:**
```markdown
[System Name](./relative/path.md) - Brief context
```

**External links:**
```markdown
See [HEMA Research](../design-principles/historical-accuracy.md)
```

## Length Limits

If a document exceeds maximum length, split it into sub-systems:

**Example:** `combat-mechanics.md` (500 lines) should become:
- `combat-overview.md` (100 lines)
- `threat-assessment.md` (120 lines)
- `strike-resolution.md` (130 lines)
- `defense-mechanics.md` (150 lines)
