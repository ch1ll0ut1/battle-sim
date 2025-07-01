import { WebSocketServer, WebSocket } from 'ws';
import { Battle } from './battle/battle.js';
import { Unit } from './units/unit.js';

type BattleState = {
  time: number;
  units: Array<{
    id: number;
    name: string;
    position: { x: number; y: number };
    direction: number;
    experience: number;
    armorLevel: number;
    weapon: string | null;
    isAlive: boolean;
  }>;
  isActive: boolean;
};

type BattleLogEntry = {
  time: number;
  message: string;
};

export class BattleWebSocketServer {
  private wss: WebSocketServer;
  private battle: Battle;
  private clients: WebSocket[] = [];
  private battleLog: BattleLogEntry[] = [];

  constructor(port: number, battle: Battle) {
    this.battle = battle;
    this.wss = new WebSocketServer({ port });
    
    this.wss.on('connection', (ws) => {
      this.clients.push(ws);
      
      // Send initial state
      ws.send(JSON.stringify({
        type: 'battleState',
        data: this.getBattleState()
      }));
      
      ws.send(JSON.stringify({
        type: 'battleLog',
        data: this.battleLog
      }));

      ws.on('close', () => {
        this.clients = this.clients.filter(client => client !== ws);
      });
    });
  }

  private getBattleState(): BattleState {
    return {
      time: this.battle.time,
      units: this.battle.units.map(unit => ({
        id: unit.id,
        name: unit.name,
        position: { x: unit.position.x, y: unit.position.y },
        direction: unit.direction,
        experience: unit.body.experience,
        armorLevel: this.getArmorLevel(unit),
        weapon: this.getWeaponName(unit),
        isAlive: unit.body.isAlive()
      })),
      isActive: this.battle.isActive
    };
  }

  private getArmorLevel(unit: Unit): number {
    // Simple armor level calculation based on armor weight
    const armorWeight = unit.body.armor.getTotalWeight();
    if (armorWeight > 15) return 3;
    if (armorWeight > 8) return 2;
    if (armorWeight > 3) return 1;
    return 0;
  }

  private getWeaponName(unit: Unit): string | null {
    // Get weapon name from combat system
    const weapon = unit.combat.getWeapon();
    return weapon ? weapon.name : null;
  }

  addLogEntry(message: string) {
    const entry: BattleLogEntry = {
      time: this.battle.time,
      message
    };
    this.battleLog.push(entry);
    
    // Keep only last 100 entries
    if (this.battleLog.length > 100) {
      this.battleLog = this.battleLog.slice(-100);
    }

    this.broadcast({
      type: 'battleLog',
      data: [entry]
    });
  }

  broadcastBattleState() {
    this.broadcast({
      type: 'battleState',
      data: this.getBattleState()
    });
  }

  private broadcast(message: any) {
    const messageStr = JSON.stringify(message);
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  close() {
    this.wss.close();
  }
} 