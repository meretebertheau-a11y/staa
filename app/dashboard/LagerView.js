'use client';

import { useMemo, useState } from 'react';
import { CATEGORIES, catLabel, T, fmtKr, daysBetween, todayISO } from './i18n';
import { IconEdit, IconTrash, IconWarning } from './icons';
import EditModal from './EditModal';

export default function LagerView({
  items, supabase, lang, onChange,
  search, setSearch, fCategory, setFCategory, fBrand, setFBrand, fColor, setFColor,
  filterOverdue, setFilterOverdue
}) {
  const t = T[lang];
  const [sellingId, setSellingId] = useState(null);
  const [sellPrice, setSellPrice] = useState('');
  const [sellDate, setSellDate] = useState(todayISO());
  const [editingItem, setEditingItem] = useState(null);

  const brandOptions = useMemo(() => [...new Set(items.map(i => i.brand).filter(Boolean))].sort(), [items]);
  const colorOptions = useMemo(() => [...new Set(items.map(i => i.color).filter(Boolean))].sort(), [items]);

  const isOverdue = it => it.status === 'available' && daysBetween(it.date_bought, todayISO()) > 30;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter(it => {
      const displayName = lang === 'en' ? (it.name_en || it.name) : it.name;
      if (q && !(`${displayName}`.toLowerCase().includes(q) || `${it.brand}`.toLowerCase().includes(q))) return false;
      if (fCategory && it.category !== fCategory) return false;
      if (fBrand && it.brand !== fBrand) return false;
      if (fColor && it.color !== fColor) return false;
      if (filterOverdue && !isOverdue(it)) return false;
      return true;
    });
  }, [items, search, fCategory, fBrand, fColor, filterOverdue, lang]);

  async function confirmSell(id) {
    await supabase.from('items').update({
      status: 'sold',
      sold_price: parseFloat(sellPrice) || 0,
      sold_date: sellDate
    }).eq('id', id);
    setSellingId(null);
    setSellPrice('');
    onChange();
  }

  const hasFilters = search || fCategory || fBrand || fColor || filterOverdue;

  return (
    <>
      <div className="filters-row">
        <input
          placeholder={t.searchPlaceholder}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select value={fCategory} onChange={e => setFCategory(e.target.value)}>
          <option value="">{t.allCategories}</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{catLabel(c, lang)}</option>)}
        </select>
        <select value={fBrand} onChange={e => setFBrand(e.target.value)}>
          <option value="">{t.allBrands}</option>
          {brandOptions.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <select value={fColor} onChange={e => setFColor(e.target.value)}>
          <option value="">{t.allColors}</option>
          {colorOptions.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button
          className={`chip-filter ${filterOverdue ? 'active' : ''}`}
          onClick={() => setFilterOverdue(!filterOverdue)}
        >
          {t.filterOverdue}
        </button>
        {hasFilters && (
          <button className="row-btn chip-reset" onClick={() => { setSearch(''); setFCategory(''); setFBrand(''); setFColor(''); setFilterOverdue(false); }}>
            {t.resetFilters}
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="table-wrap"><div className="empty">{items.length === 0 ? t.noItemsYet : t.noMatch}</div></div>
      ) : (
        <>
          <div className="table-wrap desktop-only" style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th></th><th>{t.thVare}</th><th>{t.thKat}</th><th>{t.thMerke}</th><th>{t.thStr}</th>
                  <th>{t.thInnkjop}</th><th>{t.thKjopt}</th><th>{t.thStatus}</th><th>{t.thWarn}</th><th>{t.thSalg}</th><th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(it => (
                  <Row
                    key={it.id} it={it} lang={lang} t={t} isOverdue={isOverdue(it)}
                    sellingId={sellingId} setSellingId={setSellingId}
                    sellPrice={sellPrice} setSellPrice={setSellPrice}
                    sellDate={sellDate} setSellDate={setSellDate}
                    confirmSell={confirmSell}
                    onEdit={() => setEditingItem(it)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="item-cards mobile-only">
            {filtered.map(it => (
              <ItemCard
                key={it.id} it={it} lang={lang} t={t} isOverdue={isOverdue(it)}
                onEdit={() => setEditingItem(it)}
                sellingId={sellingId} setSellingId={setSellingId}
                sellPrice={sellPrice} setSellPrice={setSellPrice}
                sellDate={sellDate} setSellDate={setSellDate}
                confirmSell={confirmSell}
              />
            ))}
          </div>
        </>
      )}

      {editingItem && (
        <EditModal
          item={editingItem}
          lang={lang}
          supabase={supabase}
          onClose={() => setEditingItem(null)}
          onSaved={() => { setEditingItem(null); onChange(); }}
        />
      )}
    </>
  );
}

function Row({ it, lang, t, isOverdue, sellingId, setSellingId, sellPrice, setSellPrice, sellDate, setSellDate, confirmSell, onEdit }) {
  const name = lang === 'en' ? (it.name_en || it.name) : it.name;
  const dur = it.status === 'sold'
    ? `${daysBetween(it.date_bought, it.sold_date)} ${t.days}`
    : `${daysBetween(it.date_bought, todayISO())} ${t.days} (${t.listed})`;
  return (
    <>
      <tr>
        <td>{it.photo_url ? <img className="thumb" src={it.photo_url} alt="" /> : <div className="thumb" />}</td>
        <td>
          <div className="item-name">{name}</div>
          {it.color && <div className="item-sub">{it.color}</div>}
        </td>
        <td>{catLabel(it.category, lang)}</td>
        <td>{it.brand || '—'}</td>
        <td>{it.size || '—'}</td>
        <td>{fmtKr(it.buy_price)}</td>
        <td>{it.date_bought}</td>
        <td>
          <span className={`badge ${it.status === 'sold' ? 'badge-sold' : 'badge-open'}`}>{it.status === 'sold' ? t.stSold : t.stAvailable}</span>
          <div className="duration-caption">{dur}</div>
        </td>
        <td>
          {isOverdue ? (
            <span className="badge-warn"><IconWarning />{t.overdueTag}</span>
          ) : <span className="no-warn">—</span>}
        </td>
        <td>{it.status === 'sold' ? fmtKr(it.sold_price) : '—'}</td>
        <td>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
            {it.status !== 'sold' && (
              <button className="row-btn" onClick={() => { setSellingId(sellingId === it.id ? null : it.id); setSellDate(todayISO()); }}>
                {t.markSold}
              </button>
            )}
            <button className="icon-btn" onClick={onEdit}><IconEdit /></button>
          </div>
        </td>
      </tr>
      {sellingId === it.id && (
        <tr className="sell-row">
          <td colSpan={10}>
            <div className="sell-inline">
              <input type="number" placeholder={t.sellPricePlaceholder} value={sellPrice} onChange={e => setSellPrice(e.target.value)} />
              <input type="date" value={sellDate} onChange={e => setSellDate(e.target.value)} />
              <button className="row-btn" onClick={() => confirmSell(it.id)}>{t.confirmSell}</button>
              <button className="row-btn" onClick={() => setSellingId(null)}>{t.cancelSell}</button>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function ItemCard({ it, lang, t, isOverdue, onEdit, sellingId, setSellingId, sellPrice, setSellPrice, sellDate, setSellDate, confirmSell }) {
  const name = lang === 'en' ? (it.name_en || it.name) : it.name;
  const dur = it.status === 'sold'
    ? `${daysBetween(it.date_bought, it.sold_date)} ${t.days}`
    : `${daysBetween(it.date_bought, todayISO())} ${t.days} (${t.listed})`;
  const selling = sellingId === it.id;
  return (
    <div className="item-card">
      {it.photo_url ? <img className="thumb" src={it.photo_url} alt="" /> : <div className="thumb" />}
      <div className="item-card-body">
        <div className="item-card-top">
          <div>
            <div className="item-name">{name}</div>
            {it.color && <div className="item-sub">{it.color}</div>}
          </div>
          <button className="icon-btn" onClick={onEdit}><IconEdit /></button>
        </div>
        <div className="item-card-meta">{catLabel(it.category, lang)} · {it.brand || '—'} · {it.size || '—'}</div>
        <div className="item-card-meta2">{fmtKr(it.buy_price)} · {it.date_bought}</div>
        <div className="item-card-statusrow">
          <div className="item-card-statusleft">
            <span className={`badge ${it.status === 'sold' ? 'badge-sold' : 'badge-open'}`}>{it.status === 'sold' ? t.stSold : t.stAvailable}</span>
            <span className="item-sub">{dur}</span>
            {isOverdue && <span className="badge-warn"><IconWarning />{t.overdueTag}</span>}
          </div>
          <span className="item-card-sale">{it.status === 'sold' ? fmtKr(it.sold_price) : '—'}</span>
        </div>
        {it.status !== 'sold' && !selling && (
          <button className="row-btn" onClick={() => { setSellingId(it.id); setSellDate(todayISO()); }}>{t.markSold}</button>
        )}
        {selling && (
          <div className="sell-inline" style={{ marginTop: 12 }}>
            <input type="number" placeholder={t.sellPricePlaceholder} value={sellPrice} onChange={e => setSellPrice(e.target.value)} />
            <input type="date" value={sellDate} onChange={e => setSellDate(e.target.value)} />
            <button className="row-btn" onClick={() => confirmSell(it.id)}>{t.confirmSell}</button>
            <button className="row-btn" onClick={() => setSellingId(null)}>{t.cancelSell}</button>
          </div>
        )}
      </div>
    </div>
  );
}
