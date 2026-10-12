import { useRef, useState } from 'react';
import { CONFIG, type Path, type Policy } from '../config.ts';
import { DEBRIEF, answersToText, loadAnswers, saveAnswers } from '../content/debrief.ts';
import { factById } from '../content/facts.ts';
import { storyFor } from '../content/story.ts';
import { POLICY_TARGET, type RunSummary } from '../engine/run.ts';
import { ContextScene, TitleScene } from './scenes.tsx';
import { Pixel, Stage } from './common.tsx';
import { Sprite } from './Sprite.tsx';
import { PARAMS, applySettings, clampParam, currentValues, defaultValues, saveSettings, type Values } from '../settings.ts';

const round1 = (n: number) => Math.round(n * 10) / 10;

export function TitleScreen({ onStart }: { onStart: () => void }) {
  return (
    <section className="screen">
      <h1 className="title">Two Farmers, One City</h1>
      <TitleScene />
      <p className="hook">Live one farmer&apos;s life near Chiang Mai, then see what it means for the whole city.</p>
      <div className="btn-row"><button className="btn" onClick={onStart}>Start</button></div>
    </section>
  );
}

export function ContextScreen({ onNext }: { onNext: () => void }) {
  const [page, setPage] = useState(0);
  const [seenAll, setSeenAll] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const cards = [
    { kind: 'flood' as const, fact: factById(1) },
    { kind: 'covid' as const, fact: factById(2) },
  ];
  const go = (p: number) => {
    const el = ref.current;
    if (el) el.scrollTo({ left: p * el.clientWidth, behavior: 'smooth' });
    setPage(p);
    if (p === cards.length - 1) setSeenAll(true);
  };
  return (
    <section className="screen">
      <div
        className="cards"
        ref={ref}
        onScroll={(e) => {
          const el = e.currentTarget;
          const p = Math.round(el.scrollLeft / Math.max(1, el.clientWidth));
          setPage(p);
          if (p === cards.length - 1) setSeenAll(true);
        }}
      >
        {cards.map((c) => (
          <div key={c.fact.id} className="fact" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <ContextScene kind={c.kind} />
            <p>{c.fact.text}</p>
            <small>Source: {c.fact.source}</small>
          </div>
        ))}
      </div>
      <div className="dots" aria-hidden="true">{cards.map((_, i) => <i key={i} className={i === page ? 'on' : ''} />)}</div>
      <p className="hint">{seenAll ? 'Ready when you are.' : 'Read both cards to continue.'}</p>
      <div className="btn-row">
        {!seenAll && <button className="btn" onClick={() => go(1)}>Next card</button>}
        {seenAll && <button className="btn" onClick={onNext}>Choose your farmer</button>}
      </div>
    </section>
  );
}

export function ChooseScreen({ onChoose }: { onChoose: (p: Path) => void }) {
  return (
    <section className="screen">
      <h2 className="line" style={{ minHeight: 0 }}>Choose your farmer</h2>
      <div className="choose">
        <button className="choice" onClick={() => onChoose('contract')}>
          <Sprite name="farmer" scale={6} shirt="#4aa3df" />
          <h3>Somchai</h3>
          <p>Contract farmer</p>
          <p>The company gives you seeds and feed. You pay back in produce.</p>
        </button>
        <button className="choice" onClick={() => onChoose('maeTha')}>
          <Sprite name="farmer" scale={6} shirt="#5cb85c" />
          <h3>Malee</h3>
          <p>Mae Tha member</p>
          <p>An organic co-op that shares the work and keeps a food reserve.</p>
        </button>
      </div>
    </section>
  );
}

function householdLevel(pct: number): 'full' | 'half' | 'empty' {
  return pct >= 90 ? 'full' : pct >= 50 ? 'half' : 'empty';
}

