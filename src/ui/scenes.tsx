import { Fragment, type ReactNode } from 'react';
import { CONFIG } from '../config.ts';
import type { SeasonResult } from '../engine/season.ts';
import { Backdrop, Coin, CountUp, Crate, Pixel, Stage, vars } from './common.tsx';
import { Sprite } from './Sprite.tsx';

const SHIRTS = ['#4aa3df', '#e8913a', '#7e57c2', '#d6453d', '#f29cb0', '#5cb85c', '#c99a1c', '#2b6aa8'];

/** A row of crop plants on the field. */
function PlantRow({ x0 = 40, y = 92, count = 5, gap = 48, wilted = false, className = '' }: { x0?: number; y?: number; count?: number; gap?: number; wilted?: boolean; className?: string }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <Pixel key={i} name={wilted ? 'plantWilted' : 'plant'} x={x0 + i * gap} y={y} scale={3} className={className} style={vars({ loopdur: `${1.6 + (i % 3) * 0.3}s` })} />
      ))}
    </>
  );
}

export function TitleScene() {
  return (
    <Stage label="A farm with two farmers and growing crops">
      <Backdrop />
      <PlantRow x0={96} y={96} count={4} gap={36} className="loop sway" />
      <Pixel name="farmer" x={34} y={78} scale={4} shirt="#4aa3df" className="loop bob" style={vars({ loopdur: '1.6s' })} />
      <Pixel name="farmer" x={246} y={78} scale={4} shirt="#5cb85c" flip className="loop bob" style={vars({ loopdur: '1.9s' })} />
      <div className="label" style={{ left: 22, top: 148 }}>Somchai</div>
      <div className="label" style={{ left: 252, top: 148 }}>Malee</div>
    </Stage>
  );
}

export function ContextScene({ kind }: { kind: 'flood' | 'covid' }) {
  if (kind === 'flood') {
    return (
      <Stage label="A flooded river market">
        <Backdrop sky="rain" />
        <Pixel name="market" x={40} y={84} scale={4} />
        <Pixel name="market" x={200} y={84} scale={4} />
        <div className="water anim rise smooth" style={vars({ h: 42, dur: 2.4, d: 0.3 })} />
        {Array.from({ length: 10 }, (_, i) => (
          <Pixel key={i} name="drop" x={12 + i * 32} y={-10} scale={2} className="rain-drop" style={vars({}, { animationDelay: `${(i % 5) * 0.18}s` })} />
        ))}
      </Stage>
    );
  }
  return (
    <Stage label="People queueing for food">
      <Backdrop sky="night" />
      <Pixel name="market" x={30} y={76} scale={4} />
      <Pixel name="lock" x={50} y={50} scale={3} className="anim pop" style={vars({ d: 0.4, dur: 0.5 })} />
      {SHIRTS.slice(0, 5).map((c, i) => (
        <Pixel key={i} name="personHungry" x={120 + i * 36} y={108} scale={3} shirt={c} className="loop shake" style={vars({ loopdur: `${0.8 + i * 0.1}s` })} />
      ))}
    </Stage>
  );
}

export function SeasonCardScene({ shock }: { shock: 'normal' | 'flood' | 'covid' }) {
  if (shock === 'flood') {
    return (
      <Stage label="Rain and a rising river">
        <Backdrop sky="rain" />
        <PlantRow className="loop sway" />
        <div className="water anim rise smooth" style={vars({ h: 34, dur: 2.2, d: 0.4 })} />
        {Array.from({ length: 12 }, (_, i) => (
          <Pixel key={i} name="drop" x={8 + i * 26} y={-10} scale={2} className="rain-drop" style={vars({}, { animationDelay: `${(i % 6) * 0.15}s` })} />
        ))}
      </Stage>
    );
  }
  if (shock === 'covid') {
    return (
      <Stage label="A closed market">
        <Backdrop sky="night" />
        <Pixel name="market" x={104} y={78} scale={5} />
        <Pixel name="lock" x={146} y={44} scale={4} className="anim pop" style={vars({ d: 0.5, dur: 0.5 })} />
        <div className="tag loop blink" style={{ left: 126, top: 168, ['--loopdur' as string]: '1.2s' }}>CLOSED</div>
      </Stage>
    );
  }
  return (
    <Stage label="A sunny farm">
      <Backdrop />
      <PlantRow className="loop sway" />
    </Stage>
  );
}

