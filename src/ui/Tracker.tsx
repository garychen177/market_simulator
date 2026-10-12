import { CONFIG, type Path } from '../config.ts';
import type { SeasonResult } from '../engine/season.ts';

interface Props {
  path: Path;
  results: SeasonResult[]; // every season played so far in this run
  current: number; // 0-based index of the season being played
  showCurrent: boolean; // the current season's outcome has been revealed (harvest step onward)
  showFed: boolean; // the city step has been reached for the current season
}

const round1 = (n: number) => Math.round(n * 10) / 10;
const SHOCK_LABEL = { normal: 'normal', flood: 'flood', covid: 'COVID' } as const;

/** Side panel: the stats for every round, so the player can see how the farm and the city are doing. */
export function Tracker({ path, results, current, showCurrent, showFed }: Props) {
  const seasons = Array.from({ length: CONFIG.seasons }, (_, i) => i);
  return (
    <aside className="tracker panel" aria-label="Stats for each season">
      <h2>Season tracker</h2>
      <table>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Coins</th>
            <th scope="col">Profit</th>
            <th scope="col">{path === 'contract' ? 'Owed' : 'Reserve'}</th>
            <th scope="col">Fed</th>
          </tr>
        </thead>
        <tbody>
          {seasons.map((i) => {
            const r = results[i];
            const revealed = r !== undefined && (i < current || (i === current && showCurrent));
            const fedShown = r !== undefined && (i < current || (i === current && showFed));
            const isNow = i === current;
            return (
              <tr key={i} className={isNow ? 'now' : ''} aria-current={isNow ? 'step' : undefined}>
                <th scope="row">
                  {i + 1}
                  <small>{revealed ? SHOCK_LABEL[r.shock] : ''}</small>
                </th>
                <td>{revealed ? r.after.coins : '-'}</td>
                <td className={revealed ? (r.coinsDelta < 0 ? 'neg' : 'pos') : ''}>
                  {revealed ? `${r.coinsDelta > 0 ? '+' : ''}${r.coinsDelta}` : '-'}
                </td>
                <td>{revealed ? round1(path === 'contract' ? r.after.debt : r.after.reserve) : '-'}</td>
                <td>{fedShown ? `${round1(Math.min(r.fed, CONFIG.cityNeedPerSeason))}/${CONFIG.cityNeedPerSeason}` : '-'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="row-note">Fed = households fed in the city, out of {CONFIG.cityNeedPerSeason}.</p>
    </aside>
  );
}
