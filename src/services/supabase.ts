import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://ddtpwvzavogotugpjgdq.supabase.co';

const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_PSFyi8NNMoOM-2azt5VseA_ikYXL2HG';

export const supabase = createClient(supabaseUrl, supabaseKey);
