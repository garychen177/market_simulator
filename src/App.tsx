import { useCallback, useMemo, useState } from 'react';
import { CONFIG, type Path, type Policy } from './config.ts';
import { runFromSeed } from './engine/run.ts';
import { TimeScale } from './ui/common.tsx';
import { Game } from './ui/Game.tsx';
import { ChooseScreen, ComparisonScreen, ContextScreen, DebriefScreen, EndScreen, PolicyScreen, SettingsScreen, TitleScreen } from './ui/screens.tsx';

type View = 'settings' | 'title' | 'context' | 'choose' | 'game' | 'end' | 'policy' | 'replay' | 'comparison' | 'debrief';

const newSeed = () => Math.floor(Math.random() * 2 ** 31);
const prefersReduced = () => {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
};

export default function App() {
  const [view, setView] = useState<View>('title');
  const [back, setBack] = useState<View>('title');
  const [path, setPath] = useState<Path>('contract');
  const [seed, setSeed] = useState(newSeed);
  const [losses, setLosses] = useState<number[]>([]);
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [gameKey, setGameKey] = useState(0);
  const [season, setSeason] = useState(0);
  const [skip, setSkip] = useState(false);
  const [reduced, setReduced] = useState(prefersReduced);

  const scale = skip ? CONFIG.ui.animationScale.skip : reduced ? CONFIG.ui.animationScale.reduced : CONFIG.ui.animationScale.normal;
  const onSeason = useCallback((s: number) => setSeason(s), []);
  const onStep = useCallback(() => setSkip(false), []);

  const base = useMemo(() => (losses.length === CONFIG.seasons ? runFromSeed(path, seed, losses, null) : null), [path, seed, losses]);
  const withPolicy = useMemo(() => (losses.length === CONFIG.seasons && policy ? runFromSeed(path, seed, losses, policy) : null), [path, seed, losses, policy]);

  const play = (p: Path, s: number) => {
    setPath(p);
    setSeed(s);
    setLosses([]);
    setPolicy(null);
    setGameKey((k) => k + 1);
    setSeason(1);
    setView('game');
  };
  const restart = () => { setSeason(0); setLosses([]); setPolicy(null); setSeed(newSeed()); setView('title'); };
  const otherPath: Path = path === 'contract' ? 'maeTha' : 'contract';
  const inGame = view === 'game' || view === 'replay';

  let body = null;
  if (view === 'settings') body = <SettingsScreen onBack={() => setView(back)} />;
  else if (view === 'title') body = <TitleScreen onStart={() => setView('context')} />;
  else if (view === 'context') body = <ContextScreen onNext={() => setView('choose')} />;
  else if (view === 'choose') body = <ChooseScreen onChoose={(p) => play(p, seed)} />;
  else if (view === 'game') {
    body = <Game key={gameKey} path={path} seed={seed} policy={null} replayLosses={null} onSeason={onSeason} onStep={onStep} onFinish={(l) => { setLosses(l); setSeason(0); setView('end'); }} />;
  } else if (view === 'replay' && policy) {
    body = <Game key={`r${gameKey}-${policy}`} path={path} seed={seed} policy={policy} replayLosses={losses} onSeason={onSeason} onStep={onStep} onFinish={() => { setSeason(0); setView('comparison'); }} />;
  } else if (view === 'end' && base) {
    body = <EndScreen path={path} run={base} onPolicy={() => setView('policy')} onOther={() => play(otherPath, seed)} onDebrief={() => setView('debrief')} />;
  } else if (view === 'policy') {
    body = <PolicyScreen path={path} onBack={() => setView('end')} onPick={(p) => { setPolicy(p); setGameKey((k) => k + 1); setSeason(1); setView('replay'); }} />;
  } else if (view === 'comparison' && base && withPolicy && policy) {
    body = <ComparisonScreen path={path} policy={policy} base={base} withP={withPolicy} onBack={() => setView('policy')} onDebrief={() => setView('debrief')} onOther={() => play(otherPath, seed)} />;
  } else if (view === 'debrief') {
    body = <DebriefScreen onDone={() => setView(base ? 'end' : 'title')} onRestart={restart} />;
  }

  return (
    <TimeScale.Provider value={scale}>
      <div className="app" data-reduced={reduced} style={{ ['--t' as string]: scale }}>
        <header className="topbar">
          {inGame && (
            <>
              <div className="progress" role="progressbar" aria-valuemin={1} aria-valuemax={CONFIG.seasons} aria-valuenow={season} aria-label="Season progress">
                {Array.from({ length: CONFIG.seasons }, (_, i) => (
                  <span key={i} className={i + 1 < season ? 'done' : i + 1 === season ? 'now' : ''}>{i + 1}</span>
                ))}
              </div>
              <span className="progress-label">Season {season} of {CONFIG.seasons}{view === 'replay' && policy ? ` · policy ${policy}` : ''}</span>
            </>
          )}
          <span style={{ flex: 1 }} />
          {inGame && <button className="small-btn" onClick={() => setSkip(true)} disabled={skip}>Skip animation</button>}
          <button className="small-btn" aria-pressed={reduced} onClick={() => setReduced((r) => !r)}>Reduced motion</button>
          {(view === 'title' || view === 'context' || view === 'choose') && (
            <button className="small-btn" onClick={() => { setBack(view); setView('settings'); }}>Settings</button>
          )}
          {view !== 'title' && view !== 'settings' && <button className="small-btn" onClick={restart}>Start over</button>}
        </header>
        {inGame ? body : <div className="narrow">{body}</div>}
      </div>
    </TimeScale.Provider>
  );
}
