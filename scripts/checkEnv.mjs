const required = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'STRIPE_PUBLIC_KEY',
  'STRIPE_SECRET_KEY',
];
const missing = required.filter(k => !process.env[k]);
if (missing.length) {
  console.error('Missing ENV:', missing.join(', '));
  process.exit(1);
}
console.log('ENV OK');