export function EndScreen({ path, run, onPolicy, onOther, onDebrief }: {
  path: Path; run: RunSummary; onPolicy: () => void; onOther: () => void; onDebrief: () => void;
}) {
  const [l1, l2] = storyFor(path, run);
  const { coins, debt, wasted } = run.finalState;
  const bar = Math.max(0, Math.min(100, ((coins - CONFIG.ui.profitBarMin) / (CONFIG.ui.profitBarMax - CONFIG.ui.profitBarMin)) * 100));
  return (
    <section className="screen">
      <h2 className="line" style={{ minHeight: 0 }}>{path === 'contract' ? 'Somchai' : 'Malee'}&apos;s five seasons</h2>
      <div className="panel">
        <h2>Your farmer</h2>
        <div className="stat"><span>Final coins</span><b>{coins}</b></div>
        {path === 'contract' && <div className="stat"><span>Produce still owed</span><b>{debt}</b></div>}
        <div className="stat"><span>Units wasted</span><b>{round1(wasted)}</b></div>
        <div className="status" style={{ gridTemplateColumns: '1fr', marginTop: 6 }}>
          <div>Profit<div className="bar"><i className={coins < 0 ? 'neg' : ''} style={{ width: `${bar}%` }} /></div></div>
        </div>
      </div>
      <div className="panel">
        <h2>The city</h2>
        <div className="season-icons">
          {run.results.map((r) => {
            const lvl = householdLevel(r.householdsPct);
            return (
              <div key={r.season}>
                S{r.season}
                <div className="lvl" role="img" aria-label={`Season ${r.season}: ${r.householdsPct} percent of households fed`}>
                  <i className={lvl === 'full' ? '' : lvl === 'half' ? 'mid' : 'low'} style={{ width: `${r.householdsPct}%` }} />
                </div>
                {r.householdsPct}%
                <div>{r.shock === 'flood' ? 'flood' : r.shock === 'covid' ? 'COVID' : 'normal'}</div>
              </div>
            );
          })}
        </div>
        <p className="row-note" style={{ marginTop: 8 }}>Total shortfall: {round1(run.totalShortfall)} units of food over 5 seasons.</p>
      </div>
      <div className="panel">
        <p style={{ margin: 0 }}>{l1}</p>
        <p style={{ margin: '6px 0 0' }}>{l2}</p>
      </div>
      <div className="panel">
        <h2>Food Council (a future version)</h2>
        <p className="row-note">In a future version, the Chiang Mai Food Council joins the game: it could pre-buy Mae Tha&apos;s reserve or open an emergency kitchen. What would you ask them to do?</p>
      </div>
      <p className="row-note">This simulation shows one farmer scaled up to a whole city. The market is only one link in the food chain; tourism, land loss and the Food Council are left out.</p>
      <div className="btn-row">
        <button className="btn" onClick={onPolicy}>Try a policy</button>
        <button className="btn alt" onClick={onOther}>Play the other farmer</button>
        <button className="btn alt" onClick={onDebrief}>Debrief</button>
      </div>
    </section>
  );
}

const POLICIES: { id: Policy; label: string; detail: string; sprite: 'truck' | 'coin' | 'storehouse' }[] = [
  { id: 'A', label: 'More channels for contract farmers', detail: 'The company can also sell to the hospital and the supermarket.', sprite: 'truck' },
  { id: 'B', label: 'Cheaper organic farming', detail: 'No certificate cost, a lower price, a bigger fresh market and a better first season.', sprite: 'coin' },
  { id: 'C', label: "Support Mae Tha's emergency food bank", detail: 'The government adds 2 units to the reserve every season.', sprite: 'storehouse' },
];

