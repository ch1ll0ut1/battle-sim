import { Position } from '../../common/position';
import { ActionTarget } from './action';
import { BodyPartType } from './body-part';
import { ParallelActionManager } from './parallel-action-manager';

describe('ParallelActionManager', () => {
  let manager: ParallelActionManager;

  beforeEach(() => {
    manager = new ParallelActionManager();
  });

  test('should allow simultaneous actions for different body parts', () => {
    // Start moving (legs)
    const moveTarget: ActionTarget = { position: new Position(10, 10) };
    const startedMove = manager.startAction('move', BodyPartType.LEFT_LEG, moveTarget);
    expect(startedMove).toBe(true);

    // Start attack with right arm while moving
    const attackTarget: ActionTarget = { unit: { id: 1 } };
    const startedAttack = manager.startAction('attack', BodyPartType.RIGHT_ARM, attackTarget);
    expect(startedAttack).toBe(true);

    // Verify both actions are active
    const activeActions = manager.getActiveActions();
    expect(activeActions.size).toBe(2);
    expect(activeActions.has(BodyPartType.LEFT_LEG)).toBe(true);
    expect(activeActions.has(BodyPartType.RIGHT_ARM)).toBe(true);
  });

  test('should prevent invalid actions for body parts', () => {
    // Try to block with leg (not allowed)
    const startedBlock = manager.startAction('block', BodyPartType.LEFT_LEG);
    expect(startedBlock).toBe(false);

    // Try to move with head (not allowed)
    const startedMove = manager.startAction('move', BodyPartType.HEAD);
    expect(startedMove).toBe(false);
  });

  test('should handle action completion correctly', () => {
    // Start attack with right arm
    manager.startAction('attack', BodyPartType.RIGHT_ARM);

    // Update until attack execution is complete
    let completedActions = manager.update(0.3); // 300ms - execution time
    expect(completedActions.size).toBe(0); // Not complete yet (in recovery)

    // Update until recovery is complete
    completedActions = manager.update(0.4); // 400ms - recovery time
    expect(completedActions.size).toBe(1);
    expect(completedActions.has(BodyPartType.RIGHT_ARM)).toBe(true);
  });

  test('should allow interrupting actions during execution but not recovery', () => {
    // Start attack
    manager.startAction('attack', BodyPartType.RIGHT_ARM);

    // Try to start new action during execution phase (at 0.15s - halfway through execution)
    manager.update(0.15);
    const interruptedDuringExecution = manager.startAction('block', BodyPartType.RIGHT_ARM);
    expect(interruptedDuringExecution).toBe(true);

    // Create new attack and move to recovery phase
    manager.startAction('attack', BodyPartType.RIGHT_ARM);
    manager.update(0.3); // Complete execution

    // Try to start new action during recovery phase
    const interruptedDuringRecovery = manager.startAction('block', BodyPartType.RIGHT_ARM);
    expect(interruptedDuringRecovery).toBe(false);
  });

  test('should handle actions with different completion times', () => {
    // Start attack (temporary action)
    manager.startAction('attack', BodyPartType.RIGHT_ARM);

    // Update through execution phase
    let completed = manager.update(0.3); // 300ms - attack execution time
    expect(completed.size).toBe(0); // Attack in recovery

    // Update through recovery phase
    completed = manager.update(0.4); // 400ms - attack recovery time
    expect(completed.size).toBe(1); // Attack completed
    expect(completed.has(BodyPartType.RIGHT_ARM)).toBe(true);
  });

  test('should complete move actions quickly', () => {
    // Start move action (completes after execution with no recovery)
    manager.startAction('move', BodyPartType.LEFT_LEG);

    // Update through execution
    let completed = manager.update(0.1); // 100ms - move execution time
    expect(completed.size).toBe(0); // Still needs to go through recovery phase

    // Update through recovery (even though recovery time is 0)
    completed = manager.update(0.01); // Small update to trigger recovery completion
    expect(completed.size).toBe(1);
    expect(completed.has(BodyPartType.LEFT_LEG)).toBe(true);
  });

  test('should allow force stopping actions', () => {
    // Start multiple actions
    manager.startAction('move', BodyPartType.LEFT_LEG);
    manager.startAction('attack', BodyPartType.RIGHT_ARM);

    // Force stop one action
    manager.stopAction(BodyPartType.RIGHT_ARM);

    // Verify only move remains
    const activeActions = manager.getActiveActions();
    expect(activeActions.size).toBe(1);
    expect(activeActions.has(BodyPartType.LEFT_LEG)).toBe(true);
  });
}); 