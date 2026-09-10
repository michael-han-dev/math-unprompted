export type ModeId = 'off-the-cuff' | 'deep-research';
export type PoolKind = 'concepts' | 'theorems';

export interface Mode {
  id: ModeId;
  label: string;
  blurb: string;
  /** Which list each course contributes to this mode. */
  pool: PoolKind;
  /** LaTeX-style environment name shown above a landed topic. */
  env: string;
  /** Three-stage arc shown during the speech timer. */
  arc: readonly [string, string, string];
}

export const MODES: readonly Mode[] = [
  {
    id: 'off-the-cuff',
    label: 'Off the cuff',
    blurb: 'No prep. Spin a concept and explain it on the spot.',
    pool: 'concepts',
    env: 'Definition',
    arc: ['Define it', 'Example', 'Why it matters'],
  },
  {
    id: 'deep-research',
    label: 'Deep research',
    blurb: 'Spin a theorem, read up on a research timer, then start the speech timer when you are ready.',
    pool: 'theorems',
    env: 'Theorem',
    arc: ['State it', 'Proof idea', 'Why it matters'],
  },
];

export function getMode(id: string): Mode {
  return MODES.find((m) => m.id === id) ?? MODES[0];
}