export function PolicyScreen({ path, onPick, onBack }: { path: Path; onPick: (p: Policy) => void; onBack: () => void }) {
  const [chosen, setChosen] = useState<Policy | null>(null);
  const off = chosen !== null && POLICY_TARGET[chosen] !== path;
  return (
    <section className="screen">
      <h2 className="line" style={{ minHeight: 0 }}>Pick one policy and replay the same 5 seasons</h2>
      <div className="choose" style={{ gridTemplateColumns: '1fr' }}>
        {POLICIES.map((p) => (
          <button key={p.id} className="choice policy-card" aria-pressed={chosen === p.id} style={chosen === p.id ? { background: '#fff3c4' } : undefined} onClick={() => setChosen(p.id)}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <Sprite name={p.sprite} scale={p.sprite === 'truck' ? 2 : 3} />
              <h3 style={{ textAlign: 'left' }}>{p.id}. {p.label}</h3>
            </div>
            <p>{p.detail}</p>
            <span className="for">Helps: {POLICY_TARGET[p.id] === 'contract' ? 'contract farmers' : 'Mae Tha members'}</span>
          </button>
        ))}
      </div>
      {off && <div className="notice">This policy mainly helps the other farmer. Try it after playing them.</div>}
      <div className="btn-row">
        <button className="btn alt" onClick={onBack}>Back</button>
        <button className="btn" disabled={!chosen} onClick={() => chosen && onPick(chosen)}>Replay with this policy</button>
      </div>
    </section>
  );
}

function whatChanged(path: Path, policy: Policy, base: RunSummary, withP: RunSummary): string {
  const diff = round1(base.totalShortfall - withP.totalShortfall);
  if (diff <= 0) return 'This policy did not change the city shortfall for this farmer.';
  const covid = withP.results.find((r) => r.shock === 'covid');
  const baseCovid = base.results.find((r) => r.shock === 'covid');
  const extra = covid && baseCovid && baseCovid.shortfall > covid.shortfall ? ` In the COVID season the gap fell from ${round1(baseCovid.shortfall)} to ${round1(covid.shortfall)}.` : '';
  const what = policy === 'A' ? 'selling to more channels' : policy === 'B' ? 'cheaper organic farming' : 'a bigger emergency reserve';
  void path;
  return `With ${what}, the city missed ${diff} fewer units of food.${extra}`;
}

export function ComparisonScreen({ path, policy, base, withP, onBack, onDebrief, onOther }: {
  path: Path; policy: Policy; base: RunSummary; withP: RunSummary; onBack: () => void; onDebrief: () => void; onOther: () => void;
}) {
  const col = (title: string, r: RunSummary) => (
    <div className="panel">
      <h2>{title}</h2>
      <span>Total shortfall</span>
      <b>{round1(r.totalShortfall)}</b>
      <span>Farmer coins</span>
      <b>{r.finalState.coins}</b>
      {path === 'contract' ? (<><span>Produce owed</span><b>{r.finalState.debt}</b></>) : (<><span>Reserve left</span><b>{round1(r.finalState.reserve)}</b></>)}
      <hr />
      {r.results.filter((x) => x.shock !== 'normal').map((x) => (
        <div key={x.season} className="stat"><span>S{x.season} {x.shock === 'flood' ? 'flood' : 'COVID'}</span><b>{round1(x.shortfall)}</b></div>
      ))}
    </div>
  );
  return (
    <section className="screen">
      <h2 className="line" style={{ minHeight: 0 }}>Without and with policy {policy}</h2>
      <div className="cols">{col('Without', base)}{col(`With ${policy}`, withP)}</div>
      <p className="line" style={{ minHeight: 0 }}>{whatChanged(path, policy, base, withP)}</p>
      <div className="btn-row">
        <button className="btn alt" onClick={onBack}>Try another policy</button>
        <button className="btn alt" onClick={onOther}>Play the other farmer</button>
        <button className="btn" onClick={onDebrief}>Debrief</button>
      </div>
    </section>
  );
}

