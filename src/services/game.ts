import { supabase } from './supabase';

export type Direction = 'higher' | 'lower' | 'timeout';

export async function getGameState() {
  const { data, error } = await supabase.rpc('get_game_state');
  if (error) throw error;
  return data;
}

export async function playTurn(direction: Direction) {
  const { data, error } = await supabase.rpc('play_turn', {
    p_direction: direction,
  });
  if (error) throw error;
  return data;
}

export async function bankCurrentPot() {
  const { data, error } = await supabase.rpc('bank_current_pot');
  if (error) throw error;
  return data;
}
