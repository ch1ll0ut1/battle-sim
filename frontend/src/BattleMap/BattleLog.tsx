import { For } from 'solid-js';

type BattleLogProps = {
  entries: string[];
};

export const BattleLog = (props: BattleLogProps) => {
  return (
    <div class="battle-log">
      <h3>Battle Log</h3>
      <div class="log-container">
        <For each={props.entries}>
          {(entry) => (
            <div class="log-entry">
              <span class="log-time">123s</span>
              <span class="log-message">{entry}</span>
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