// Realistic weapon definitions with weapon types and damage types

import { Weapon, DamageType } from './weapon'
import { Unit } from '../units/unit'

export class Weapons {
  // Light Weapons (1-3 kg) - Fast, precise
  static readonly DAGGER = new Weapon('Dagger', 0.5, 25, 'dagger', ['piercing'], 0.0, 0.9, 2.0)
  static readonly SHORT_SWORD = new Weapon('Short Sword', 1.0, 60, 'sword', ['cutting', 'piercing'], 0.8, 0.7, 5.0)
  static readonly RAPIER = new Weapon('Rapier', 1.2, 110, 'sword', ['piercing'], 0.0, 0.95, 1.0)
  static readonly SCIMITAR = new Weapon('Scimitar', 1.5, 85, 'sword', ['cutting'], 0.9, 0.0, 8.0)
  static readonly LIGHT_SWORD = new Weapon('Light Sword', 2.0, 75, 'sword', ['cutting', 'piercing'], 0.7, 0.6, 6.0)
  static readonly SHORT_BOW = new Weapon('Short Bow', 1.0, 120, 'bow', ['piercing'], 0.0, 0.8, 1.0)
  static readonly CROSSBOW = new Weapon('Crossbow', 2.5, 80, 'crossbow', ['piercing'], 0.0, 0.9, 1.0)

  // Medium Weapons (3-6 kg) - Balanced
  static readonly LONG_SWORD = new Weapon('Long Sword', 3.0, 100, 'sword', ['cutting', 'piercing'], 0.8, 0.7, 8.0)
  static readonly BROADSWORD = new Weapon('Broadsword', 3.5, 95, 'sword', ['cutting'], 0.9, 0.0, 12.0)
  static readonly BATTLE_AXE = new Weapon('Battle Axe', 4.0, 80, 'axe', ['cutting'], 0.8, 0.0, 15.0)
  static readonly WAR_HAMMER = new Weapon('War Hammer', 4.5, 90, 'hammer', ['blunt'], 0.0, 0.0, 8.0)
  static readonly SPEAR = new Weapon('Spear', 2.5, 200, 'spear', ['piercing'], 0.0, 0.8, 2.0)
  static readonly HALBERD = new Weapon('Halberd', 5.0, 180, 'polearm', ['cutting', 'piercing'], 0.7, 0.6, 10.0)
  static readonly LONGBOW = new Weapon('Longbow', 1.5, 180, 'bow', ['piercing'], 0.0, 0.9, 1.0)

  // Heavy Weapons (6-10 kg) - Powerful
  static readonly GREAT_SWORD = new Weapon('Great Sword', 6.0, 120, 'sword', ['cutting'], 0.9, 0.0, 15.0)
  static readonly CLAYMORE = new Weapon('Claymore', 7.0, 125, 'sword', ['cutting'], 0.9, 0.0, 18.0)
  static readonly EXECUTIONER_AXE = new Weapon('Executioner Axe', 8.0, 100, 'axe', ['cutting'], 0.8, 0.0, 20.0)
  static readonly MAUL = new Weapon('Maul', 9.0, 110, 'hammer', ['blunt'], 0.0, 0.0, 12.0)
  static readonly POLEAXE = new Weapon('Poleaxe', 6.5, 200, 'polearm', ['cutting', 'piercing', 'blunt'], 0.6, 0.5, 10.0)
  static readonly HEAVY_CROSSBOW = new Weapon('Heavy Crossbow', 8.0, 100, 'crossbow', ['piercing'], 0.0, 0.95, 1.0)

  // Massive Weapons (10+ kg) - Devastating
  static readonly ZWEIHANDER = new Weapon('Zweihander', 12.0, 150, 'sword', ['cutting'], 0.9, 0.0, 25.0)
  static readonly GIANT_AXE = new Weapon('Giant Axe', 15.0, 120, 'axe', ['cutting'], 0.8, 0.0, 30.0)
  static readonly SIEGE_HAMMER = new Weapon('Siege Hammer', 18.0, 140, 'hammer', ['blunt'], 0.0, 0.0, 20.0)

  // Get all weapons by category
  static getLightWeapons(): Weapon[] {
    return [
      this.DAGGER,
      this.SHORT_SWORD,
      this.RAPIER,
      this.SCIMITAR,
      this.LIGHT_SWORD,
      this.SHORT_BOW,
      this.CROSSBOW
    ]
  }

  static getMediumWeapons(): Weapon[] {
    return [
      this.LONG_SWORD,
      this.BROADSWORD,
      this.BATTLE_AXE,
      this.WAR_HAMMER,
      this.SPEAR,
      this.HALBERD,
      this.LONGBOW
    ]
  }

  static getHeavyWeapons(): Weapon[] {
    return [
      this.GREAT_SWORD,
      this.CLAYMORE,
      this.EXECUTIONER_AXE,
      this.MAUL,
      this.POLEAXE,
      this.HEAVY_CROSSBOW
    ]
  }

  static getMassiveWeapons(): Weapon[] {
    return [
      this.ZWEIHANDER,
      this.GIANT_AXE,
      this.SIEGE_HAMMER
    ]
  }

  static getAllWeapons(): Weapon[] {
    return [
      ...this.getLightWeapons(),
      ...this.getMediumWeapons(),
      ...this.getHeavyWeapons(),
      ...this.getMassiveWeapons()
    ]
  }

  // Find weapon by name
  static findByName(name: string): Weapon | undefined {
    return this.getAllWeapons().find(weapon => 
      weapon.name.toLowerCase() === name.toLowerCase()
    )
  }

  // Get weapons by damage type
  static getWeaponsByDamageType(damageType: DamageType): Weapon[] {
    return this.getAllWeapons().filter(weapon => 
      weapon.canPerformDamageType(damageType)
    )
  }

  // Get weapons by weapon type
  static getWeaponsByType(weaponType: string): Weapon[] {
    return this.getAllWeapons().filter(weapon => 
      weapon.weaponType === weaponType
    )
  }

  // Get weapons that a specific unit can wield
  static getWieldableWeapons(unit: Unit): Weapon[] {
    return this.getAllWeapons().filter(weapon => unit.combat.canWieldWeapon(weapon))
  }
} 