'use client';

import { useMemo, useState } from 'react';
import {
  CATEGORIES, CATEGORY_COLORS, catLabel, T, fmtKr, daysBetween, todayISO,
  periodRanges, inRange, profitOfItem
} from './i18n';

export default function AnalyseView({ items, lang, onViewOverdue }) {
  const t = T[lang];
  const [profitFilterCat, setProfitFilterCat] = useState('all');
  const [profitPeriod, setProfitPeriod] = useState('year');

  const sold = useMemo(() => items.filter(i => i.status === 'sold' && i.sold_date), [items]);
  const available = useMemo(() => items.filter(i => i.status === 'available'), [items]);

  /* ---- period stat cards ---- */
  const statCards = useMemo(() => {
    const now = new Date();
    const r = periodRanges(now);
    const build = (label, [start, end], [pStart, pEnd]) => {
      const cur = sold.filter(it => inRange(it.sold_date, start, end));
      const prev = sold.filter(it => inRange(it.sold_date, pStart, pEnd));
      const amount = cur.reduce((s, it) => s + profitOfItem(it), 0);
      const prevAmount = prev.reduce((s, it) => s + profitOfItem(it), 0);
      const delta = prevAmount !== 0
        ? Math.round((amount - prevAmount) / Math.abs(prevAmount) * 100)
        : (amount > 0 ? 100 : 0);
      return { label, amount, count: cur.length, delta };
    };
    return [
      build(t.statToday, r.today, r.yesterday),
      build(t.statWeek, r.week, r.lastWeek),
      build(t.statMonth, r.month, r.lastMonth),
      build(t.statYear, r.year, r.lastYear),
    ];
  }, [sold, t]);

  /* ---- profit margin section ---- */
  const profitData = useMemo(() => {
    const now = new Date();
    const r = periodRanges(now);
    const range = profitPeriod === 'week' ? r.week : profitPeriod === 'month' ? r.month : r.year;
    const soldInPeriod = sold.filter(it => inRange(it.sold_date, range[0], range[1]));

    const byCat = {};
    CATEGORIES.forEach(c => { byCat[c] = { sale: 0, cost: 0, exp: 0, profit: 0 }; });
    soldInPeriod.forEach(it => {
      const b = byCat[it.category] || (byCat[it.category] = { sale: 0, cost: 0, exp: 0, profit: 0 });
      b.sale += (it.sold_price || 0);
      b.cost += (it.buy_price || 0);
      b.exp += (it.expenses || 0);
      b.profit += profitOfItem(it);
    });

    const filtered = profitFilterCat === 'all' ? soldInPeriod : soldInPeriod.filter(it => it.category === profitFilterCat);
    const compSale = filtered.reduce((s, it) => s + (it.sold_price || 0), 0);
    const compCost = filtered.reduce((s, it) => s + (it.buy_price || 0), 0);
    const compExp = filtered.reduce((s, it) => s + (it.expenses || 0), 0);
    const compProfit = compSale - compCost - compExp;
    const marginPct = compSale ? ((compProfit / compSale) * 100).toFixed(1) : '0.0';

    const segments = [
      { key: 'bought', label: t.segBought, value: compCost, color: 'var(--seg-bought)' },
      { key: 'expenses', label: t.segExpenses, value: compExp, color: 'var(--seg-expenses)' },
      { key: 'profit', label: t.segProfit, value: Math.max(compProfit, 0), color: 'var(--seg-profit)' },
    ].map(seg => ({
      ...seg,
      flexGrow: Math.max(compSale ? (seg.value / compSale * 100) : 0, 0.0001),
      valueText: fmtKr(seg.value),
    }));

    const maxProfitMargin = Math.max(1, ...CATEGORIES.map(c => Math.abs(byCat[c].profit)));
    const bars = CATEGORIES.map(c => ({
      cat: c,
      label: catLabel(c, lang),
      amountText: fmtKr(byCat[c].profit),
      pct: Math.max(2, Math.round(Math.abs(byCat[c].profit) / maxProfitMargin * 100)) + '%',
      selected: profitFilterCat === 'all' || profitFilterCat === c,
    }));

    return { compProfit, marginPct, segments, bars };
  }, [sold, profitFilterCat, profitPeriod, lang, t]);

  /* ---- inventory summary ---- */
  const invData = useMemo(() => {
    const breakdown = CATEGORIES.map(c => ({
      cat: c,
      count: available.filter(i => i.category === c).length,
      value: available.filter(i => i.category === c).reduce((s, i) => s + (i.buy_price || 0), 0),
    })).filter(b => b.count > 0);
    const invCount = available.length;
    const invTotalVal = available.reduce((s, i) => s + (i.buy_price || 0), 0);

    const now = new Date();
    const yStart = periodRanges(now).year;
    const soldThisYear = sold.filter(it => inRange(it.sold_date, yStart[0], yStart[1]));
    const saleSum = soldThisYear.reduce((s, it) => s + (it.sold_price || 0), 0);
    const costSum = soldThisYear.reduce((s, it) => s + (it.buy_price || 0), 0);
    const markupFactor = costSum > 0 ? saleSum / costSum : 1;
    const potentialProfit = Math.round(invTotalVal * (markupFactor - 1));

    let acc = 0;
    const pieStops = breakdown.map(b => {
      const start = invCount ? (acc / invCount * 360) : 0;
      acc += b.count;
      const end = invCount ? (acc / invCount * 360) : 0;
      return `${CATEGORY_COLORS[b.cat]} ${start.toFixed(2)}deg ${end.toFixed(2)}deg`;
    });
    const pieBg = invCount ? `conic-gradient(${pieStops.join(', ')})` : 'var(--cream-card)';

    return { breakdown, invCount, invTotalVal, markupFactor, potentialProfit, pieBg };
  }, [available, sold]);

  /* ---- turnover ---- */
  const turnData = useMemo(() => {
    const overdueCount = available.filter(it => daysBetween(it.date_bought, todayISO()) > 30).length;
    const avgDays = list => list.length ? Math.round(list.reduce((s, i) => s + daysBetween(i.date_bought, i.sold_date), 0) / list.length) : 0;
    const overallAvg = avgDays(sold);
    const bars = CATEGORIES.map(c => {
      const list = sold.filter(i => i.category === c);
      return { label: catLabel(c, lang), days: avgDays(list), has: list.length > 0 };
    });
    const maxDays = Math.max(1, overallAvg, ...bars.map(b => b.days));
    return { overdueCount, overallAvg, bars, maxDays };
  }, [available, sold, lang]);

  const markupFactorText = invData.markupFactor.toLocaleString(lang === 'no' ? 'nb-NO' : 'en-US', { maximumFractionDigits: 2 });

  return (
    <>
      <div className="stat-row">
        {statCards.map(s => (
          <div className="stat-card" key={s.label}>
            <div className="label">{s.label}</div>
            <div className="stat-amount-row">
              <div className="big-num serif">{fmtKr(s.amount)}</div>
              <div className={`delta-pill ${s.delta >= 0 ? 'delta-up' : 'delta-down'}`}>
                {Math.abs(s.delta)}%
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ transform: s.delta >= 0 ? 'none' : 'rotate(90deg)' }}>
                  <path d="M7 17L17 7" /><path d="M8 7h9v9" />
                </svg>
              </div>
            </div>
            <div className="stat-count">{t.itemsLabel(s.count)}</div>
          </div>
        ))}
      </div>

      <div className="section-title">{t.profitMarginTitle}</div>
      <div className="profit-card">
        <div className="profit-head">
          <div>
            <div className="label">{t.totalProfitMargin}</div>
            <div className="big-num serif">{fmtKr(profitData.compProfit)}</div>
            <div className="profit-margin-text">{t.marginOfSales(profitData.marginPct)}</div>
          </div>
          <div className="profit-controls">
            <select value={profitFilterCat} onChange={e => setProfitFilterCat(e.target.value)}>
              <option value="all">{t.allCategories}</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{catLabel(c, lang)}</option>)}
            </select>
            <div className="period-toggle">
              <button className={profitPeriod === 'week' ? 'active' : ''} onClick={() => setProfitPeriod('week')}>{t.statWeek}</button>
              <button className={profitPeriod === 'month' ? 'active' : ''} onClick={() => setProfitPeriod('month')}>{t.statMonth}</button>
              <button className={profitPeriod === 'year' ? 'active' : ''} onClick={() => setProfitPeriod('year')}>{t.statYear}</button>
            </div>
          </div>
        </div>

        <div className="comp-section">
          <div className="label">{t.segSaleTotal}</div>
          <div className="comp-bar">
            {profitData.segments.map(seg => (
              <div key={seg.key} className="comp-seg" title={`${seg.label}: ${seg.valueText}`} style={{ flex: `${seg.flexGrow} 1 0%`, background: seg.color }} />
            ))}
          </div>
          <div className="comp-legend">
            {profitData.segments.map(seg => (
              <div className="comp-legend-item" key={seg.key}>
                <span className="comp-legend-swatch" style={{ background: seg.color }} />
                <span className="comp-legend-label">{seg.label}</span>
                <span className="comp-legend-value">{seg.valueText}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="vbar-row">
          {profitData.bars.map(b => (
            <div className="vbar-col" key={b.cat}>
              <div className="vbar-amount" style={{ color: b.selected ? 'var(--navy)' : 'var(--label)' }}>{b.amountText}</div>
              <div className="vbar-fill" style={{ height: b.pct, background: b.selected ? 'var(--navy)' : '#DFD9C8' }} />
              <div className="vbar-label" style={{ color: b.selected ? 'var(--navy)' : 'var(--label)', fontWeight: b.selected ? 600 : 500 }}>{b.label}</div>
            </div>
          ))}
        </div>
        <div className="profit-formula">{t.profitFormula}</div>
      </div>

      <div className="section-title">{t.invTitle}</div>
      <div className="inv-grid">
        <div className="inv-totals-card">
          <div>
            <div className="label">{t.totalInv}</div>
            <div className="big-num serif">{fmtKr(invData.invTotalVal)}</div>
            <div className="inv-count-text">{t.itemsLabel(invData.invCount)}</div>
          </div>
          <div className="pie-row">
            <div className="pie-chart" style={{ background: invData.pieBg }} />
            <div className="pie-legend">
              {invData.breakdown.map(b => (
                <div className="pie-legend-item" key={b.cat}>
                  <span className="pie-legend-swatch" style={{ background: CATEGORY_COLORS[b.cat] }} />
                  <span className="pie-legend-label">{catLabel(b.cat, lang)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="side-cards">
          <div className="side-card card-potential">
            <div className="label" style={{ color: 'var(--potential-fg)' }}>{t.potProfit}</div>
            <div className="big-num serif">{fmtKr(invData.potentialProfit)}</div>
            <div className="side-card-caption" style={{ color: 'var(--potential-fg)' }}>{t.potProfitFormula}</div>
          </div>
          <div className="side-card card-white">
            <div className="label">{t.markup}</div>
            <div className="big-num serif">{markupFactorText} x</div>
          </div>
        </div>
      </div>

      <div className="section-title">{t.turnTitle}</div>
      <div className="turn-grid">
        <div className="turn-card turn-warn-card">
          <div className="turn-warn-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9v4" /><path d="M12 17h.01" /><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="turn-warn-text serif">{t.turnWarn(turnData.overdueCount)}</div>
            <button className="pill-btn" style={{ marginTop: 14 }} onClick={onViewOverdue}>{t.viewOverdue}</button>
          </div>
        </div>
        <div className="turn-card">
          <div className="label">{t.turnTitle}</div>
          <div className="turn-avg serif">{turnData.overallAvg} {t.days}</div>
          <div className="vbar-row">
            {turnData.bars.map(b => (
              <div className="vbar-col" key={b.label}>
                <div className="turn-bar-day">{b.has ? b.days : '—'}</div>
                <div className="vbar-fill turn-bar-fill" style={{ height: `${Math.round((b.has ? b.days : 0) / turnData.maxDays * 100)}%` }} />
                <div className="turn-bar-label">{b.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
