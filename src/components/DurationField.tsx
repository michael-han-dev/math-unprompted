import { useId } from 'react';
import { formatDuration } from '../lib/format';

interface Props {
  label: string;
  minutes: number;
  min: number;
  max: number;
  onChangeMinutes: (minutes: number) => void;
}

export function DurationField({ label, minutes, min, max, onChangeMinutes }: Props) {
  const id = useId();
  return (
    <div className="duration-field">
      <div className="duration-head">
        <label className="duration-label" htmlFor={id}>
          {label}
        </label>
        <span className="duration-value" aria-live="polite">
          {formatDuration(minutes * 60)}
        </span>
      </div>
      <input
        id={id}
        className="duration-slider"
        type="range"
        min={min}
        max={max}
        step={1}
        value={minutes}
        onChange={(e) => onChangeMinutes(Number(e.target.value))}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={minutes}
        aria-valuetext={formatDuration(minutes * 60)}
      />
      <div className="duration-ends" aria-hidden="true">
        <span>{min} min</span>
        <span>{max} min</span>
      </div>
    </div>
  );
}
