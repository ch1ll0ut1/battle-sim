import { For, createEffect, onMount } from 'solid-js';

type BattleLogProps = {
  entries: string[];
};

export const BattleLog = (props: BattleLogProps) => {
  let logContainerRef: HTMLDivElement | undefined;

  /**
   * Scrolls the log container to the bottom
   */
  const scrollToBottom = () => {
    if (logContainerRef) {
      logContainerRef.scrollTop = logContainerRef.scrollHeight;
    }
  };

  /**
   * Auto-scroll to bottom when entries change
   */
  createEffect(() => {
    // Access entries to create a dependency
    const entries = props.entries;
    // Scroll to bottom after the DOM updates
    setTimeout(scrollToBottom, 0);
  });

  /**
   * Scroll to bottom on initial mount
   */
  onMount(() => {
    scrollToBottom();
  });

  return (
    <div class="battle-log">
      <h3>Battle Log</h3>
      <div class="log-container" ref={logContainerRef}>
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