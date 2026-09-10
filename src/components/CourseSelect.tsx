import { useEffect, useId, useRef, useState } from 'react';
import { COURSE_OPTIONS, getCourseOption } from '../data/courses';

interface Props {
  value: string;
  onChange: (id: string) => void;
  disabled: boolean;
}

export function CourseSelect({ value, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const menuId = useId();

  const selectedIndex = Math.max(
    0,
    COURSE_OPTIONS.findIndex((c) => c.id === value),
  );
  const selected = getCourseOption(value);

  const close = (refocus: boolean) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };

  const choose = (i: number) => {
    onChange(COURSE_OPTIONS[i].id);
    close(true);
  };

  useEffect(() => {
    if (open) optionRefs.current[cursor]?.focus();
  }, [open, cursor]);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open]);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  return (
    <div className={`course-select ${open ? 'is-open' : ''}`} ref={rootRef}>
      <button
        type="button"
        className="course-trigger"
        ref={triggerRef}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => {
          setCursor(selectedIndex);
          setOpen((o) => !o);
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            setCursor(selectedIndex);
            setOpen(true);
          }
        }}
      >
        <span className="course-glyph" aria-hidden="true">
          {selected.glyph}
        </span>
        <span className="course-label">{selected.label}</span>
        <span className="course-caret" aria-hidden="true" />
      </button>
      {open && (
        <div
          id={menuId}
          className="course-menu"
          role="listbox"
          aria-label="Course"
          onKeyDown={(e) => {
            switch (e.key) {
              case 'ArrowDown':
                e.preventDefault();
                setCursor((c) => (c + 1) % COURSE_OPTIONS.length);
                break;
              case 'ArrowUp':
                e.preventDefault();
                setCursor((c) => (c - 1 + COURSE_OPTIONS.length) % COURSE_OPTIONS.length);
                break;
              case 'Home':
                e.preventDefault();
                setCursor(0);
                break;
              case 'End':
                e.preventDefault();
                setCursor(COURSE_OPTIONS.length - 1);
                break;
              case 'Enter':
              case ' ':
                e.preventDefault();
                choose(cursor);
                break;
              case 'Escape':
                e.preventDefault();
                close(true);
                break;
              case 'Tab':
                close(false);
                break;
            }
          }}
        >
          {COURSE_OPTIONS.map((course, i) => {
            const active = course.id === value;
            return (
              <div
                key={course.id}
                role="option"
                aria-selected={active}
                tabIndex={i === cursor ? 0 : -1}
                ref={(el) => {
                  optionRefs.current[i] = el;
                }}
                className={`course-option ${active ? 'is-active' : ''}`}
                onClick={() => choose(i)}
              >
                <span className="course-glyph" aria-hidden="true">
                  {course.glyph}
                </span>
                <span className="course-label">{course.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
