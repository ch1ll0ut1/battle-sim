import { Action, ActionTarget, ActionTiming, ActionType } from './action';
import { BodyPartType, VALID_ACTIONS } from './body-part';

export class ParallelActionManager {
  private activeActions: Map<BodyPartType, Action>;
  private defaultTimings: Record<ActionType, ActionTiming>;

  constructor() {
    this.activeActions = new Map();

    // Default timings for different action types
    this.defaultTimings = {
      attack: {
        executionTime: 0.3,    // 300ms to execute attack
        recoveryTime: 0.4      // 400ms recovery
      },
      block: {
        executionTime: 0.2,    // 200ms to get block up
        recoveryTime: 0.1      // 100ms recovery
      },
      grab: {
        executionTime: 0.4,    // 400ms to grab
        recoveryTime: 0.3      // 300ms recovery
      },
      move: {
        executionTime: 0.1,    // 100ms per movement tick
        recoveryTime: 0        // No recovery for movement
      },
      rotate: {
        executionTime: 0.2,    // 200ms to rotate
        recoveryTime: 0        // No recovery for rotation
      }
    };
  }

  /**
   * Start a new action for a body part if possible
   * Returns true if action was started, false if body part is busy or incapable
   */
  startAction(
    type: ActionType,
    bodyPart: BodyPartType,
    target: ActionTarget = {},
    customTiming?: ActionTiming,
    battleTime: number = 0
  ): boolean {
    // Check if body part can perform this action
    if (!VALID_ACTIONS[bodyPart].includes(type)) {
      return false;
    }

    // Check if body part is available
    const currentAction = this.activeActions.get(bodyPart);
    if (currentAction && !currentAction.canBeInterrupted()) {
      return false;
    }

    // Create and start new action
    const timing = customTiming || this.defaultTimings[type];
    const action = new Action(type, bodyPart, timing, target, battleTime);
    this.activeActions.set(bodyPart, action);

    return true;
  }

  /**
   * Update all active actions
   * Returns map of completed actions this tick
   */
  update(deltaTime: number): Map<BodyPartType, Action> {
    const completedActions = new Map<BodyPartType, Action>();

    // Update each action and collect completed ones
    for (const [bodyPart, action] of this.activeActions) {
      const isComplete = action.update(deltaTime);

      if (isComplete) {
        completedActions.set(bodyPart, action);
        this.activeActions.delete(bodyPart);
      }
    }

    return completedActions;
  }

  /**
   * Get all currently active actions
   */
  getActiveActions(): Map<BodyPartType, Action> {
    return new Map(this.activeActions);
  }

  /**
   * Check if a specific body part is currently performing an action
   */
  isBodyPartBusy(bodyPart: BodyPartType): boolean {
    return this.activeActions.has(bodyPart);
  }

  /**
   * Force stop an action for a body part
   */
  stopAction(bodyPart: BodyPartType): void {
    this.activeActions.delete(bodyPart);
  }
} 