import { ActionType } from './action';

export enum BodyPartType {
  HEAD = 'head',
  LEFT_ARM = 'leftArm',
  RIGHT_ARM = 'rightArm',
  TORSO = 'torso',
  LEFT_LEG = 'leftLeg',
  RIGHT_LEG = 'rightLeg'
}

// Define which actions each body part can perform
export const VALID_ACTIONS: Record<BodyPartType, ActionType[]> = {
  [BodyPartType.HEAD]: ['attack', 'rotate'],  // Headbutt, looking/aiming
  [BodyPartType.LEFT_ARM]: ['attack', 'block', 'grab'],
  [BodyPartType.RIGHT_ARM]: ['attack', 'block', 'grab'],
  [BodyPartType.TORSO]: [],  // Torso is passive, affected by other body parts
  [BodyPartType.LEFT_LEG]: ['attack', 'move'],  // Kick, movement
  [BodyPartType.RIGHT_LEG]: ['attack', 'move']  // Kick, movement
}; 