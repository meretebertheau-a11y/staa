'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }
      router.push('/dashboard');
      router.refresh();
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }
      setInfo('Konto opprettet. Sjekk e-posten din for å bekrefte, logg deretter inn.');
      setMode('signin');
      setLoading(false);
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="mark">≈</div>
        <h1>Grønn <em>Lager</em></h1>
        <div className="sub">Lagerstyring for vintage</div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>E-post</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="deg@butikk.no" />
          </div>
          <div className="field">
            <label>Passord</label>
            <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Vent...' : mode === 'signin' ? 'Logg inn' : 'Opprett konto'}
          </button>
        </form>

        {error && <div className="msg msg-error">{error}</div>}
        {info && <div className="msg">{info}</div>}

        <div style={{ marginTop: 16, fontSize: 11, opacity: 0.7 }}>
          {mode === 'signin' ? (
            <span>Ingen konto? <a href="#" onClick={e => { e.preventDefault(); setMode('signup'); }} style={{ color: '#fff' }}>Opprett en</a></span>
          ) : (
            <span>Har du konto? <a href="#" onClick={e => { e.preventDefault(); setMode('signin'); }} style={{ color: '#fff' }}>Logg inn</a></span>
          )}
        </div>
      </div>
    </div>
  );
}
