// Test script to run a simple battle

import { BattleScenario } from './_OLD/combat/battle-scenario.js'

// Parse command line arguments
const args = process.argv.slice(2)
const scenarioType = (args[0] as '1v1' | '1v2' | '2v2') || '1v1'
const logLevel = (args[1] as 'summary' | 'events' | 'detailed') || 'detailed'

console.log('=== Battle Simulator Test ===\n')

// Get preset units
const presets = BattleScenario.getPresetUnits()

if (scenarioType === '1v1') {
  // Run a 1v1 battle: Veteran Swordsman vs Novice Swordsman
  console.log('Running 1v1 battle...')
  BattleScenario.run1v1Battle(
    presets.veteran_swordsman,
    presets.novice_swordsman,
    logLevel
  )
} else if (scenarioType === '1v2') {
  // Run a 1v2 battle: Veteran Swordsman vs two Novice Swordsmen
  console.log('Running 1v2 battle...')
  BattleScenario.run1v2Battle(
    presets.veteran_swordsman,
    [presets.novice_swordsman, presets.novice_axeman],
    logLevel
  )
} else if (scenarioType === '2v2') {
  // Run a 2v2 battle: Veteran Swordsman & Veteran Axeman vs Novice Swordsman & Novice Spearman
  console.log('Running 2v2 battle...')
  BattleScenario.run2v2Battle(
    [presets.veteran_swordsman, presets.veteran_axeman],
    [presets.novice_swordsman, presets.novice_spearman],
    logLevel
  )
} else {
  console.log(`Unknown scenario type: ${scenarioType}`)
  process.exit(1)
}

console.log('\n' + '='.repeat(50) + '\n')

// Run a 1v1 battle: Veteran Axeman vs Novice Spearman
console.log('Running another 1v1 battle...')
BattleScenario.run1v1Battle(
  presets.veteran_axeman,
  presets.novice_spearman,
  'events'
)

console.log('\n' + '='.repeat(50) + '\n') 