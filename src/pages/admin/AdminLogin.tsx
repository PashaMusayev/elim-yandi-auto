import { useState, type FormEvent } from 'react';
import { Logo } from '@/components/layout/Logo';
import { Button } from '@/components/ui/Button';
import { signIn } from '@/lib/admin';

export const adminInput =
  'w-full rounded-xl bg-white/5 px-4 py-3.5 text-base font-semibold ring-1 ring-white/10 outline-none placeholder:text-white/30 focus:ring-2 focus:ring-ember';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await signIn(email.trim(), password);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Xəta baş verdi');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-dvh place-items-center p-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-3xl bg-coal p-6 ring-1 ring-white/5">
        <Logo />
        <h1 className="text-2xl font-black">Admin giriş</h1>
        <input
          type="email"
          autoComplete="username"
          required
          placeholder="E-poçt"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={adminInput}
        />
        <input
          type="password"
          autoComplete="current-password"
          required
          placeholder="Şifrə"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={adminInput}
        />
        {err && <p className="rounded-lg bg-flame/15 px-3 py-2 text-sm font-semibold text-flame">{err}</p>}
        <Button type="submit" disabled={busy} className="w-full text-lg">
          {busy ? 'Yoxlanılır…' : 'Daxil ol'}
        </Button>
      </form>
    </div>
  );
}