export function ContractStartScene({ debtBefore, advance }: { debtBefore: number; advance: number }) {
  return (
    <Stage label="A company truck delivers seeds and feed">
      <Backdrop />
      <Pixel name="farmer" x={254} y={86} scale={3} shirt="#4aa3df" flip />
      <Pixel name="truck" x={28} y={96} scale={3} shirt="#4aa3df" className="anim slide-in smooth" style={vars({ dur: 1.4, from: '-260px' }, {})} />
      {Array.from({ length: 4 }, (_, i) => (
        <Crate key={i} x={70 + i * 6} y={100} className="anim fly" style={vars({ dx: 100 + i * 28, dy: 28, d: 1.6 + i * 0.25, dur: 0.7, arc: '28px' })} />
      ))}
      <PlantRow x0={150} y={118} count={4} gap={26} className="" />
      <div className="tag anim appear" style={vars({ d: 1.5, dur: 0.3 }, { left: 10, top: 8 })}>Produce owed</div>
      <div className="num-badge anim pop" style={vars({ d: 1.8, dur: 0.4 }, { left: 18, top: 34, fontSize: 28 })}>
        <CountUp from={debtBefore} to={debtBefore + advance} seconds={0.8} delay={2.0} />
      </div>
      <div className="num-badge anim pop" style={vars({ d: 2.0, dur: 0.4 }, { left: 74, top: 38, background: '#f29cb0' })}>+{advance}</div>
    </Stage>
  );
}

export function MaeThaStartScene({ costs, soilRecovery }: { costs: number; soilRecovery: boolean }) {
  if (soilRecovery) {
    return (
      <Stage label="A field resting while the soil recovers">
        <Backdrop ground="soil" />
        <Pixel name="farmer" x={20} y={82} scale={3} shirt="#5cb85c" />
        {Array.from({ length: 3 }, (_, i) => (
          <Pixel key={i} name="sprout" x={196 + i * 34} y={116} scale={3} className="loop bob" style={vars({ loopdur: `${1.4 + i * 0.3}s` })} />
        ))}
        <div className="tag" style={{ left: 190, top: 96 }}>small plot</div>
        {[0, 1, 2].map((i) => (
          <div key={i} className="loop bob label dark" style={{ left: 100 + i * 22, top: 120 - i * 14, fontSize: 14 + i * 4, ['--loopdur' as string]: `${1.2 + i * 0.3}s` }}>z</div>
        ))}
        <Pixel name="sprout" x={96} y={146} scale={2} />
      </Stage>
    );
  }
  return (
    <Stage label="Coins are paid for certification and inputs">
      <Backdrop />
      <Pixel name="farmer" x={24} y={82} scale={3} shirt="#5cb85c" />
      <div className="tag" style={{ left: 200, top: 62 }}>PGS certificate</div>
      <div className="tag" style={{ left: 200, top: 92 }}>Compost + labour</div>
      {Array.from({ length: 6 }, (_, i) => (
        <Coin key={i} x={80} y={100} className="anim fly" style={vars({ dx: 128, dy: i % 2 ? -22 : -52, d: 0.3 + i * 0.28, dur: 0.8, 'end-op': 0 })} />
      ))}
      <div className="num-badge anim pop" style={vars({ d: 1.0, dur: 0.4 }, { left: 120, top: 14, background: '#f29cb0' })}>-{costs}</div>
    </Stage>
  );
}

