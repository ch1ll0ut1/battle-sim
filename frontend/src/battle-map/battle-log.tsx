import { For } from 'solid-js';

type BattleLogEntry = {
  time: number;
  message: string;
};

type BattleLogProps = {
  entries: BattleLogEntry[];
};

export const BattleLog = (props: BattleLogProps) => {
  return (
    <div class="battle-log">
      <h3>Battle Log</h3>
      <div class="log-container">
        <For each={props.entries}>
          {(entry) => (
            <div class="log-entry">
              <span class="log-time">[{entry.time.toFixed(1)}s]</span>
              <span class="log-message">{entry.message}</span>
            </div>
          )}
        </For>
        {props.entries.length === 0 && (
          <div class="no-entries">No battle events yet...</div>
        )}
      </div>
    </div>
  );
}; 