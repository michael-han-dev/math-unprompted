import { useEffect, useRef } from 'react';
import type { TopicKind } from '../data/courses';

const NUMERALS = ['i', 'ii', 'iii'];
const ARCS: Record<TopicKind, readonly [string, string, string]> = {
  Definition: ['Define it', 'Example', 'Why it matters'],
  Theorem: ['State it', 'Proof idea', 'Why it matters'],
};
import { arcStagesHit, ringProgress } from '../lib/arc';
import { formatClock, formatDuration } from '../lib/format';

export type Phase = 'idle' | 'research' | 'ready' | 'speech' | 'done';

interface Props {
  phase: Exclude<Phase, 'idle'>;
  topic: string;
  kind: TopicKind;
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
  kind,
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
  const stagesHit = arcStagesHit(seconds, totalSeconds, phase === 'done');

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
        {isSpeaking && (
          <ol className="speech-stages" aria-label="Speech arc">
            {ARCS[kind].map((stage, i) => (
              <li key={stage} className={`speech-stage ${i < stagesHit ? 'is-hit' : 'is-pending'}`}>
                <span className="speech-stage-num">{NUMERALS[i]}.</span>
                <span className="speech-stage-label">{stage}</span>
              </li>
            ))}
          </ol>
        )}
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
