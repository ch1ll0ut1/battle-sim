// Battle Scenario - Sets up and runs different battle configurations

import { Unit } from '../units/unit.js'
import { Weapon } from '../weapons/weapon.js'
import { Weapons } from '../weapons/weapons.js'
import { CombatEngine, BattleResult } from './combat-engine.js'

export interface BattleConfig {
  type: '1v1' | '1v2' | '2v2'
  logLevel: 'summary' | 'events' | 'detailed'
  unitConfigs: UnitConfig[]
}

export interface UnitConfig {
  name: string
  experience: number
  weight: number
  strength: number
  weaponName?: string
}

export class BattleScenario {
  /**
   * Creates units based on configuration
   */
  static createUnits(configs: UnitConfig[]): Unit[] {
    return configs.map((config, index) => {
      const unit = new Unit(
        index + 1, // id as a number, starting from 1
        config.name,
        config.experience,
        config.weight,
        config.strength
      )
      
      // Equip weapon if specified
      if (config.weaponName) {
        const weapon = Weapons.findByName(config.weaponName)
        if (weapon) {
          unit.combat.equipWeapon(weapon)
        }
      }
      
      return unit
    })
  }

  /**
   * Runs a 1v1 battle between two units
   */
  static run1v1Battle(
    unit1Config: UnitConfig,
    unit2Config: UnitConfig,
    logLevel: 'summary' | 'events' | 'detailed' = 'events'
  ): BattleResult {
    const units = this.createUnits([unit1Config, unit2Config])
    const engine = new CombatEngine(units)
    
    console.log(`\n=== 1v1 Battle: ${unit1Config.name} vs ${unit2Config.name} ===`)
    console.log(`${unit1Config.name}: ${unit1Config.experience > 0.5 ? 'Veteran' : 'Novice'} (${unit1Config.weaponName || 'Unarmed'})`)
    console.log(`${unit2Config.name}: ${unit2Config.experience > 0.5 ? 'Veteran' : 'Novice'} (${unit2Config.weaponName || 'Unarmed'})`)
    
    const result = engine.runBattle(logLevel)
    
    // Display results
    this.displayBattleResult(result)
    
    return result
  }

  /**
   * Runs a 1v2 battle (one strong unit vs two weaker units)
   */
  static run1v2Battle(
    strongUnitConfig: UnitConfig,
    weakUnitConfigs: [UnitConfig, UnitConfig],
    logLevel: 'summary' | 'events' | 'detailed' = 'events'
  ): BattleResult {
    const units = this.createUnits([strongUnitConfig, ...weakUnitConfigs])
    const engine = new CombatEngine(units)
    
    console.log(`\n=== 1v2 Battle: ${strongUnitConfig.name} vs ${weakUnitConfigs[0].name} & ${weakUnitConfigs[1].name} ===`)
    console.log(`${strongUnitConfig.name}: ${strongUnitConfig.experience > 0.5 ? 'Veteran' : 'Novice'} (${strongUnitConfig.weaponName || 'Unarmed'})`)
    weakUnitConfigs.forEach(config => {
      console.log(`${config.name}: ${config.experience > 0.5 ? 'Veteran' : 'Novice'} (${config.weaponName || 'Unarmed'})`)
    })
    
    const result = engine.runBattle(logLevel)
    
    // Display results
    this.displayBattleResult(result)
    
    return result
  }

  /**
   * Runs a 2v2 battle between two teams
   */
  static run2v2Battle(
    team1Configs: [UnitConfig, UnitConfig],
    team2Configs: [UnitConfig, UnitConfig],
    logLevel: 'summary' | 'events' | 'detailed' = 'events'
  ): BattleResult {
    const units = this.createUnits([...team1Configs, ...team2Configs])
    const engine = new CombatEngine(units)
    
    console.log(`\n=== 2v2 Battle: Team 1 vs Team 2 ===`)
    console.log(`Team 1: ${team1Configs[0].name} & ${team1Configs[1].name}`)
    console.log(`Team 2: ${team2Configs[0].name} & ${team2Configs[1].name}`)
    
    const result = engine.runBattle(logLevel)
    
    // Display results
    this.displayBattleResult(result)
    
    return result
  }

