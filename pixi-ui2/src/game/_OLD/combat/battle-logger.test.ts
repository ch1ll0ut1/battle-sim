// Tests for BattleLogger class
import { BattleLogger } from './battle-logger.js'
import { Unit } from '../units/unit.js'

describe('BattleLogger', () => {
  let logger: BattleLogger

  beforeEach(() => {
    logger = new BattleLogger()
  })

  it('should log events with timestamps', () => {
    logger.setTime(1.5)
    logger.log('Test event')
    
    const events = logger.getEvents()
    expect(events).toHaveLength(1)
    expect(events[0].timestamp).toBe(1.5)
    expect(events[0].message).toBe('[1.5s] Test event')
  })

  it('should clear events', () => {
    logger.log('Test event')
    expect(logger.getEvents()).toHaveLength(1)
    
    logger.clear()
    expect(logger.getEvents()).toHaveLength(0)
  })

  it('should generate health report for unit', () => {
    const unit = new Unit(1, 'Test Unit', 0.8, 70, 80)
    const report = logger.generateHealthReport(unit)
    
    expect(report.unitId).toBe(1)
    expect(report.unitName).toBe('Test Unit')
    expect(report.isAlive).toBe(true)
    expect(report.consciousness).toBe(100)
    expect(report.bloodLoss).toBe(0)
    expect(report.totalPain).toBe(0)
    expect(report.totalShock).toBe(0)
    expect(report.stamina).toBeGreaterThan(0)
    expect(report.maxStamina).toBeGreaterThan(0)
    expect(report.injuries).toHaveLength(0)
  })

  it('should handle multiple events', () => {
    logger.setTime(0.0)
    logger.log('Battle started')
    logger.setTime(0.1)
    logger.log('Unit attacks')
    logger.setTime(0.2)
    logger.log('Unit hits')
    
    const events = logger.getEvents()
    expect(events).toHaveLength(3)
    expect(events[0].message).toBe('[0.0s] Battle started')
    expect(events[1].message).toBe('[0.1s] Unit attacks')
    expect(events[2].message).toBe('[0.2s] Unit hits')
  })
}) 