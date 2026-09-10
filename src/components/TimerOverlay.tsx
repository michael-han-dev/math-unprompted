import { useEffect, useRef } from 'react';
import { formatClock, formatDuration } from '../lib/format';
import { ringProgress } from '../lib/timer';

export type Phase = 'idle' | 'research' | 'ready' | 'speech' | 'done';

interface Props {
  phase: Exclude<Phase, 'idle'>;
  topic: string;
  seconds: number;
  totalSeconds: number;
  speechSeconds: number;
  onDoneResearch: () => void;
  onStartSpeech: () => void;
  onClose: () => void;
}

export function TimerOverlay({
  phase,
  topic,
  seconds,
  totalSeconds,
  speechSeconds,
  onDoneResearch,
  onStartSpeech,
  onClose,
}: Props) {
  const primaryRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    primaryRef.current?.focus();
  }, [phase]);

  const isResearch = phase === 'research';
  const isReady = phase === 'ready';
  const isSpeaking = phase === 'speech' || phase === 'done';
  const progress = isReady ? 0 : ringProgress(seconds, totalSeconds);

  const label = isResearch ? 'Research timer' : isReady ? 'Ready to speak' : 'Speech timer';
  const status = isResearch ? 'Research.' : isReady ? 'Research done.' : phase === 'done' ? 'Time. ∎' : 'Speak.';

  return (
    <div
      className={`timer-overlay ${phase === 'done' ? 'is-done' : 'is-live'} ${isResearch ? 'is-research' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <div className="timer-overlay-inner">
        <p className="timer-topic">{topic}</p>
        {isResearch && <p className="timer-phase">Researching</p>}
        <div className="timer-ring" style={{ '--p': progress } as React.CSSProperties} role="timer">
          <span className="timer-digits">{formatClock(seconds)}</span>
        </div>
        <p className="timer-status" aria-live="polite">
          {status}
        </p>
        {isReady && <p className="timer-next">Up next: {formatDuration(speechSeconds)} to speak.</p>}
        <div className="timer-actions">
          {isResearch && (
            <button type="button" className="btn primary" onClick={onDoneResearch} ref={primaryRef}>
              Done researching
            </button>
          )}
          {isReady && (
            <button type="button" className="btn primary" onClick={onStartSpeech} ref={primaryRef}>
              I'm ready to speak
            </button>
          )}
          <button type="button" className="btn ghost" onClick={onClose} ref={isSpeaking ? primaryRef : undefined}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
