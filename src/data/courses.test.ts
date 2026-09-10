import { describe, expect, it } from 'vitest';
import { ALL_COURSES_ID, COURSES, COURSE_OPTIONS, getCourseOption, getPool, kindOf } from './courses';

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

  it('never lists a topic as both a definition and a theorem', () => {
    const theorems = new Set(COURSES.flatMap((c) => c.theorems));
    expect(COURSES.flatMap((c) => c.concepts).filter((t) => theorems.has(t))).toEqual([]);
  });

  it('pools a course, or all courses, without duplicates', () => {
    const one = getPool('real-analysis');
    expect(one).toEqual([...COURSES[0].concepts, ...COURSES[0].theorems]);
    expect(getPool('nope')).toEqual(one);
    const all = getPool(ALL_COURSES_ID);
    expect(all.length).toBe(new Set(COURSES.flatMap((c) => [...c.concepts, ...c.theorems])).size);
    expect(COURSE_OPTIONS[0].id).toBe(ALL_COURSES_ID);
    expect(getCourseOption('nope').id).toBe(ALL_COURSES_ID);
  });

  it('labels theorems and definitions', () => {
    expect(kindOf(COURSES[0].theorems[0])).toBe('Theorem');
    expect(kindOf(COURSES[0].concepts[0])).toBe('Definition');
  });
});
