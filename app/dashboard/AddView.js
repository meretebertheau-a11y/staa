'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import {
  CATEGORIES, catLabel, T, todayISO, resizeImage, emptyDraft,
  normalizeCategory, normalizeDate, fieldLabels, guessMapping, makeKey
} from './i18n';

function ModeToggle({ t, addMode, setAddMode }) {
  return (
    <div className="nav-pill" style={{ marginBottom: 22 }}>
      <button className={addMode === 'single' ? 'active' : ''} onClick={() => setAddMode('single')}>{t.subSingle}</button>
      <button className={addMode === 'bulk' ? 'active' : ''} onClick={() => setAddMode('bulk')}>{t.subBulk}</button>
    </div>
  );
}

export function SingleAddView({ supabase, lang, addMode, setAddMode, onSaved, onSwitchToBulk }) {
  const t = T[lang];
  const [itemPhoto, setItemPhoto] = useState(null);
  const [receiptPhoto, setReceiptPhoto] = useState(null);
  const [draft, setDraft] = useState(emptyDraft());
  const [aiFilled, setAiFilled] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function onPickItem(e) {
    if (e.target.files[0]) setItemPhoto(await resizeImage(e.target.files[0], 700));
  }
  async function onPickReceipt(e) {
    if (e.target.files[0]) setReceiptPhoto(await resizeImage(e.target.files[0], 700));
  }

  async function analyze() {
    if (!itemPhoto) { setError(t.uploadItemPhotoFirst); return; }
    setError(''); setAiLoading(true);
    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemImage: itemPhoto, receiptImage: receiptPhoto })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDraft(d => ({
        ...d, ...data,
        category: normalizeCategory(data.category),
        buyPrice: data.buyPrice ? String(data.buyPrice) : '',
        vat: data.vat ? String(data.vat) : ''
      }));
      setAiFilled(true);
    } catch (e) {
      setError(t.couldNotReadData);
    }
    setAiLoading(false);
  }

  async function save() {
    if (!draft.name) { alert(t.giveName); return; }
    setSaving(true);
    setError('');
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      setError(t.notLoggedIn);
      setSaving(false);
      return;
    }

    let photoUrl = null;
    if (itemPhoto) {
      try {
        const blob = await (await fetch(itemPhoto)).blob();
        const path = `${user.id}/${Date.now()}.jpg`;
        const { error: upErr } = await supabase.storage.from('item-photos').upload(path, blob, { contentType: 'image/jpeg' });
        if (upErr) {
          setError(t.photoUploadFailed + upErr.message + t.savedWithoutPhoto);
        } else {
          const { data: pub } = supabase.storage.from('item-photos').getPublicUrl(path);
          photoUrl = pub.publicUrl;
        }
      } catch (e) {
        setError(t.photoUploadFailed + e.message + t.savedWithoutPhoto);
      }
    }

    const { error: insertErr } = await supabase.from('items').insert({
      user_id: user.id,
      name: draft.name,
      category: draft.category,
      brand: draft.brand,
      size: draft.size,
      color: draft.color,
      buy_price: parseFloat(draft.buyPrice) || 0,
      vat: parseFloat(draft.vat) || 0,
      expenses: parseFloat(draft.expenses) || 0,
      potential_sale_price: parseFloat(draft.potentialSalePrice) || 0,
      date_bought: draft.dateBought,
      status: 'available',
      photo_url: photoUrl
    });

    setSaving(false);

    if (insertErr) {
      setError(t.saveFailed + insertErr.message);
      return;
    }

    setItemPhoto(null); setReceiptPhoto(null); setDraft(emptyDraft()); setAiFilled(false);
    onSaved();
  }

  return (
    <>
      <div className="card card-navy">
        <ModeToggle t={t} addMode={addMode} setAddMode={setAddMode} />
        <div className="label" style={{ color: 'rgba(255,255,255,.6)' }}>{t.addTitle}</div>
        <div style={{ fontSize: 14, lineHeight: 1.55, color: 'rgba(255,255,255,.6)', marginBottom: 22 }}>{t.addSubtitle}</div>

        <label className="drop">
          {itemPhoto ? <img src={itemPhoto} alt="" /> : <div className="hint">{t.addDropHint}</div>}
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={onPickItem} />
        </label>
        {error && <div className="msg msg-error">{error}</div>}

        <div className="composer-actions">
          <div className="chip-row" style={{ margin: 0 }}>
            <button className="chip-outline" onClick={() => document.getElementById('gl-item-file')?.click()}>{t.chipPhoto}</button>
            <button className={`chip-outline${receiptPhoto ? ' chip-filled' : ''}`} onClick={() => document.getElementById('gl-receipt-file')?.click()}>{t.chipReceipt}</button>
            <button className="chip-outline" onClick={onSwitchToBulk}>{t.chipBulk}</button>
          </div>
          <button className="btn-ai" onClick={analyze} disabled={aiLoading}>
            {aiLoading ? t.analyzing : t.analyzeAI}
          </button>
        </div>
        <input id="gl-item-file" type="file" accept="image/*" style={{ display: 'none' }} onChange={onPickItem} />
        <input id="gl-receipt-file" type="file" accept="image/*" style={{ display: 'none' }} onChange={onPickReceipt} />
      </div>

      <div className="divider-label" style={{ marginTop: 22 }}>{t.orManual}</div>

      <div className="card card-white">
        <div className="label">{t.details} {aiFilled && <span className="ai-badge">{t.aiFilled}</span>}</div>
        <div className="grid2">
          <div className="field"><label>{t.fName}</label><input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} /></div>
          <div className="field"><label>{t.fCategory}</label>
            <select value={draft.category} onChange={e => setDraft({ ...draft, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c} value={c}>{catLabel(c, lang)}</option>)}
            </select>
          </div>
          <div className="field"><label>{t.fBrand}</label><input value={draft.brand} onChange={e => setDraft({ ...draft, brand: e.target.value })} /></div>
          <div className="field"><label>{t.fSize}</label><input value={draft.size} onChange={e => setDraft({ ...draft, size: e.target.value })} /></div>
          <div className="field"><label>{t.fColor}</label><input value={draft.color} onChange={e => setDraft({ ...draft, color: e.target.value })} /></div>
          <div className="field"><label>{t.fCost}</label><input type="number" placeholder="0" value={draft.buyPrice} onChange={e => setDraft({ ...draft, buyPrice: e.target.value })} /></div>
          <div className="field"><label>{t.fMargin}</label><input type="number" placeholder="0" value={draft.vat} onChange={e => setDraft({ ...draft, vat: e.target.value })} /></div>
          <div className="field"><label>{t.fExpenses}</label><input type="number" placeholder="0" value={draft.expenses} onChange={e => setDraft({ ...draft, expenses: e.target.value })} /></div>
          <div className="field"><label>{t.fPotentialSale}</label><input type="number" placeholder="0" value={draft.potentialSalePrice} onChange={e => setDraft({ ...draft, potentialSalePrice: e.target.value })} /></div>
          <div className="field"><label>{t.fDate}</label><input type="date" value={draft.dateBought} onChange={e => setDraft({ ...draft, dateBought: e.target.value })} /></div>
        </div>
        <button className="btn btn-dark" onClick={save} disabled={saving}>{saving ? t.saving : t.saveBtn}</button>
      </div>
    </>
  );
}

