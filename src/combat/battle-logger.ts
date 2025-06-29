// Battle Logger - Handles all battle event logging and reporting

import { Unit } from '../units/unit.js'

export interface CombatEvent {
  timestamp: number
  message: string
}

export interface UnitHealthReport {
  unitId: number
  unitName: string
  isAlive: boolean
  consciousness: number
  bloodLoss: number
  totalPain: number
  totalShock: number
  stamina: number
  maxStamina: number
  injuries: Array<{
    bodyPart: string
    severity: string
    pain: number
    shock: number
    woundType: string
    bleedingRate: number
    permanentEffect?: string
  }>
  causeOfDeath?: string
  timeToDeath?: number
}

export class BattleLogger {
  private events: CombatEvent[] = []
  private currentTime: number = 0

  /**
   * Logs a battle event with timestamp
   */
  log(message: string): void {
    const event: CombatEvent = {
      timestamp: this.currentTime,
      message: `[${this.currentTime.toFixed(1)}s] ${message}`
    }
    this.events.push(event)
  }

  /**
   * Updates the current time for logging
   */
  setTime(time: number): void {
    this.currentTime = time
  }

  /**
   * Gets all logged events
   */
  getEvents(): CombatEvent[] {
    return this.events
  }

  /**
   * Clears all events (useful for new battles)
   */
  clear(): void {
    this.events = []
    this.currentTime = 0
  }

  /**
   * Generates health report for a unit
   */
  generateHealthReport(unit: Unit): UnitHealthReport {
    const injuries = unit.body.getInjuries();
    let causeOfDeath: string | undefined = undefined;
    let timeToDeath: number | undefined = undefined;
    if (!unit.body.isAlive()) {
      if (unit.body.getBloodLoss() >= 100) {
        causeOfDeath = 'Blood loss';
      } else if (unit.body.getConsciousness() <= 0) {
        causeOfDeath = 'Unconsciousness';
      }
      const fatal = injuries.find(i => i.isFatal);
      if (fatal) {
        causeOfDeath = `Fatal injury (${fatal.bodyPart})`;
        if (fatal.timeToDeath) timeToDeath = fatal.timeToDeath;
      }
    } else {
      // If alive but has fatal wounds, estimate time to death
      const fatal = injuries.find(i => i.isFatal);
      if (fatal && fatal.bleedingRate > 0) {
        // Estimate time to bleed out from current blood loss
        const remaining = 100 - unit.body.getBloodLoss();
        timeToDeath = remaining / fatal.bleedingRate;
      }
    }
    return {
      unitId: unit.id,
      unitName: unit.name,
      isAlive: unit.body.isAlive(),
      consciousness: unit.body.getConsciousness(),
      bloodLoss: unit.body.getBloodLoss(),
      totalPain: unit.body.getTotalPain(),
      totalShock: unit.body.getTotalShock(),
      stamina: unit.combat.stamina,
      maxStamina: unit.combat.maxStamina,
      injuries: injuries.map(injury => ({
        bodyPart: injury.bodyPart,
        severity: injury.severity,
        pain: injury.pain,
        shock: injury.shock,
        woundType: injury.woundType,
        bleedingRate: injury.bleedingRate,
        permanentEffect: injury.permanentEffect
      })),
      causeOfDeath,
      timeToDeath
    }
  }

  /**
   * Displays health reports for all units
   */
  displayHealthReports(units: Unit[]): void {
    console.log('\n--- Unit Health Reports ---')
    
    units.forEach(unit => {
      const report = this.generateHealthReport(unit)
      console.log(`\n${report.unitName} (Unit ${report.unitId}):`)
      console.log(`  Status: ${report.isAlive ? 'Alive' : 'Dead'}`)
      if (!report.isAlive && report.causeOfDeath) {
        console.log(`  Cause of Death: ${report.causeOfDeath}`)
      }
      if (report.timeToDeath && report.isAlive) {
        console.log(`  Estimated Time to Death: ${report.timeToDeath.toFixed(1)}s`)
      }
      console.log(`  Consciousness: ${report.consciousness.toFixed(1)}/100`)
      console.log(`  Blood Loss: ${report.bloodLoss.toFixed(1)}/100`)
      console.log(`  Pain: ${report.totalPain.toFixed(1)}/100`)
      console.log(`  Shock: ${report.totalShock.toFixed(1)}/100`)
      console.log(`  Stamina: ${report.stamina.toFixed(1)}/${report.maxStamina.toFixed(1)}`)
      
      if (report.injuries.length > 0) {
        console.log(`  Injuries:`)
        report.injuries.forEach(injury => {
          let details = `${injury.bodyPart}: ${injury.severity}, ${injury.woundType} (${injury.bleedingRate.toFixed(1)} bleeding/sec)`
          if (injury.permanentEffect) {
            details += `, permanent: ${injury.permanentEffect}`
          }
          console.log(`    ${details}`)
        })
      } else {
        console.log(`  Injuries: None`)
      }
    })
  }

  formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds.toFixed(1)}s`
    const minutes = seconds / 60
    if (minutes < 60) return `${minutes.toFixed(1)}min`
    const hours = minutes / 60
    if (hours < 24) return `${hours.toFixed(1)}h`
    const days = hours / 24
    return `${days.toFixed(1)}d`
  }

  displayBattleResult(result: any, units: Unit[]): void {
    console.log(`\n--- Battle Results ---`)
    console.log(`Duration: ${this.formatDuration(result.duration)}`)
    if (result.winner) {
      console.log(`Winner: ${result.winner.name} (Unit ${result.winner.id})`)
    } else {
      console.log(`Result: Draw`)
    }
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
    this.displayHealthReports(units)
  }

  displaySummary(result: any): void {
    const totalEvents = this.getEvents().length
    const attackEvents = this.getEvents().filter(e => e.message.includes('attacks')).length
    const hitEvents = this.getEvents().filter(e => e.message.includes('hits')).length
    console.log(`\nSummary:`)
    console.log(`- Total actions: ${totalEvents}`)
    console.log(`- Attacks: ${attackEvents}`)
    console.log(`- Hits: ${hitEvents}`)
    console.log(`- Hit rate: ${attackEvents > 0 ? ((hitEvents / attackEvents) * 100).toFixed(1) : 0}%`)
  }

  displayEvents(result: any): void {
    console.log(`\nKey Events:`)
    const keyEvents = this.getEvents().filter(event => 
      event.message.includes('hits') || 
      event.message.includes('fatal') || 
      event.message.includes('dies') ||
      event.message.includes('Battle ended')
    )
    keyEvents.forEach(event => {
      console.log(event.message)
    })
  }

  displayDetailed(result: any): void {
    console.log(`\nDetailed Events:`)
    this.getEvents().forEach(event => {
      console.log(event.message)
    })
  }
} 