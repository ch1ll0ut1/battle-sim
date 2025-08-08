import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Map } from '../../../game/Map/Map';
import { Unit } from '../../../game/Unit/Unit';
import { RandomMovementAI } from './RandomMovementAI';

describe('RandomMovementAI', () => {
    let map: Map;
    let ai: RandomMovementAI;

    beforeEach(() => {
        map = new Map(1000, 800);
        ai = new RandomMovementAI(map);
    });

    describe('constructor', () => {
        it('should create AI with default distances', () => {
            expect(ai).toBeDefined();
        });

        it('should create AI with custom distances', () => {
            const customAI = new RandomMovementAI(map, 100, 500);
            expect(customAI).toBeDefined();
        });
    });

    describe('updateUnits', () => {
        let mockUnit: Unit;

        beforeEach(() => {
            mockUnit = {
                movement: {
                    isMoving: false,
                    position: { x: 500, y: 400 },
                    moveTo: vi.fn(),
                },
            } as any;
        });

        it('should issue move orders to stationary units', () => {
            const units = [mockUnit];

            ai.updateUnits(units);

            expect(mockUnit.movement.moveTo).toHaveBeenCalledTimes(1);
            expect(mockUnit.movement.moveTo).toHaveBeenCalledWith(
                expect.objectContaining({
                    x: expect.any(Number),
                    y: expect.any(Number),
                }),
            );
        });

        it('should not issue move orders to moving units', () => {
            // @ts-expect-error - mockUnit is a mock object
            mockUnit.movement.isMoving = true;
            const units = [mockUnit];

            ai.updateUnits(units);

            expect(mockUnit.movement.moveTo).not.toHaveBeenCalled();
        });

        it('should handle multiple units', () => {
            const mockUnit2 = {
                movement: {
                    isMoving: false,
                    position: { x: 200, y: 300 },
                    moveTo: vi.fn(),
                },
            } as any;

            const units = [mockUnit, mockUnit2];

            ai.updateUnits(units);

            expect(mockUnit.movement.moveTo).toHaveBeenCalledTimes(1);
            expect(mockUnit2.movement.moveTo).toHaveBeenCalledTimes(1);
        });

        it('should generate targets within map bounds', () => {
            const units = [mockUnit];

            ai.updateUnits(units);

            // @ts-expect-error mock is not defined
            const targetCall = mockUnit.movement.moveTo.mock.calls[0][0];
            expect(targetCall.x).toBeGreaterThanOrEqual(0);
            expect(targetCall.x).toBeLessThanOrEqual(map.width);
            expect(targetCall.y).toBeGreaterThanOrEqual(0);
            expect(targetCall.y).toBeLessThanOrEqual(map.height);
        });

        it('should generate targets within configured distance range', () => {
            const customAI = new RandomMovementAI(map, 100, 200);
            const centerUnit = {
                movement: {
                    isMoving: false,
                    position: { x: 500, y: 400 },
                    moveTo: vi.fn(),
                },
            } as any;

            // Test multiple times to check distance consistency
            for (let i = 0; i < 10; i++) {
                customAI.updateUnits([centerUnit]);

                const targetCall = centerUnit.movement.moveTo.mock.calls[i][0];
                const distance = Math.sqrt(
                    Math.pow(targetCall.x - 500, 2)
                    + Math.pow(targetCall.y - 400, 2),
                );

                expect(distance).toBeGreaterThanOrEqual(100);
                expect(distance).toBeLessThanOrEqual(200);
            }
        });

        it('should clamp targets to map bounds when unit is near edge', () => {
            // Unit near edge of map
            const edgeUnit = {
                movement: {
                    isMoving: false,
                    position: { x: 50, y: 50 },
                    moveTo: vi.fn(),
                },
            } as any;

            const units = [edgeUnit];

            ai.updateUnits(units);

            const targetCall = edgeUnit.movement.moveTo.mock.calls[0][0];
            expect(targetCall.x).toBeGreaterThanOrEqual(0);
            expect(targetCall.x).toBeLessThanOrEqual(map.width);
            expect(targetCall.y).toBeGreaterThanOrEqual(0);
            expect(targetCall.y).toBeLessThanOrEqual(map.height);
        });
    });
});