/** The flood hits during planting: water rises and washes the crops away. */
export function FloodGrowScene() {
  return (
    <Stage label="A flood washes the crops away">
      <Backdrop sky="rain" />
      <PlantRow className="" />
      {Array.from({ length: 5 }, (_, i) => (
        <Pixel key={i} name="plant" x={40 + i * 48} y={92} scale={3} className="anim wash" style={vars({ d: 1.8 + i * 0.2, dur: 1.2 })} />
      ))}
      <div className="water anim rise smooth" style={vars({ h: 110, dur: 2.6, d: 0.4 })} />
      {Array.from({ length: 14 }, (_, i) => (
        <Pixel key={i} name="drop" x={6 + i * 23} y={-10} scale={2} className="rain-drop" style={vars({}, { animationDelay: `${(i % 7) * 0.13}s` })} />
      ))}
      <Pixel name="farmer" x={8} y={70} scale={3} shirt="#9aa0a6" className="anim appear" style={vars({ d: 3, dur: 0.4 })} />
    </Stage>
  );
}

/** Replay: the same crops, the same seed, shown briefly. */
export function ReplayGrowScene({ shock }: { shock: 'normal' | 'flood' | 'covid' }) {
  if (shock === 'flood') return <FloodGrowScene />;
  return (
    <Stage label="The crops grow">
      <Backdrop />
      <PlantRow className="loop sway" />
    </Stage>
  );
}

// ---------- Harvest and selling ----------

const BUILDINGS = {
  hospital: { x: 148, y: 92, sprite: 'hospital' as const, w: 28 },
  freshMarket: { x: 192, y: 94, sprite: 'market' as const, w: 28 },
  supermarket: { x: 236, y: 94, sprite: 'supermarket' as const, w: 32 },
};
const STORE = { x: 100, y: 90 };
const WAREHOUSE = { x: 280, y: 94 };
const CRATE_W = 15;

const pileSpot = (i: number) => ({ x: 34 + (i % 5) * CRATE_W, y: 118 - Math.floor(i / 5) * 14 });
const roundTo = (n: number) => Math.round(n * 10) / 10;

function CrateUnit({ from, to, delay, dur = 0.8, arc = 36, endOp = 0, rot = false, scale = 1.5 }: {
  from: { x: number; y: number }; to: { x: number; y: number }; delay: number; dur?: number; arc?: number; endOp?: number; rot?: boolean; scale?: number;
}) {
  return (
    <div className="anim fly" style={vars({ dx: `${to.x - from.x}px`, dy: `${to.y - from.y}px`, d: delay, dur, arc: `${arc}px`, 'end-op': endOp }, { left: from.x, top: from.y })}>
      <Sprite name={rot ? 'crateRot' : 'crate'} scale={scale} />
    </div>
  );
}

function SlotTag({ x, y, text, delay }: { x: number; y: number; text: string; delay: number }) {
  return (
    <div className="tag anim pop" style={vars({ d: delay, dur: 0.3 }, { left: x, top: y, fontSize: 11, padding: '0 4px' })}>{text}</div>
  );
}

function Buildings({ closedMarket, closeDelay }: { closedMarket: boolean; closeDelay: number }) {
  return (
    <>
      <Pixel name="hospital" x={BUILDINGS.hospital.x} y={BUILDINGS.hospital.y} scale={2} label="Hospital" />
      <Pixel name="market" x={BUILDINGS.freshMarket.x} y={BUILDINGS.freshMarket.y} scale={2} label="Fresh market" />
      <Pixel name="supermarket" x={BUILDINGS.supermarket.x} y={BUILDINGS.supermarket.y} scale={2} label="Supermarket" />
      {closedMarket && (
        <>
          <Pixel name="lock" x={BUILDINGS.freshMarket.x + 6} y={BUILDINGS.freshMarket.y - 12} scale={2} className="anim pop" style={vars({ d: closeDelay, dur: 0.4 })} />
          <div className="tag anim appear loop blink" style={vars({ d: closeDelay, dur: 0.2, loopdur: '1.2s' }, { left: BUILDINGS.freshMarket.x - 6, top: 58, fontSize: 10, padding: '0 3px' })}>CLOSED</div>
        </>
      )}
    </>
  );
}

function CoinsBack({ count, delay, fromX }: { count: number; delay: number; fromX: number }) {
  const shown = Math.min(count, 8);
  return (
    <>
      {Array.from({ length: shown }, (_, i) => (
        <Coin key={i} x={fromX} y={96} className="anim fly" style={vars({ dx: `${24 - fromX}px`, dy: '8px', d: delay + i * 0.14, dur: 0.9, arc: `${20 + (i % 3) * 8}px`, 'end-op': 0 })} />
      ))}
    </>
  );
}

