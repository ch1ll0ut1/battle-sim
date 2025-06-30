type PlaybackControlsProps = {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNextTick: () => void;
  onReset: () => void;
};

export const PlaybackControls = (props: PlaybackControlsProps) => {
  return (
    <div class="playback-controls">
      <button 
        onClick={props.isPlaying ? props.onPause : props.onPlay}
        class="control-btn"
      >
        {props.isPlaying ? '⏸️ Pause' : '▶️ Play'}
      </button>
      <button 
        onClick={props.onNextTick}
        class="control-btn"
        disabled={props.isPlaying}
      >
        ⏭️ Next Tick
      </button>
      <button 
        onClick={props.onReset}
        class="control-btn"
      >
        🔄 Reset
      </button>
    </div>
  );
}; 