interface Props {
  text: string;
  eyebrow: string;
  spinning: boolean;
  landed: boolean;
  /** Changes on every reel step so the phrase re-mounts and replays its flash animation. */
  tickKey: number;
}

function sizeFor(text: string): 's' | 'm' | 'l' {
  if (text.length > 40) return 'l';
  if (text.length > 22) return 'm';
  return 's';
}

export function Reel({ text, eyebrow, spinning, landed, tickKey }: Props) {
  return (
    <section className={`reel ${spinning ? 'is-spinning' : ''} ${landed ? 'is-landed' : ''}`}>
      <p className="reel-eyebrow">{eyebrow}</p>
      <p className="reel-phrase" data-size={sizeFor(text)} key={tickKey}>
        {text}
      </p>
    </section>
  );
}