function ContractHarvest({ result, debtBefore }: { result: SeasonResult; debtBefore: number }) {
  const { harvest, shock, sold, rottedUnits } = result;
  const debtAfter = result.after.debt;
  const units = Math.min(harvest, 10);

  if (harvest === 0) {
    return (
      <Stage label="Nothing to harvest after the flood">
        <Backdrop sky="rain" ground="soil" />
        <Pixel name="farmer" x={20} y={82} scale={3} shirt="#9aa0a6" className="loop bob" style={vars({ loopdur: '2s' })} />
        <div className="water" style={{ height: 22 }} />
        <div className="tag" style={{ left: 110, top: 14 }}>Produce owed</div>
        <div className="num-badge" style={{ left: 120, top: 40, fontSize: 28 }}>{debtBefore}</div>
      </Stage>
    );
  }

  // Truck route: stops in x order, each with a time cursor.
  const stops: { key: string; x: number; units: number; kind: 'hospital' | 'freshMarket' | 'supermarket' | 'warehouse' }[] = [];
  if (sold.hospital > 0) stops.push({ key: 'h', x: BUILDINGS.hospital.x, units: sold.hospital, kind: 'hospital' });
  if (sold.freshMarket > 0 || shock === 'covid') stops.push({ key: 'm', x: BUILDINGS.freshMarket.x, units: sold.freshMarket, kind: 'freshMarket' });
  if (sold.supermarket > 0) stops.push({ key: 's', x: BUILDINGS.supermarket.x, units: sold.supermarket, kind: 'supermarket' });
  if (rottedUnits > 0) stops.push({ key: 'w', x: WAREHOUSE.x - 10, units: rottedUnits, kind: 'warehouse' });

  const TRUCK_X = 24, TRUCK_Y = 108, TRUCK_SCALE = 2;
  let T = 1.4; // truck arrives
  const loadStart = T;
  const loadEnd = loadStart + 0.4 + units * 0.1;
  T = loadEnd + 0.4;
  let cursorX = TRUCK_X;
  const moves: { dx: number; delay: number; dur: number }[] = [];
  let lockDelay = T + 1;
  const dumps: ReactNode[] = [];
  let lastUnload = T;
  let rotBase = 0;
  stops.forEach((s, si) => {
    const dx = s.x - cursorX;
    const driveDur = Math.max(0.6, Math.abs(dx) / 120);
    moves.push({ dx, delay: T, dur: driveDur });
    cursorX = s.x;
    T += driveDur + 0.1;
    if (s.kind === 'freshMarket') lockDelay = T;
    const target = s.kind === 'warehouse' ? { x: WAREHOUSE.x + 4, y: WAREHOUSE.y + 10 } : { x: BUILDINGS[s.kind].x + 6, y: BUILDINGS[s.kind].y + 8 };
    if (s.kind === 'freshMarket' && shock === 'covid' && s.units === 0) {
      T += 0.5; // the lock closes: nothing unloaded
      return;
    }
    for (let u = 0; u < s.units; u++) {
      const from = { x: cursorX + 14, y: TRUCK_Y + 4 };
      if (s.kind === 'warehouse') {
        dumps.push(<CrateUnit key={`d${si}-${u}`} from={from} to={{ x: WAREHOUSE.x + (u % 3) * 10, y: 128 - Math.floor(u / 3) * 8 }} delay={T + u * 0.12} dur={0.5} arc={16} endOp={1} rot />);
        rotBase++;
      } else {
        dumps.push(<CrateUnit key={`d${si}-${u}`} from={from} to={target} delay={T + u * 0.12} dur={0.6} arc={34} />);
      }
    }
    dumps.push(<SlotTag key={`t${si}`} x={s.kind === 'warehouse' ? WAREHOUSE.x - 16 : BUILDINGS[s.kind].x + 4} y={s.kind === 'warehouse' ? 78 : 136} text={s.kind === 'warehouse' ? `${s.units} rot` : `${s.units}`} delay={T + 0.3} />);
    T += s.units * 0.12 + 0.6;
    lastUnload = T;
  });
  void rotBase;
  moves.push({ dx: 330 - cursorX, delay: lastUnload, dur: 1.1 });
  const coinsFrom = BUILDINGS.freshMarket.x;
  const coins = Math.round(result.coinsDelta / CONFIG.contract.companyPricePerUnit);

  return (
    <Stage label="The company truck takes the harvest to market">
      <Backdrop />
      <Pixel name="farmer" x={6} y={90} scale={2} shirt="#4aa3df" />
      <Buildings closedMarket={shock === 'covid'} closeDelay={lockDelay} />
      <Pixel name="warehouse" x={WAREHOUSE.x} y={WAREHOUSE.y} scale={2} label="Warehouse" />
      {Array.from({ length: units }, (_, i) => {
        const p = pileSpot(i);
        return <CrateUnit key={`p${i}`} from={p} to={{ x: TRUCK_X + 14, y: TRUCK_Y + 2 }} delay={loadStart + 0.3 + i * 0.1} dur={0.5} arc={18} />;
      })}
      <TruckBody x={TRUCK_X} y={TRUCK_Y} scale={TRUCK_SCALE} entryDur={1.2} legs={moves} cargoUntil={lastUnload} loaded={loadEnd} />
      {dumps}
      {shock === 'covid' && rottedUnits > 0 && (
        <>
          <div className="loop flies label dark" style={{ left: WAREHOUSE.x + 6, top: 112, ['--loopdur' as string]: '1.4s' }}>. . .</div>
          <div className="tag" style={{ left: 8, top: 8, background: '#ffd9d6' }}>0 reached the city</div>
        </>
      )}
      <CoinsBack count={Math.max(0, coins)} delay={lastUnload} fromX={coinsFrom} />
      <div className="tag anim appear" style={vars({ d: lastUnload, dur: 0.2 }, { left: 8, top: 34 })}>Owed <CountUp from={debtBefore} to={debtAfter} seconds={0.8} delay={lastUnload} /></div>
      {coins > 0 && <div className="num-badge anim pop" style={vars({ d: lastUnload + 0.6, dur: 0.4 }, { left: 8, top: 58 })}>+{result.coinsDelta}</div>}
    </Stage>
  );
}

