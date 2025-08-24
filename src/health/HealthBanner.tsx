import { useEffect, useState } from 'react';

export default function HealthBanner() {
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/health/db')
      .then((r) => r.json())
      .then((j) => setOk(!!j.ok))
      .catch(() => setOk(false));
  }, []);

  if (ok === null) return null;
  return (
    <div style={{
      padding: 8,
      fontSize: 12,
      background: ok ? '#e7f7ee' : '#fdecea',
      color: ok ? '#0a6b3d' : '#b71c1c'
    }}>
      Supabase migrations: {ok ? 'OK' : 'FAILED (menu_items not accessible)'}
    </div>
  );
}