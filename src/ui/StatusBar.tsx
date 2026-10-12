import { CONFIG, type Path } from '../config.ts';

interface Props {
  path: Path;
  coins: number;
  debt: number;
  reserve: number;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export function StatusBar({ path, coins, debt, reserve }: Props) {
  const { profitBarMin, profitBarMax } = CONFIG.ui;
  const pct = Math.max(0, Math.min(100, ((coins - profitBarMin) / (profitBarMax - profitBarMin)) * 100));
  return (
    <div className="status" aria-label="Status">
      <div>
        Coins
        <b>{coins}</b>
      </div>
      <div>
        Profit
        <div className="bar" role="img" aria-label={`Profit bar ${Math.round(pct)} percent`}>
          <i className={coins < 0 ? 'neg' : ''} style={{ width: `${pct}%` }} />
        </div>
        <span>{coins < 0 ? 'losing money' : coins === 0 ? 'break even' : 'earning'}</span>
      </div>
      {path === 'contract' && (
        <div>
          Produce owed
          <b>{debt}</b>
        </div>
      )}
      {path === 'maeTha' && (
        <div>
          Reserve
          <b>{round1(reserve)}</b>
        </div>
      )}
    </div>
  );
}