/** The truck: slides in, then each leg is an absolutely timed drive. Implemented as chained wrappers. */
function TruckBody({ x, y, scale, entryDur, legs, cargoUntil, loaded }: {
  x: number; y: number; scale: number; entryDur: number; legs: { dx: number; delay: number; dur: number }[]; cargoUntil: number; loaded: number;
}) {
  const legData = legs;
  // Nest one wrapper per leg so each translate runs in its own time window.
  const inner = (
    <>
      <Sprite name="truck" scale={scale} shirt="#4aa3df" accent="#4aa3df" />
      <div className="anim appear" style={vars({ d: loaded, dur: 0.2 }, { left: 2 * scale, top: -6 })}>
        <Sprite name="crate" scale={1.5} />
      </div>
      <div className="anim vanish" style={vars({ d: cargoUntil, dur: 0.2 }, { left: 0, top: 0, width: 1, height: 1 })} />
    </>
  );
  const nested = legData.reduceRight<ReactNode>(
    (child, leg, i) => (
      <div key={i} className="anim fly" style={vars({ dx: `${leg.dx}px`, dy: '0px', d: leg.delay, dur: leg.dur, arc: '0px' }, { position: 'relative', animationFillMode: 'forwards' })}>
        {child}
      </div>
    ),
    inner,
  );
  return (
    <div className="anim slide-in smooth" style={vars({ dur: entryDur, from: '-240px' }, { left: x, top: y })}>
      {nested}
    </div>
  );
}

