import { describe, expect, it } from 'vitest';
import { ALL_COURSES_ID, COURSES, COURSE_OPTIONS, getCourseOption, getPool } from './courses';

const MIN_CONCEPTS = 12;
const MIN_THEOREMS = 8;

describe('courses data', () => {
  it('has unique ids and labels', () => {
    expect(new Set(COURSES.map((c) => c.id)).size).toBe(COURSES.length);
    expect(new Set(COURSES.map((c) => c.label)).size).toBe(COURSES.length);
    expect(COURSES.some((c) => c.id === ALL_COURSES_ID)).toBe(false);
  });

  it.each(COURSES.map((c) => [c.label, c] as const))('%s has enough topics', (_label, course) => {
    expect(course.concepts.length).toBeGreaterThanOrEqual(MIN_CONCEPTS);
    expect(course.theorems.length).toBeGreaterThanOrEqual(MIN_THEOREMS);
  });

  it.each(COURSES.map((c) => [c.label, c] as const))('%s has no blanks or duplicates', (_label, course) => {
    for (const list of [course.concepts, course.theorems]) {
      expect(list.every((t) => t.trim().length > 0)).toBe(true);
      expect(list.every((t) => t === t.trim())).toBe(true);
      expect(new Set(list).size).toBe(list.length);
    }
  });

  it('keeps topic names short enough to fit the reel', () => {
    const long = COURSES.flatMap((c) => [...c.concepts, ...c.theorems]).filter((t) => t.length > 60);
    expect(long).toEqual([]);
  });

  it('pools and dedupes for "All courses"', () => {
    const all = getPool(ALL_COURSES_ID, 'concepts');
    const raw = COURSES.flatMap((c) => c.concepts);
    expect(new Set(all).size).toBe(all.length);
    expect(all.length).toBeLessThanOrEqual(raw.length);
    expect(all.length).toBe(new Set(raw).size);
    expect(getPool(ALL_COURSES_ID, 'theorems').length).toBe(new Set(COURSES.flatMap((c) => c.theorems)).size);
  });

  it('returns a course pool by id and falls back sensibly', () => {
    expect(getPool('real-analysis', 'theorems')).toBe(COURSES[0].theorems);
    expect(getPool('nope', 'concepts')).toBe(COURSES[0].concepts);
    expect(COURSE_OPTIONS[0].id).toBe(ALL_COURSES_ID);
    expect(getCourseOption('nope').id).toBe(ALL_COURSES_ID);
  });
});
