import { useCallback, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { RESEARCH_RANGE, SPEECH_RANGE, type Settings } from '../lib/storage';
import { DurationField } from './DurationField';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: Settings;
  onChange: (settings: Settings) => void;
  disabled: boolean;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function SettingsDialog({ open, onOpenChange, settings, onChange, disabled }: Props) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const titleId = useId();
  const muteId = useId();

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  // Refocus the trigger after the dialog has actually closed. Doing it inside `close` is too
  // early: the trigger is still inside an inert subtree until React re-renders.
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (wasOpenRef.current && !open) triggerRef.current?.focus();
    wasOpenRef.current = open;
  }, [open]);

  // Escape closes; Tab cycles inside the panel.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const items = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, close]);

  useEffect(() => {
    if (disabled && open) onOpenChange(false);
  }, [disabled, open, onOpenChange]);

  useEffect(() => {
    if (open) panelRef.current?.querySelector<HTMLElement>('input, button')?.focus();
  }, [open]);

  const speechMinutes = Math.round(settings.speechSeconds / 60);
  const researchMinutes = Math.round(settings.researchSeconds / 60);

  return (
    <div className={`settings ${open ? 'is-open' : ''}`}>
      <button
        type="button"
        className="settings-trigger"
        ref={triggerRef}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label="Settings"
        title="Settings"
        onClick={() => (open ? close() : onOpenChange(true))}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="3.2" />
          <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" />
        </svg>
      </button>
      {open &&
        createPortal(
          <div
            className="settings-overlay"
            role="presentation"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) close();
            }}
          >
            <div className="settings-panel" id={panelId} role="dialog" aria-modal="true" aria-labelledby={titleId} ref={panelRef}>
              <header className="settings-panel-head">
                <h2 className="settings-panel-title" id={titleId}>
                  Settings
                </h2>
                <p className="settings-panel-blurb">Timer lengths in whole minutes.</p>
              </header>
              <DurationField
                label="Speech"
                minutes={speechMinutes}
                min={SPEECH_RANGE.minSeconds / 60}
                max={SPEECH_RANGE.maxSeconds / 60}
                onChangeMinutes={(m) => onChange({ ...settings, speechSeconds: m * 60 })}
              />
              <DurationField
                label="Research"
                minutes={researchMinutes}
                min={RESEARCH_RANGE.minSeconds / 60}
                max={RESEARCH_RANGE.maxSeconds / 60}
                onChangeMinutes={(m) => onChange({ ...settings, researchSeconds: m * 60 })}
              />
              <div className="settings-mute">
                <input
                  id={muteId}
                  type="checkbox"
                  checked={settings.muted}
                  onChange={(e) => onChange({ ...settings, muted: e.target.checked })}
                />
                <label htmlFor={muteId}>Mute sound effects</label>
              </div>
              <p className="settings-note">Saved for next time.</p>
              <button type="button" className="btn primary settings-done" onClick={close}>
                Done
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