export function BulkImportView({ supabase, lang, user, items, addMode, setAddMode, onSaved }) {
  const t = T[lang];
  const FIELD_LABELS = fieldLabels(t);
  const [step, setStep] = useState('upload');
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState([]);
  const [rawRows, setRawRows] = useState([]);
  const [mapping, setMapping] = useState({});
  const [draftItems, setDraftItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function onFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setError('');
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array', cellDates: true });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      if (rows.length === 0) { setError(t.noRowsFound); return; }
      const hdrs = Object.keys(rows[0]);
      setHeaders(hdrs);
      setRawRows(rows);
      setMapping(guessMapping(hdrs));
      setStep('map');
    } catch (err) {
      setError(t.fileReadError);
    }
  }

  function buildPreview() {
    const existingKeys = new Set((items || []).map(i => makeKey({
      name: i.name, brand: i.brand, size: i.size, buyPrice: i.buy_price, dateBought: i.date_bought
    })));
    const seenBatch = new Set();
    const numField = (row, col) => {
      if (!col) return '';
      const raw = row[col];
      if (raw === '' || raw == null) return '';
      const n = parseFloat(raw);
      return isNaN(n) ? '' : n;
    };
    const built = rawRows.map(row => {
      const d = {
        name: mapping.name ? String(row[mapping.name] || '') : '',
        category: normalizeCategory(mapping.category ? row[mapping.category] : ''),
        brand: mapping.brand ? String(row[mapping.brand] || '') : '',
        size: mapping.size ? String(row[mapping.size] || '') : '',
        color: mapping.color ? String(row[mapping.color] || '') : '',
        buyPrice: numField(row, mapping.buyPrice),
        vat: numField(row, mapping.vat),
        expenses: numField(row, mapping.expenses),
        potentialSalePrice: numField(row, mapping.potentialSalePrice),
        dateBought: mapping.dateBought ? normalizeDate(row[mapping.dateBought]) : todayISO()
      };
      const key = makeKey(d);
      let dup = null;
      if (existingKeys.has(key)) dup = 'existing';
      else if (seenBatch.has(key)) dup = 'batch';
      seenBatch.add(key);
      return { ...d, _dup: dup, _include: !dup };
    });
    setDraftItems(built);
    setStep('preview');
  }

  function toggleInclude(idx) {
    setDraftItems(prev => prev.map((d, i) => i === idx ? { ...d, _include: !d._include } : d));
  }

  function updateDraft(idx, field, value) {
    setDraftItems(prev => prev.map((d, i) => i === idx ? { ...d, [field]: value } : d));
  }

  function removeDraft(idx) {
    setDraftItems(prev => prev.filter((_, i) => i !== idx));
  }

  async function importAll() {
    const toImport = draftItems.filter(d => d._include);
    if (toImport.length === 0) { alert(t.noneSelectedForImport); return; }
    const missingNames = toImport.some(d => !d.name);
    if (missingNames) { alert(t.allNeedName); return; }
    setSaving(true);
    const rows = toImport.map(d => ({
      user_id: user.id,
      name: d.name,
      category: d.category,
      brand: d.brand,
      size: d.size,
      color: d.color,
      buy_price: parseFloat(d.buyPrice) || 0,
      vat: parseFloat(d.vat) || 0,
      expenses: parseFloat(d.expenses) || 0,
      potential_sale_price: parseFloat(d.potentialSalePrice) || 0,
      date_bought: d.dateBought,
      status: 'available'
    }));
    const { error } = await supabase.from('items').insert(rows);
    setSaving(false);
    if (error) { setError(t.importFailed + error.message); return; }
    onSaved();
  }

  if (step === 'upload') {
    return (
      <div className="card card-navy">
        <ModeToggle t={t} addMode={addMode} setAddMode={setAddMode} />
        <div className="label" style={{ color: 'rgba(255,255,255,.75)' }}>{t.bulkTitle}</div>
        <label className="drop">
          <div className="hint">{fileName || t.bulkHint}</div>
          <input type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={onFile} />
        </label>
        {error && <div className="msg msg-error">{error}</div>}
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.62)', marginTop: 16, lineHeight: 1.6 }}>
          {t.firstRowHint}
        </div>
      </div>
    );
  }

  if (step === 'map') {
    return (
      <div className="card card-white">
        <ModeToggle t={t} addMode={addMode} setAddMode={setAddMode} />
        <div className="label">{t.matchColumns(fileName)}</div>
        <div className="grid2">
          {Object.keys(FIELD_LABELS).map(field => (
            <div className="field" key={field}>
              <label>{FIELD_LABELS[field]}</label>
              <select value={mapping[field] || ''} onChange={e => setMapping({ ...mapping, [field]: e.target.value })}>
                <option value="">{t.notInUse}</option>
                {headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          <button className="btn btn-outline" onClick={() => setStep('upload')}>{t.back}</button>
          <button className="btn btn-dark" onClick={buildPreview}>{t.buildPreviewBtn(rawRows.length)}</button>
        </div>
      </div>
    );
  }

  const dupCount = draftItems.filter(d => d._dup).length;
  const includedCount = draftItems.filter(d => d._include).length;

  return (
    <div className="card card-white">
      <ModeToggle t={t} addMode={addMode} setAddMode={setAddMode} />
      <div className="label">{t.checkAndEdit(includedCount, draftItems.length)}</div>
      {dupCount > 0 && (
        <div className="msg" style={{ background: 'var(--cream-card)', padding: '10px 14px', borderRadius: 10, marginBottom: 12 }}>
          {t.possibleDup(dupCount)}
        </div>
      )}
      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>{t.include}</th><th>{t.fName}</th><th>{t.fCategory}</th><th>{t.fBrand}</th><th>{t.fSize}</th><th>{t.fColor}</th>
              <th>{t.fCost}</th><th>{t.fMargin}</th><th>{t.fExpenses}</th><th>{t.fPotentialSale}</th><th>{t.fDate}</th><th></th><th></th>
            </tr>
          </thead>
          <tbody>
            {draftItems.map((d, idx) => (
              <tr key={idx} style={d._dup ? { background: 'var(--cream-card)' } : undefined}>
                <td><input type="checkbox" checked={d._include} onChange={() => toggleInclude(idx)} /></td>
                <td><input value={d.name} onChange={e => updateDraft(idx, 'name', e.target.value)} style={{ width: 120 }} /></td>
                <td>
                  <select value={d.category} onChange={e => updateDraft(idx, 'category', e.target.value)}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{catLabel(c, lang)}</option>)}
                  </select>
                </td>
                <td><input value={d.brand} onChange={e => updateDraft(idx, 'brand', e.target.value)} style={{ width: 90 }} /></td>
                <td><input value={d.size} onChange={e => updateDraft(idx, 'size', e.target.value)} style={{ width: 60 }} /></td>
                <td><input value={d.color} onChange={e => updateDraft(idx, 'color', e.target.value)} style={{ width: 80 }} /></td>
                <td><input type="number" placeholder="0" value={d.buyPrice} onChange={e => updateDraft(idx, 'buyPrice', e.target.value)} style={{ width: 80 }} /></td>
                <td><input type="number" placeholder="0" value={d.vat} onChange={e => updateDraft(idx, 'vat', e.target.value)} style={{ width: 70 }} /></td>
                <td><input type="number" placeholder="0" value={d.expenses} onChange={e => updateDraft(idx, 'expenses', e.target.value)} style={{ width: 70 }} /></td>
                <td><input type="number" placeholder="0" value={d.potentialSalePrice} onChange={e => updateDraft(idx, 'potentialSalePrice', e.target.value)} style={{ width: 80 }} /></td>
                <td><input type="date" value={d.dateBought} onChange={e => updateDraft(idx, 'dateBought', e.target.value)} /></td>
                <td>{d._dup === 'existing' && <span className="badge badge-open">{t.existsInStock}</span>}
                    {d._dup === 'batch' && <span className="badge badge-open">{t.dupInFile}</span>}</td>
                <td><button className="row-btn" onClick={() => removeDraft(idx)}>{t.remove}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {error && <div className="msg msg-error">{error}</div>}
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <button className="btn btn-outline" onClick={() => setStep('map')}>{t.back}</button>
        <button className="btn btn-dark" onClick={importAll} disabled={saving || includedCount === 0}>
          {saving ? t.importing : t.importBtn(includedCount)}
        </button>
      </div>
    </div>
  );
}
