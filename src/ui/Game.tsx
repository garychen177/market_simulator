import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { CONFIG, type Path, type Policy } from '../config.ts';
import { pickFact } from '../content/facts.ts';
import { modeForPath, unitsLost } from '../engine/minigame.ts';
import { runFromSeed } from '../engine/run.ts';
import { START_STATE, type SeasonResult } from '../engine/season.ts';
import { PestGame } from './PestGame.tsx';
import {
  CityScene, ContractStartScene, FloodGrowScene, HarvestScene, MaeThaStartScene, ReplayGrowScene, SeasonCardScene,
} from './scenes.tsx';
import { StatusBar } from './StatusBar.tsx';
import { Tracker } from './Tracker.tsx';

type Step = 'card' | 'start' | 'grow' | 'harvest' | 'city' | 'fact';
const STEPS: Step[] = ['card', 'start', 'grow', 'harvest', 'city', 'fact'];

interface Props {
  path: Path;
  seed: number;
  policy: Policy | null;
  replayLosses: number[] | null; // set on a policy replay: reuse the first run's pest losses
  onFinish: (losses: number[]) => void;
  onSeason: (season: number) => void; // 1-based, for the progress bar
  onStep: () => void; // lets the shell reset "skip" for the new step
}


function seasonLine(shock: string): string {
  return shock === 'flood' ? 'The river is rising.' : shock === 'covid' ? 'The markets are closing.' : 'A normal season.';
}

function harvestLine(r: SeasonResult, policy: Policy | null): string {
  if (r.harvest === 0) return r.path === 'contract' ? 'There is nothing to sell, and the debt stays.' : 'There is nothing to sell. The reserve stays ready.';
  if (r.path === 'contract') {
    if (r.shock === 'covid') {
      return r.fed > 0 && policy === 'A'
        ? 'Some food reaches the hospital and supermarket. The rest sits unsold.'
        : 'The market is closed. The harvest sits unsold.';
    }
    return 'The company takes the whole harvest.';
  }
  return r.shock === 'covid'
    ? 'The market is closed. Mae Tha sells to the hospital and supermarket.'
    : 'Mae Tha keeps a reserve, then sells to hospital, market and supermarket.';
}

function cityLine(r: SeasonResult): string {
  if (r.reserveReleased > 0) return "Mae Tha's reserve reaches the people first.";
  if (r.shortfall > 0 && r.shock !== 'normal') return 'People queue with empty bowls.';
  if (r.shortfall > 0) return 'Some households go without.';
  return 'Everyone is fed.';
}

