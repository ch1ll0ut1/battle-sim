import { Action, ActionType, ActionTiming } from './action.js';
import { BodyPartType } from './body-part.js';

describe('Action', () => {
  let action: Action;
  const defaultTiming: ActionTiming = {
    executionTime: 0.5,  // 500ms execution
    recoveryTime: 0.3    // 300ms recovery
  };

  beforeEach(() => {
    action = new Action('attack', BodyPartType.RIGHT_ARM, defaultTiming);
  });

  test('should initialize with correct state', () => {
    expect(action.state.type).toBe('attack');
    expect(action.state.bodyPart).toBe(BodyPartType.RIGHT_ARM);
    expect(action.state.progress).toBe(0);
    expect(action.state.recoveryProgress).toBe(0);
    expect(action.state.isExecuting).toBe(true);
    expect(action.state.isRecovering).toBe(false);
  });

  test('should progress through execution phase', () => {
    // Update halfway through execution
    action.update(0.25); // 250ms
    expect(action.state.progress).toBe(0.5);
    expect(action.state.isExecuting).toBe(true);
    expect(action.state.isRecovering).toBe(false);
    
    // Complete execution
    action.update(0.25); // Another 250ms
    expect(action.state.progress).toBe(1);
    expect(action.state.isExecuting).toBe(false);
    expect(action.state.isRecovering).toBe(true);
  });

  test('should progress through recovery phase', () => {
    // Get through execution first
    action.update(0.5);
    expect(action.state.isRecovering).toBe(true);
    
    // Update halfway through recovery
    action.update(0.15); // 150ms
    expect(action.state.recoveryProgress).toBe(0.5);
    expect(action.state.isRecovering).toBe(true);
    
    // Complete recovery
    const isComplete = action.update(0.15); // Another 150ms
    expect(action.state.recoveryProgress).toBe(1);
    expect(action.state.isRecovering).toBe(false);
    expect(isComplete).toBe(true);
  });

  test('should be interruptible during execution but not recovery', () => {
    expect(action.canBeInterrupted()).toBe(true);
    
    // Get through execution
    action.update(0.5);
    expect(action.state.isRecovering).toBe(true);
    expect(action.canBeInterrupted()).toBe(false);
  });

  test('should handle variable deltaTime correctly', () => {
    // Small updates
    for (let i = 0; i < 5; i++) {
      action.update(0.1);
    }
    expect(action.state.isRecovering).toBe(true);
    
    // Large update
    const isComplete = action.update(0.5);
    expect(isComplete).toBe(true);
  });
}); 