  /**
   * Displays battle results based on log level
   */
  private static displayBattleResult(result: BattleResult): void {
    console.log(`\n--- Battle Results ---`)
    console.log(`Duration: ${this.formatDuration(result.duration)}`)
    
    if (result.winner) {
      const winnerIndex = result.winner === result.events[0]?.unit ? 0 : 1
      console.log(`Winner: Unit ${winnerIndex + 1}`)
    } else {
      console.log(`Result: Draw`)
    }

    // Display events based on log level
    switch (result.logLevel) {
      case 'summary':
        this.displaySummary(result)
        break
      case 'events':
        this.displayEvents(result)
        break
      case 'detailed':
        this.displayDetailed(result)
        break
    }
  }

  /**
   * Formats duration in seconds to the largest appropriate time unit
   */
  private static formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds.toFixed(1)}s`
    const minutes = seconds / 60
    if (minutes < 60) return `${minutes.toFixed(1)}min`
    const hours = minutes / 60
    if (hours < 24) return `${hours.toFixed(1)}h`
    const days = hours / 24
    return `${days.toFixed(1)}d`
  }

  /**
   * Displays summary of battle
   */
  private static displaySummary(result: BattleResult): void {
    const totalEvents = result.events.length
    const attackEvents = result.events.filter(e => e.action?.type === 'attack').length
    const hitEvents = result.events.filter(e => e.message.includes('hits')).length
    
    console.log(`\nSummary:`)
    console.log(`- Total actions: ${totalEvents}`)
    console.log(`- Attacks: ${attackEvents}`)
    console.log(`- Hits: ${hitEvents}`)
    console.log(`- Hit rate: ${attackEvents > 0 ? ((hitEvents / attackEvents) * 100).toFixed(1) : 0}%`)
  }

  /**
   * Displays key events
   */
  private static displayEvents(result: BattleResult): void {
    console.log(`\nKey Events:`)
    
    // Show first few events, last few events, and key moments
    const keyEvents = result.events.filter(event => 
      event.message.includes('hits') || 
      event.message.includes('fatal') || 
      event.message.includes('dies') ||
      event.message.includes('Battle ended')
    )
    
    keyEvents.forEach(event => {
      console.log(event.message)
    })
  }

  /**
   * Displays all events in detail
   */
  private static displayDetailed(result: BattleResult): void {
    console.log(`\nDetailed Events:`)
    result.events.forEach(event => {
      console.log(event.message)
    })
  }

  /**
   * Creates preset unit configurations for testing
   */
  static getPresetUnits(): Record<string, UnitConfig> {
    return {
      'veteran_swordsman': {
        name: 'Veteran Swordsman',
        experience: 0.8,
        weight: 75,
        strength: 85,
        weaponName: 'Long Sword'
      },
      'novice_swordsman': {
        name: 'Novice Swordsman',
        experience: 0.3,
        weight: 70,
        strength: 70,
        weaponName: 'Short Sword'
      },
      'veteran_axeman': {
        name: 'Veteran Axeman',
        experience: 0.7,
        weight: 85,
        strength: 90,
        weaponName: 'Battle Axe'
      },
      'novice_axeman': {
        name: 'Novice Axeman',
        experience: 0.2,
        weight: 80,
        strength: 75,
        weaponName: 'Hand Axe'
      },
      'veteran_spearman': {
        name: 'Veteran Spearman',
        experience: 0.6,
        weight: 70,
        strength: 75,
        weaponName: 'Spear'
      },
      'novice_spearman': {
        name: 'Novice Spearman',
        experience: 0.25,
        weight: 65,
        strength: 65,
        weaponName: 'Short Spear'
      }
    }
  }
} 