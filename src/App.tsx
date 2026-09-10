import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CourseSelect } from './components/CourseSelect';
import { Reel } from './components/Reel';
import { SettingsDialog } from './components/SettingsDialog';
import { SpiralField } from './components/SpiralField';
import { TimerOverlay, type Phase } from './components/TimerOverlay';
import { ALL_COURSES_ID, getPool, kindOf } from './data/courses';
import { formatDuration } from './lib/format';
import { useReducedMotion } from './lib/motion';
import { playDone, playLand, playTick, setMuted, unlockAudio } from './lib/sounds';
import {
  SPIN_DURATION_MS,
  SPIN_DURATION_REDUCED_MS,
  SPIN_SAFETY_MARGIN_MS,
  indexAtStep,
  pickRandom,
  planSpin,
  pushRecent,
  stepAt,
} from './lib/spin';
import { getLocalStorage, loadSettings, saveSettings, type Settings } from './lib/storage';
import { useCountdown } from './lib/timer';

export const SITE_NAME = 'Chalk Talk';

export function App() {
  const [courseId, setCourseId] = useState<string>(ALL_COURSES_ID);
  const [settings, setSettings] = useState<Settings>(() => loadSettings(getLocalStorage()));
  const [settingsOpen, setSettingsOpen] = useState(false);

  const pool = useMemo(() => getPool(courseId), [courseId]);

  const [display, setDisplay] = useState(() => pickRandom(pool));
  const [landed, setLanded] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [tickKey, setTickKey] = useState(0);
  const [spinCount, setSpinCount] = useState(0);

  const indexRef = useRef(Math.max(0, pool.indexOf(display)));
  const recentRef = useRef<string[]>([]);
  const rafRef = useRef<number | null>(null);
  const safetyRef = useRef<number | null>(null);
  /** Element to refocus when the timer overlay closes. Captured before the overlay steals focus. */
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();
  const { seconds, start: startCountdown, stop: stopCountdown, set: setCountdown } = useCountdown(settings.speechSeconds);

  const inOverlay = phase !== 'idle';
  const locked = spinning || inOverlay;
  const backgroundInert = inOverlay || settingsOpen;

  useEffect(() => {
    saveSettings(getLocalStorage(), settings);
    setMuted(settings.muted);
  }, [settings]);

  const cancelSpin = useCallback(() => {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (safetyRef.current !== null) {
      window.clearTimeout(safetyRef.current);
      safetyRef.current = null;
    }
  }, []);

  useEffect(() => cancelSpin, [cancelSpin]);

  const redraw = useCallback((nextPool: string[]) => {
    const topic = pickRandom(nextPool);
    indexRef.current = Math.max(0, nextPool.indexOf(topic));
    setDisplay(topic);
    setLanded(null);
  }, []);

  const changeCourse = (id: string) => {
    if (locked || id === courseId) return;
    setCourseId(id);
    redraw(getPool(id));
  };

  const spin = useCallback(() => {
    if (locked || pool.length === 0) return;
    unlockAudio();
    cancelSpin();
    setSpinning(true);
    setLanded(null);

    const n = pool.length;
    const startIndex = indexRef.current % n;
    const { totalSteps, landIndex } = planSpin(
      pool,
      startIndex,
      recentRef.current,
      Math.random,
      reduced ? { minLoops: 0, maxLoops: 0 } : {},
    );
    const duration = reduced ? SPIN_DURATION_REDUCED_MS : SPIN_DURATION_MS;
    const startedAt = performance.now();
    let lastStep = -1;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      cancelSpin();
      const topic = pool[landIndex];
      indexRef.current = landIndex;
      recentRef.current = pushRecent(recentRef.current, topic);
      setDisplay(topic);
      setLanded(topic);
      setSpinning(false);
      setSpinCount((c) => c + 1);
      playLand();
    };

    const frame = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const step = stepAt(progress, totalSteps);
      if (step !== lastStep) {
        lastStep = step;
        const index = indexAtStep(startIndex, step, n);
        indexRef.current = index;
        setDisplay(pool[index]);
        setTickKey((k) => k + 1);
        if (!reduced) playTick(1 - progress * 0.6);
      }
      if (progress < 1) {
        rafRef.current = window.requestAnimationFrame(frame);
      } else {
        finish();
      }
    };

    rafRef.current = window.requestAnimationFrame(frame);
    safetyRef.current = window.setTimeout(finish, duration + SPIN_SAFETY_MARGIN_MS);
  }, [locked, pool, reduced, cancelSpin]);

  const startSpeech = useCallback(() => {
    setPhase('speech');
    startCountdown(settings.speechSeconds, () => {
      setPhase('done');
      playDone();
    });
  }, [startCountdown, settings.speechSeconds]);

  const startResearch = () => {
    if (!landed || locked) return;
    unlockAudio();
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    setPhase('research');
    startCountdown(settings.researchSeconds, () => {
      setPhase('ready');
      setCountdown(settings.speechSeconds);
      playDone();
    });
  };

  const finishResearch = () => {
    stopCountdown();
    setPhase('ready');
    setCountdown(settings.speechSeconds);
  };

  const closeOverlay = useCallback(() => {
    stopCountdown();
    setPhase('idle');
  }, [stopCountdown]);

  // Escape closes the timer overlay. On close, restore focus to whatever opened it.
  useEffect(() => {
    if (!inOverlay) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeOverlay();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      returnFocusRef.current?.focus?.();
      returnFocusRef.current = null;
    };
  }, [inOverlay, closeOverlay]);

  const totalSeconds = phase === 'research' ? settings.researchSeconds : settings.speechSeconds;
  const eyebrow = spinning ? 'Drawing…' : landed ? `${kindOf(landed)} ${spinCount}.` : 'Ready';

  return (
    <div className="page">
      <SpiralField />

      <header className="topbar" inert={backgroundInert || undefined}>
        <h1 className="brand-mark">{SITE_NAME}</h1>
        <a className="made-by" href="https://www.instagram.com/bymichaelhan/" target="_blank" rel="noopener noreferrer">
          made by bymichaelhan
        </a>
      </header>

      <main className="stage">
        <div className="stage-body" inert={backgroundInert || undefined}>
          <div className="controls">
            <p className="blurb">Spin a topic, read up on a research timer, then explain it out loud.</p>
            <CourseSelect value={courseId} onChange={changeCourse} disabled={locked} />
          </div>

          <Reel text={display} eyebrow={eyebrow} spinning={spinning} landed={landed !== null} tickKey={tickKey} />
          <p className="sr-only" aria-live="polite">
            {landed ? `Your topic: ${landed}` : ''}
          </p>
        </div>

        <div className="actions">
          <div className="actions-main" inert={backgroundInert || undefined}>
            <button type="button" className="btn primary" onClick={spin} disabled={locked}>
              {spinning ? 'Spinning…' : landed ? 'Spin again' : 'Spin'}
            </button>
            <button type="button" className="btn secondary" onClick={startResearch} disabled={!landed || locked}>
              Start {formatDuration(settings.researchSeconds)} research
            </button>
          </div>
          <SettingsDialog
            open={settingsOpen}
            onOpenChange={setSettingsOpen}
            settings={settings}
            onChange={setSettings}
            disabled={locked}
          />
        </div>
      </main>

      <footer className="credit" inert={backgroundInert || undefined}>
        Inspired by{' '}
        <a href="https://www.unprompted.cool/" target="_blank" rel="noopener noreferrer">
          Unprompted
        </a>
      </footer>

      {inOverlay && landed && (
        <TimerOverlay
          phase={phase}
          topic={landed}
          kind={kindOf(landed)}
          seconds={seconds}
          totalSeconds={totalSeconds}
          speechSeconds={settings.speechSeconds}
          onDoneResearch={finishResearch}
          onStartSpeech={startSpeech}
          onClose={closeOverlay}
        />
      )}
    </div>
  );
}
