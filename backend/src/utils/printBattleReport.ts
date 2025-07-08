export function printBattleReport(events: string[], duration: number, winner?: string) {
    displayEvents(events);
    displaySummary(events, duration, winner);
}

/**
 * Displays all events in chronological order
 */
function displayEvents(events: string[]): void {
    console.log('\n=== Battle Events ===');
    events.forEach(event => {
        console.log(event);
    });
}

/**
 * Displays a summary of the battle
 * @param duration - Total battle duration in seconds
 * @param winner - Name of the winning unit/team (if any)
 */
function displaySummary(events: string[], duration: number, winner?: string): void {
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

function calculateStatistics(events: string[]) {
    const totalEvents = events.length;
    const attackEvents = events.filter(e => e.includes('attacks')).length;
    const hitEvents = events.filter(e => e.includes('hits')).length;
    const hitRate = attackEvents > 0 ? (hitEvents / attackEvents) * 100 : 0;

    return { totalEvents, attackEvents, hitEvents, hitRate };
}