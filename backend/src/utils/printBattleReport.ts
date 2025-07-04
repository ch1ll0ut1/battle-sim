import { BattleEvent } from "./Logger";

export function printBattleReport(events: BattleEvent[], duration: number, winner?: string) {
    displaySummary(events, duration, winner);
    displayEvents(events);
}

/**
 * Displays all events in chronological order
 */
function displayEvents(events: BattleEvent[]): void {
    console.log('\n=== Battle Events ===');
    events.forEach(event => {
        console.log(event.message);
    });
}

/**
 * Displays a summary of the battle
 * @param duration - Total battle duration in seconds
 * @param winner - Name of the winning unit/team (if any)
 */
function displaySummary(events: BattleEvent[], duration: number, winner?: string): void {
    const stats = calculateStatistics(events);

    console.log('\n=== Battle Summary ===');
    console.log(`Duration: ${duration.toFixed(1)} seconds`);
    console.log(`Winner: ${winner || 'Draw'}`);

    console.log('\nStatistics:');
    console.log(`- Total actions: ${stats.totalEvents}`);
    console.log(`- Attacks: ${stats.attackEvents}`);
    console.log(`- Hits: ${stats.hitEvents}`);
    console.log(`- Hit rate: ${stats.hitRate.toFixed(1)}%`);
}

function calculateStatistics(events: BattleEvent[]) {
    const totalEvents = events.length;
    const attackEvents = events.filter(e => e.message.includes('attacks')).length;
    const hitEvents = events.filter(e => e.message.includes('hits')).length;
    const hitRate = attackEvents > 0 ? (hitEvents / attackEvents) * 100 : 0;

    return { totalEvents, attackEvents, hitEvents, hitRate };
}