export function Game({ path, seed, policy, replayLosses, onFinish, onSeason, onStep }: Props) {
  const [idx, setIdx] = useState(0);
  const [step, setStep] = useState<Step>('card');
  const [losses, setLosses] = useState<number[]>(replayLosses ?? []);
  const [usedFacts, setUsedFacts] = useState<number[]>([]);

  const run = useMemo(() => runFromSeed(path, seed, losses, policy), [path, seed, losses, policy]);
  const result: SeasonResult | undefined = run.results[idx];
  // The shock is known from the seed even before the season's result exists.
  const shock = useMemo(() => runFromSeed(path, seed, Array(CONFIG.seasons).fill(0), null).results[idx].shock, [path, seed, idx]);
  const prevAfter = idx > 0 ? run.results[idx - 1].after : START_STATE;
  const prevResults = run.results.slice(0, idx);

  useEffect(() => { onSeason(idx + 1); }, [idx, onSeason]);
  useEffect(() => { onStep(); }, [idx, step, onStep]);

  const fact = useMemo(
    () => (result && step === 'fact' ? pickFact(path, result, prevResults, usedFacts) : null),
    [step, idx, result],
  );

  const next = useCallback(() => {
    const i = STEPS.indexOf(step);
    if (step === 'grow' && !replayLosses && shock === 'flood' && losses.length <= idx) setLosses((l) => [...l.slice(0, idx), 0]);
    if (step === 'fact') {
      if (fact) setUsedFacts((u) => [...u, fact.id]);
      if (idx + 1 >= CONFIG.seasons) onFinish(losses);
      else { setIdx(idx + 1); setStep('card'); }
      return;
    }
    setStep(STEPS[i + 1]);
  }, [step, replayLosses, shock, losses, idx, fact, onFinish]);

  const onMiniDone = useCallback((destroyed: number) => {
    setLosses((l) => [...l.slice(0, idx), unitsLost(path, destroyed)]);
    setStep('harvest');
  }, [idx, path]);

  const onMiniSkip = useCallback(() => {
    setLosses((l) => [...l.slice(0, idx), CONFIG.minigame.skipLossUnits]);
    setStep('harvest');
  }, [idx]);

  // Status numbers: the season's outcome only counts once the harvest has been shown.
  const settled = result && (step === 'harvest' || step === 'city' || step === 'fact');
  const status = settled ? result.after : prevAfter;
  const debtShown = path === 'contract' && !settled && (step === 'start' || step === 'grow') ? prevAfter.debt + CONFIG.contract.advanceUnits : status.debt;
  const coinsShown = path === 'maeTha' && !settled && step === 'grow' ? prevAfter.coins - (result ? result.costs : CONFIG.maeTha.certificateCost + CONFIG.maeTha.inputCost) : status.coins;
  const reserveShown = settled ? result.after.reserve : prevAfter.reserve;

  const isFlood = shock === 'flood';
  let scene: ReactNode = null;
  let line = '';
  let hideNext = false;

  if (step === 'card') {
    scene = <SeasonCardScene shock={shock} />;
    line = seasonLine(shock);
  } else if (step === 'start') {
    if (path === 'contract') {
      scene = <ContractStartScene debtBefore={prevAfter.debt} advance={CONFIG.contract.advanceUnits} />;
      line = `The company advances seeds and feed. You owe ${CONFIG.contract.advanceUnits} more units of produce.`;
    } else {
      const certificate = policy === 'B' ? CONFIG.policies.B.certificateCost : CONFIG.maeTha.certificateCost;
      const costs = certificate + CONFIG.maeTha.inputCost;
      scene = <MaeThaStartScene costs={costs} soilRecovery={idx === 0} />;
      line = idx === 0
        ? 'Your land needs time to recover from chemicals. Mae Tha lends you a small plot.'
        : 'You pay for certification, compost and labour.';
    }
  } else if (step === 'grow') {
    if (isFlood) {
      scene = <FloodGrowScene />;
      line = "The flood took this season's crops.";
    } else if (replayLosses) {
      scene = <ReplayGrowScene shock={shock} />;
      line = 'The same pests come as before.';
    } else {
      scene = <PestGame key={`${idx}-${path}`} mode={modeForPath(path)} seed={seed * 31 + idx} showHelp={idx === 0} onDone={onMiniDone} onSkip={onMiniSkip} />;
      line = path === 'contract' ? 'Spray the pests away.' : 'Pick the pests off by hand.';
      hideNext = true;
    }
  } else if (step === 'harvest' && result) {
    scene = <HarvestScene key={`h${idx}`} result={result} debtBefore={prevAfter.debt + (path === 'contract' ? CONFIG.contract.advanceUnits : 0)} />;
    line = harvestLine(result, policy);
  } else if (step === 'city' && result) {
    scene = <CityScene key={`c${idx}`} result={result} />;
    line = cityLine(result);
  } else if (step === 'fact' && fact) {
    scene = (
      <div className="fact">
        <span className="tagline">Fact</span>
        <p>{fact.text}</p>
        <small>Source: {fact.source}</small>
      </div>
    );
  }

  const lastStep = step === 'fact';
  return (
    <div className="game-layout">
    <section className="screen" aria-live="polite">
      {scene}
      {step !== 'fact' && <p className="line">{line}</p>}
      <StatusBar
        path={path}
        coins={coinsShown}
        debt={debtShown}
        reserve={reserveShown}
      />
      {!hideNext && (
        <div className="btn-row">
          <button className="btn" onClick={next}>
            {lastStep ? (idx + 1 >= CONFIG.seasons ? 'See results' : 'Next season') : 'Next'}
          </button>
        </div>
      )}
    </section>
    <Tracker
      path={path}
      results={run.results}
      current={idx}
      showCurrent={step === 'harvest' || step === 'city' || step === 'fact'}
      showFed={step === 'city' || step === 'fact'}
    />
    </div>
  );
}
