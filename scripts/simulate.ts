// Balance check: npm run simulate
import { allRows, checkRules } from '../src/engine/balance.ts';

{
  const rows = allRows();
  const f = (x: number) => x.toFixed(2).padStart(7);
  console.log('Run'.padEnd(24), 'Total'.padStart(7), '(min-max)'.padStart(12), 'Normal'.padStart(7), 'Crisis'.padStart(7), 'COVID'.padStart(7), 'Coins'.padStart(7), 'Debt'.padStart(7));
  for (const r of rows) {
    console.log(r.label.padEnd(24), f(r.total), `(${r.min.toFixed(1)}-${r.max.toFixed(1)})`.padStart(12), f(r.normalShortfall), f(r.crisisShortfall), f(r.covidShortfall), f(r.coins), f(r.debt));
  }
  const failures = checkRules(rows);
  console.log(failures.length === 0 ? '\nAll balance rules hold.' : '\nFAILED:\n- ' + failures.join('\n- '));
  if (failures.length > 0) process.exitCode = 1;
}
