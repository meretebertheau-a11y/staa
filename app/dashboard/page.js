'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { T } from './i18n';
import { IconChart, IconPlus, IconList } from './icons';
import LagerView from './LagerView';
import { SingleAddView, BulkImportView } from './AddView';
import AnalyseView from './AnalyseView';

export default function Dashboard() {
  const supabase = createClient();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [lang, setLang] = useState('no');
  const [view, setView] = useState('lager');
  const [addMode, setAddMode] = useState('single');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [fCategory, setFCategory] = useState('');
  const [fBrand, setFBrand] = useState('');
  const [fColor, setFColor] = useState('');
  const [filterOverdue, setFilterOverdue] = useState(false);

  const t = T[lang];

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/login'); return; }
      setUser(data.user);
    });
  }, []);

  const loadItems = useCallback(async () => {
    const { data, error } = await supabase.from('items').select('*').order('date_bought', { ascending: false });
    if (!error) setItems(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { if (user) loadItems(); }, [user, loadItems]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  function viewOverdueInventory() {
    setView('lager');
    setFilterOverdue(true);
  }

  if (!user) return null;

  return (
    <div className="app">
      <div className="header">
        <div>
          <div className="brand">
            <div className="mark">≈</div>
            <h1>Ståa</h1>
          </div>
          <div className="tag">{t.tagline}</div>
        </div>
        <div className="header-right">
          <div className="lang-toggle">
            <button className={lang === 'no' ? 'active' : ''} onClick={() => setLang('no')}>NO</button>
            <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
          </div>
          <span className="user-email desktop-only">{user.email}</span>
          <button className="logout-btn" onClick={handleLogout}>{t.logout}</button>
        </div>
      </div>

      <div className="nav-pill">
        <button className={view === 'analyse' ? 'active' : ''} onClick={() => setView('analyse')}><IconChart />{t.navAnalytics}</button>
        <button className={view === 'add' ? 'active' : ''} onClick={() => setView('add')}><IconPlus />{t.navAdd}</button>
        <button className={view === 'lager' ? 'active' : ''} onClick={() => setView('lager')}><IconList />{t.navStock}</button>
      </div>

      {loading ? null : view === 'lager' && (
        <LagerView
          items={items} supabase={supabase} lang={lang} onChange={loadItems}
          search={search} setSearch={setSearch}
          fCategory={fCategory} setFCategory={setFCategory}
          fBrand={fBrand} setFBrand={setFBrand}
          fColor={fColor} setFColor={setFColor}
          filterOverdue={filterOverdue} setFilterOverdue={setFilterOverdue}
        />
      )}
      {view === 'add' && (
        <>
          <div className="nav-pill" style={{ marginBottom: 16 }}>
            <button className={addMode === 'single' ? 'active' : ''} onClick={() => setAddMode('single')}>{t.subSingle}</button>
            <button className={addMode === 'bulk' ? 'active' : ''} onClick={() => setAddMode('bulk')}>{t.subBulk}</button>
          </div>
          {addMode === 'single'
            ? <SingleAddView supabase={supabase} lang={lang} onSaved={() => { loadItems(); setView('lager'); }} onSwitchToBulk={() => setAddMode('bulk')} />
            : <BulkImportView supabase={supabase} lang={lang} user={user} items={items} onSaved={() => { loadItems(); setView('lager'); }} />}
        </>
      )}
      {view === 'analyse' && <AnalyseView items={items} lang={lang} onViewOverdue={viewOverdueInventory} />}
    </div>
  );
}