function MaeThaHarvest({ result, debtBefore }: { result: SeasonResult; debtBefore: number }) {
  void debtBefore;
  const { harvest, shock, sold, reserveKept, reserveBonus, wasted } = result;
  const units = Math.min(harvest, 10);

  if (harvest === 0) {
    return (
      <Stage label="Nothing to harvest after the flood">
        <Backdrop sky="rain" ground="soil" />
        <Pixel name="farmer" x={20} y={82} scale={3} shirt="#9aa0a6" className="loop bob" style={vars({ loopdur: '2s' })} />
        <Pixel name="storehouse" x={STORE.x + 70} y={STORE.y - 10} scale={3} />
        <div className="tag" style={{ left: STORE.x + 64, top: 30 }}>Reserve {roundTo(result.after.reserve + result.reserveReleased)}</div>
        <div className="water" style={{ height: 22 }} />
      </Stage>
    );
  }

  const flights: ReactNode[] = [];
  const tags: ReactNode[] = [];
  let idx = 0;
  let T = 0.5;
  for (let i = 0; i < reserveKept; i++, idx++) {
    flights.push(<CrateUnit key={`r${i}`} from={pileSpot(idx)} to={{ x: STORE.x + 10, y: STORE.y + 12 }} delay={T + i * 0.2} dur={0.7} arc={40} />);
  }
  T += reserveKept * 0.2 + 0.5;
  const reserveTotalAfterKeep = result.after.reserve + result.reserveReleased;
  tags.push(<SlotTag key="res" x={STORE.x + 2} y={136} text={`Reserve ${roundTo(reserveTotalAfterKeep)}`} delay={T - 0.4} />);

  (['hospital', 'freshMarket', 'supermarket'] as const).forEach((ch) => {
    const n = sold[ch];
    for (let i = 0; i < n; i++, idx++) {
      flights.push(<CrateUnit key={`${ch}${i}`} from={pileSpot(idx)} to={{ x: BUILDINGS[ch].x + 6, y: BUILDINGS[ch].y + 8 }} delay={T + i * 0.15} dur={0.8} arc={46} />);
    }
    if (n > 0) tags.push(<SlotTag key={`t${ch}`} x={BUILDINGS[ch].x + 2} y={136} text={`${n}/${result.shock === 'covid' && ch === 'freshMarket' ? 0 : capFor(ch, result)}`} delay={T + n * 0.15} />);
    T += n * 0.15 + 0.5;
  });
  // Units nobody buys are shown as wasted.
  for (let i = 0; i < wasted; i++, idx++) {
    const p = pileSpot(idx);
    flights.push(
      <div key={`w${i}`} className="anim rot" style={vars({ d: T, dur: 0.6 }, { left: p.x, top: p.y })}>
        <div className="anim vanish" style={vars({ d: T + 1.2, dur: 0.6 })}>
          <Sprite name="crate" scale={1.5} />
        </div>
      </div>,
    );
  }
  if (wasted > 0) tags.push(<SlotTag key="waste" x={30} y={134} text={`${wasted} wasted`} delay={T + 0.4} />);
  if (reserveBonus > 0) {
    flights.push(...Array.from({ length: reserveBonus }, (_, i) => (
      <CrateUnit key={`g${i}`} from={{ x: STORE.x + 4 + i * 14, y: -14 }} to={{ x: STORE.x + 10 + i * 4, y: STORE.y + 8 }} delay={0.6 + i * 0.3} dur={0.7} arc={0} />
    )));
    tags.push(<SlotTag key="gov" x={STORE.x - 10} y={70} text={`+${reserveBonus} govt`} delay={1.0} />);
  }
  T += 0.6;
  const gross = result.coinsDelta + result.costs;
  const coinCount = Math.round(sold.hospital + sold.freshMarket + sold.supermarket + reserveKept);

  return (
    <Stage label="Mae Tha sells the harvest through its channels">
      <Backdrop />
      <Pixel name="farmer" x={6} y={90} scale={2} shirt="#5cb85c" />
      <Pixel name="storehouse" x={STORE.x} y={STORE.y} scale={2} label="Mae Tha storehouse" />
      <Buildings closedMarket={shock === 'covid'} closeDelay={0.5} />
      {Array.from({ length: units }, (_, i) => {
        const p = pileSpot(i);
        return <Crate key={`p${i}`} x={p.x} y={p.y} className="" style={{ transform: 'scale(0.75)', transformOrigin: 'top left' }} />;
      })}
      {flights}
      {tags}
      <CoinsBack count={coinCount} delay={T} fromX={BUILDINGS.freshMarket.x} />
      <div className="num-badge anim pop" style={vars({ d: T + 0.6, dur: 0.4 }, { left: 8, top: 8 })}>+{gross}</div>
    </Stage>
  );
}

