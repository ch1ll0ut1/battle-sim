import { Position } from './position.js'

describe('Position', () => {
  it('distanceTo returns correct distance', () => {
    const a = new Position(0, 0);
    const b = new Position(3, 4);
    expect(a.distanceTo(b)).toBeCloseTo(5);
  });

  it('directionTo returns correct angle', () => {
    const a = new Position(0, 0);
    const b = new Position(0, 1);
    expect(a.directionTo(b)).toBeCloseTo(Math.PI / 2);
  });

  it('moveTowards moves correctly', () => {
    const a = new Position(0, 0);
    const b = new Position(1, 0);
    const moved = a.moveTowards(b, 2);
    expect(moved.x).toBeCloseTo(2);
    expect(moved.y).toBeCloseTo(0);
  });
}); 