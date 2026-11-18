// Renders a blog post's markdown-lite body: ### headings, - bullets,
// **bold** and [text](url) links. Server-side, so Google reads it all.
import Link from "next/link";
import { Fragment } from "react";

function inline(text: string, key: string) {
  const out: React.ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) out.push(<strong key={`${key}-${i++}`}>{m[1]}</strong>);
    else out.push(<Link key={`${key}-${i++}`} href={m[3]}>{m[2]}</Link>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export default function PostBody({ body }: { body: string }) {
  const blocks = body.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className="post-body">
      {blocks.map((b, i) => {
        const k = `b${i}`;
        if (b.startsWith("### ")) return <h2 key={k}>{b.slice(4)}</h2>;
        if (b.split("\n").every((l) => l.startsWith("- "))) {
          return <ul key={k}>{b.split("\n").map((l, j) => <li key={`${k}-${j}`}>{inline(l.slice(2), `${k}-${j}`)}</li>)}</ul>;
        }
        return <p key={k}>{b.split("\n").map((l, j) => <Fragment key={`${k}-${j}`}>{j > 0 && <br />}{inline(l, `${k}-${j}`)}</Fragment>)}</p>;
      })}
      <style>{`
        .post-body { max-width: 68ch; }
        .post-body h2 { font-size: 1.45rem; font-weight: 700; margin: 2.4rem 0 0.8rem; color: #fff; }
        .post-body p, .post-body li { color: rgba(255,255,255,0.78); line-height: 1.75; font-size: 1.05rem; }
        .post-body p { margin-bottom: 1.1rem; }
        .post-body ul { margin: 0 0 1.2rem 1.2rem; list-style: disc; }
        .post-body li { margin-bottom: 0.4rem; }
        .post-body strong { color: #fff; }
        .post-body a { color: var(--accent); text-decoration: underline; text-underline-offset: 3px; }
      `}</style>
    </div>
  );
}