export function DebriefScreen({ onDone, onRestart }: { onDone: () => void; onRestart: () => void }) {
  const [answers, setAnswers] = useState<string[]>(loadAnswers);
  const [i, setI] = useState(0);
  const finished = i >= DEBRIEF.length;
  const set = (v: string) => {
    const next = answers.map((a, k) => (k === i ? v : a));
    setAnswers(next);
    saveAnswers(next);
  };
  const download = () => {
    const blob = new Blob([answersToText(answers)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'two-farmers-debrief.txt';
    a.click();
    URL.revokeObjectURL(url);
  };
  if (finished) {
    return (
      <section className="screen">
        <Stage h={120} label="A farm at sunset"><Pixel name="farmer" x={60} y={40} scale={4} /><Pixel name="farmer" x={200} y={40} scale={4} shirt="#5cb85c" flip /></Stage>
        <h2 className="line" style={{ minHeight: 0 }}>Thank you for playing</h2>
        <p className="hint">Your answers stay in this browser. Download them to keep or share.</p>
        <div className="btn-row">
          <button className="btn" onClick={download}>Download answers (.txt)</button>
          <button className="btn alt" onClick={onDone}>Back to results</button>
          <button className="btn alt" onClick={onRestart}>Start over</button>
        </div>
      </section>
    );
  }
  const q = DEBRIEF[i];
  return (
    <section className="screen">
      <div className="panel">
        <small>{q.group} · {i + 1} of {DEBRIEF.length}</small>
        <h2 style={{ marginTop: 6 }}>{q.text}</h2>
        <textarea aria-label={q.text} value={answers[i]} onChange={(e) => set(e.target.value)} placeholder="Type your thoughts here" />
      </div>
      <div className="btn-row">
        <button className="btn alt" onClick={() => (i === 0 ? onDone() : setI(i - 1))}>Back</button>
        <button className="btn" onClick={() => setI(i + 1)}>{i === DEBRIEF.length - 1 ? 'Finish' : 'Next'}</button>
      </div>
    </section>
  );
}

export function SettingsScreen({ onBack }: { onBack: () => void }) {
  const [values, setValues] = useState<Values>(currentValues);
  const defaults = defaultValues();
  const change = (id: string, v: number) => {
    const p = PARAMS.find((x) => x.id === id);
    if (!p) return;
    const next = { ...values, [id]: clampParam(p, v) };
    setValues(next);
    applySettings(next);
    saveSettings(next);
  };
  const reset = () => {
    const d = defaultValues();
    setValues(d);
    applySettings(d);
    saveSettings(d);
  };
  const groups = Array.from(new Set(PARAMS.map((p) => p.group)));
  const changed = PARAMS.filter((p) => values[p.id] !== defaults[p.id]).length;
  return (
    <section className="screen" style={{ justifyContent: 'flex-start' }}>
      <h2 className="line" style={{ minHeight: 0 }}>Settings</h2>
      <p className="hint">Change how the game works. New numbers apply the next time you start a farmer.</p>
      {groups.map((g) => (
        <div className="panel" key={g}>
          <h2>{g}</h2>
          {PARAMS.filter((p) => p.group === g).map((p) => (
            <div className="setting" key={p.id}>
              <div className="setting-text">
                <label htmlFor={p.id}>{p.label}</label>
                <small>{p.help}</small>
                {values[p.id] !== defaults[p.id] && <small className="changed">Default: {defaults[p.id]}</small>}
              </div>
              <div className="stepper">
                <button className="small-btn" aria-label={`Less: ${p.label}`} onClick={() => change(p.id, values[p.id] - p.step)} disabled={values[p.id] <= p.min}>-</button>
                <input
                  id={p.id}
                  type="number"
                  inputMode="decimal"
                  min={p.min}
                  max={p.max}
                  step={p.step}
                  value={values[p.id]}
                  onChange={(e) => e.target.value !== '' && change(p.id, Number(e.target.value))}
                />
                <button className="small-btn" aria-label={`More: ${p.label}`} onClick={() => change(p.id, values[p.id] + p.step)} disabled={values[p.id] >= p.max}>+</button>
              </div>
            </div>
          ))}
        </div>
      ))}
      <div className="btn-row">
        <button className="btn alt" onClick={reset} disabled={changed === 0}>Reset to defaults</button>
        <button className="btn" onClick={onBack}>Done</button>
      </div>
    </section>
  );
}
