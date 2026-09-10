import { useRef } from 'react';
import { MODES, type ModeId } from '../data/modes';

interface Props {
  value: ModeId;
  onChange: (id: ModeId) => void;
  disabled: boolean;
}

export function ModeSwitch({ value, onChange, disabled }: Props) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const index = Math.max(
    0,
    MODES.findIndex((m) => m.id === value),
  );

  const move = (to: number) => {
    const next = (to + MODES.length) % MODES.length;
    onChange(MODES[next].id);
    buttons.current[next]?.focus();
  };

  return (
    <div
      className={`mode-tabs ${disabled ? 'is-disabled' : ''}`}
      role="radiogroup"
      aria-label="Practice mode"
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          move(index + 1);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          move(index - 1);
        }
      }}
    >
      {MODES.map((mode, i) => {
        const active = mode.id === value;
        return (
          <button
            key={mode.id}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            disabled={disabled}
            ref={(el) => {
              buttons.current[i] = el;
            }}
            className={`mode-tab ${active ? 'is-active' : ''}`}
            onClick={() => onChange(mode.id)}
          >
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}