function capFor(ch: 'hospital' | 'freshMarket' | 'supermarket', r: SeasonResult): number {
  void r;
  return CONFIG.maeTha.caps[ch];
}

export function HarvestScene({ result, debtBefore }: { result: SeasonResult; debtBefore: number }) {
  return result.path === 'contract'
    ? <ContractHarvest result={result} debtBefore={debtBefore} />
    : <MaeThaHarvest result={result} debtBefore={debtBefore} />;
}

// ---------- City ----------

export function CityScene({ result }: { result: SeasonResult }) {
  const households = CONFIG.cityNeedPerSeason;
  const crisis = result.shock !== 'normal';
  const before = result.reachingFood;
  const after = Math.min(result.fed, households);
  const state = (i: number, f: number): 'fed' | 'half' | 'hungry' => (i + 1 <= Math.floor(f + 1e-9) ? 'fed' : i < f && f - i >= 0.5 ? 'half' : 'hungry');
  const released = result.reserveReleased > 0;
  const hasBad = result.shortfall > 0;

  return (
    <Stage h={210} label={`${roundTo(after)} of ${households} households fed`}>
      <Backdrop sky={crisis ? 'night' : 'day'} />
      <div className="tag" style={{ left: 8, top: 6 }}>Households fed in Chiang Mai</div>
      {Array.from({ length: households }, (_, i) => {
        const x = 12 + i * 38;
        const initial = state(i, before);
        const final = state(i, after);
        const spriteFor = (s: 'fed' | 'half' | 'hungry') => (s === 'fed' ? 'personFed' : s === 'half' ? 'personHalf' : 'personHungry');
        const changed = released && initial !== final;
        return (
          <Fragment key={i}>
            <Pixel name="house" x={x - 4} y={64} scale={3} />
            {changed ? (
              <>
                <Pixel name={spriteFor(initial)} x={x} y={112} scale={3.5} shirt={SHIRTS[i]} className="anim swap-out" style={vars({ d: 2.2 + i * 0.12, dur: 0.2 })} />
                <Pixel name={spriteFor(final)} x={x} y={112} scale={3.5} shirt={SHIRTS[i]} className="anim swap-in" style={vars({ d: 2.2 + i * 0.12, dur: 0.2 })} />
              </>
            ) : (
              <Pixel name={spriteFor(final)} x={x} y={112} scale={3.5} shirt={SHIRTS[i]} className={final === 'hungry' ? 'loop shake' : 'loop bob'} style={vars({ loopdur: `${1.2 + (i % 3) * 0.3}s` })} />
            )}
            {final === 'hungry' && (
              <div className="loop tear" style={{ left: x + 4, top: 128, width: 4, height: 6, background: '#4aa3df', ['--loopdur' as string]: `${1 + (i % 3) * 0.25}s` }} />
            )}
          </Fragment>
        );
      })}
      {released && (
        <>
          <Pixel name="storehouse" x={4} y={158} scale={1.5} />
          {Array.from({ length: Math.min(Math.ceil(result.reserveReleased), 8) }, (_, i) => (
            <CrateUnit key={i} from={{ x: 30, y: 168 }} to={{ x: 20 + (i + 1) * 36, y: 150 }} delay={0.8 + i * 0.22} dur={0.9} arc={26} endOp={0} />
          ))}
          <div className="tag anim appear" style={vars({ d: 0.5, dur: 0.3 }, { left: 40, top: 186, fontSize: 11 })}>Mae Tha reserve released</div>
        </>
      )}
      <div className={`num-badge anim pop`} style={vars({ d: 0.3, dur: 0.4 }, { right: 8, top: 6 })}>
        <CountUp from={0} to={Math.round(after * 10) / 10} seconds={0.8} delay={0.3} />/{households}
      </div>
      {hasBad && crisis && <div className="tag" style={{ right: 8, top: 34, fontSize: 11, background: '#ffd9d6' }}>short {roundTo(result.shortfall)}</div>}
    </Stage>
  );
}
