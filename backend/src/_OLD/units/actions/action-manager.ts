import { Action, ActionType, ActionTiming } from './action.js';

export interface ActionDefinition {
  type: ActionType;
  timing: ActionTiming;
  target?: any;
}

export class ActionManager {
  private currentAction: Action | null = null;
  private queuedAction: ActionDefinition | null = null;
  private baseReactionTime: number;

  constructor(baseReactionTime: number = 0.2) {
    this.baseReactionTime = baseReactionTime;
  }

  /**
   * Updates current action and handles transitions
   * Returns true if action state changed
   */
  update(deltaTime: number): boolean {
    let stateChanged = false;

    if (this.currentAction) {
      const isComplete = this.currentAction.update(deltaTime);
      
      if (isComplete) {
        this.currentAction = null;
        stateChanged = true;

        // Start queued action if exists
        if (this.queuedAction) {
          this.startAction(this.queuedAction);
          this.queuedAction = null;
        }
      }
    }

    return stateChanged;
  }

  /**
   * Attempts to start a new action
   * Returns true if action was started
   */
  startAction(actionDef: ActionDefinition): boolean {
    if (!this.canStartAction()) {
      // Queue action if we can't start it now
      this.queuedAction = actionDef;
      return false;
    }

    this.currentAction = new Action(
      actionDef.type,
      actionDef.timing,
      actionDef.target
    );
    return true;
  }

  /**
   * Attempts to interrupt current action
   * Returns true if action was interrupted
   */
  interruptAction(): boolean {
    if (this.currentAction?.canBeInterrupted()) {
      this.currentAction = null;
      this.queuedAction = null;
      return true;
    }
    return false;
  }

  /**
   * Returns true if a new action can be started
   */
  canStartAction(): boolean {
    return !this.currentAction || this.currentAction.isComplete();
  }

  /**
   * Returns true if unit is currently executing or recovering from an action
   */
  isActing(): boolean {
    return this.currentAction !== null;
  }

  /**
   * Gets the current action state if any
   */
  getCurrentAction(): Action | null {
    return this.currentAction;
  }

  /**
   * Gets the actual reaction time based on experience
   */
  getReactionTime(experience: number): number {
    // Experience (0-1) reduces reaction time by up to 75%
    return this.baseReactionTime * (1 - (experience * 0.75));
  }
} 