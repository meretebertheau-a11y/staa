'use client';

import { useState } from 'react';
import { CATEGORIES, catLabel, todayISO, T } from './i18n';
import { IconTrash } from './icons';

export default function EditModal({ item, lang, supabase, onClose, onSaved }) {
  const t = T[lang];
  const [draft, setDraft] = useState({
    name: item.name || '',
    category: item.category,
    color: item.color || '',
    brand: item.brand || '',
    size: item.size || '',
    cost: item.buy_price ? String(item.buy_price) : '',
    vat: item.vat ? String(item.vat) : '',
    expenses: item.expenses ? String(item.expenses) : '',
    potentialSalePrice: item.potential_sale_price ? String(item.potential_sale_price) : '',
    status: item.status,
    sale: item.sold_price ? String(item.sold_price) : ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function set(k, v) { setDraft(d => ({ ...d, [k]: v })); }

  async function save() {
    if (!draft.name) { alert(t.giveName); return; }
    setSaving(true);
    setError('');
    const isSold = draft.status === 'sold';
    const { error: err } = await supabase.from('items').update({
      name: draft.name,
      category: draft.category,
      color: draft.color,
      brand: draft.brand,
      size: draft.size,
      buy_price: parseFloat(draft.cost) || 0,
      vat: parseFloat(draft.vat) || 0,
      expenses: parseFloat(draft.expenses) || 0,
      potential_sale_price: parseFloat(draft.potentialSalePrice) || 0,
      status: draft.status,
      sold_price: isSold ? (parseFloat(draft.sale) || 0) : null,
      sold_date: isSold ? (item.sold_date || todayISO()) : null
    }).eq('id', item.id);
    setSaving(false);
    if (err) { setError(t.saveFailed + err.message); return; }
    onSaved();
  }

  async function del() {
    if (!confirm(t.confirmDelete)) return;
    setSaving(true);
    const { error: err } = await supabase.from('items').delete().eq('id', item.id);
    setSaving(false);
    if (err) { setError(t.deleteFailed + err.message); return; }
    onSaved();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{t.editTitle}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="grid2">
          <div className="modal-field"><label>{t.fName}</label>
            <input value={draft.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div className="modal-field"><label>{t.fCategory}</label>
            <select value={draft.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{catLabel(c, lang)}</option>)}
            </select>
          </div>
          <div className="modal-field"><label>{t.fColor}</label>
            <input value={draft.color} onChange={e => set('color', e.target.value)} />
          </div>
          <div className="modal-field"><label>{t.fBrand}</label>
            <input value={draft.brand} onChange={e => set('brand', e.target.value)} />
          </div>
          <div className="modal-field"><label>{t.fSize}</label>
            <input value={draft.size} onChange={e => set('size', e.target.value)} />
          </div>
          <div className="modal-field"><label>{t.fCost}</label>
            <input type="number" placeholder="0" value={draft.cost} onChange={e => set('cost', e.target.value)} />
          </div>
          <div className="modal-field"><label>{t.fMargin}</label>
            <input type="number" placeholder="0" value={draft.vat} onChange={e => set('vat', e.target.value)} />
          </div>
          <div className="modal-field"><label>{t.fExpenses}</label>
            <input type="number" placeholder="0" value={draft.expenses} onChange={e => set('expenses', e.target.value)} />
          </div>
          <div className="modal-field"><label>{t.fPotentialSale}</label>
            <input type="number" placeholder="0" value={draft.potentialSalePrice} onChange={e => set('potentialSalePrice', e.target.value)} />
          </div>
          <div className="modal-field"><label>{t.fStatus}</label>
            <select value={draft.status} onChange={e => set('status', e.target.value)}>
              <option value="available">{t.optAvailable}</option>
              <option value="sold">{t.optSold}</option>
            </select>
          </div>
          <div className="modal-field"><label>{t.fSale}</label>
            <input type="number" placeholder="0" value={draft.sale} onChange={e => set('sale', e.target.value)} disabled={draft.status !== 'sold'} />
          </div>
        </div>

        {error && <div className="msg msg-error">{error}</div>}

        <div className="modal-footer">
          <button className="modal-delete" onClick={del} disabled={saving}><IconTrash />{t.del}</button>
          <div className="modal-actions">
            <button className="pill-btn" onClick={onClose} disabled={saving}>{t.cancel}</button>
            <button className="pill-btn-dark" onClick={save} disabled={saving}>{saving ? t.saving : t.save}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
