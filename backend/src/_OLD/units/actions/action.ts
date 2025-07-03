import { BodyPartType } from './body-part.js';
import { Position } from '../../common/position.js';

export type ActionType = 'attack' | 'block' | 'grab' | 'move' | 'rotate';

export interface ActionTarget {
  position?: Position;    // Target position for movement/attacks
  unit?: any;            // Target unit for attacks/grabs
  direction?: number;     // Direction for rotation (radians)
  force?: number;        // Force to apply (0-1)
}

export interface ActionTiming {
  executionTime: number;  // Time it takes to execute the action
  recoveryTime: number;   // Time before this body part can act again
  reactionTime?: number;  // Optional override for unit's base reaction time
}

export interface ActionState {
  type: ActionType;
  bodyPart: BodyPartType;
  target: ActionTarget;
  progress: number;      // 0-1 progress of execution
  recoveryProgress: number; // 0-1 progress of recovery
  timing: ActionTiming;
  startTime: number;     // When the action started (in battle time)
  isExecuting: boolean;  // Whether action is in execution phase
  isRecovering: boolean; // Whether action is in recovery phase
}

export class Action {
  public state: ActionState;

  constructor(
    type: ActionType,
    bodyPart: BodyPartType,
    timing: ActionTiming,
    target: ActionTarget = {},
    battleTime: number = 0
  ) {
    this.state = {
      type,
      bodyPart,
      target,
      timing,
      progress: 0,
      recoveryProgress: 0,
      startTime: battleTime,
      isExecuting: true,
      isRecovering: false
    };
  }

  /**
   * Updates action progress based on elapsed time
   * Returns true if action is complete (including recovery)
   */
  update(deltaTime: number): boolean {
    if (this.state.isExecuting) {
      this.state.progress += deltaTime / this.state.timing.executionTime;
      
      if (this.state.progress >= 1) {
        this.state.isExecuting = false;
        this.state.isRecovering = true;
        this.state.progress = 1;
      }
    } else if (this.state.isRecovering) {
      this.state.recoveryProgress += deltaTime / this.state.timing.recoveryTime;
      
      if (this.state.recoveryProgress >= 1) {
        this.state.isRecovering = false;
        this.state.recoveryProgress = 1;
        return true;
      }
    }
    
    return false;
  }

  /**
   * Returns true if the action can be interrupted at current state
   */
  canBeInterrupted(): boolean {
    // Most actions can be interrupted during execution but not recovery
    return this.state.isExecuting;
  }

  /**
   * Returns true if the action is completely finished
   */
  isComplete(): boolean {
    return !this.state.isExecuting && !this.state.isRecovering;
  }

  /**
   * Returns the current execution progress (0-1)
   */
  getProgress(): number {
    return this.state.progress;
  }

  /**
   * Returns the current recovery progress (0-1)
   */
  getRecoveryProgress(): number {
    return this.state.recoveryProgress;
  }
} 