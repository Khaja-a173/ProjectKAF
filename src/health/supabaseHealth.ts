import { sb } from '../lib/supabase';

export async function checkMenuHealth(): Promise<boolean> {
  const { error } = await sb.from('menu_items').select('id').limit(1);
  return !error;
}