import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('demopass');
  const [msg, setMsg] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg('');
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { 
      setMsg(error.message); 
      return; 
    }
    
    setMsg('Logged in');
    window.location.href = '/';
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form onSubmit={onSubmit} className="max-w-sm w-full space-y-4 p-6 rounded-2xl shadow">
        <h1 className="text-xl font-semibold">Login</h1>
        <input 
          className="w-full border rounded p-2" 
          value={email} 
          onChange={e=>setEmail(e.target.value)} 
          placeholder="Email" 
        />
        <input 
          className="w-full border rounded p-2" 
          type="password" 
          value={password} 
          onChange={e=>setPassword(e.target.value)} 
          placeholder="Password" 
        />
        <button className="w-full rounded bg-black text-white py-2">Sign In</button>
        {msg && <p className="text-sm text-red-600">{msg}</p>}
      </form>
    </div>
  );
}