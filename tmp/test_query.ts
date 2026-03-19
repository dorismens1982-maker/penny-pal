import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
  console.log('Testing voice_feedback query...');
  
  // 1. Test basic fetch
  const { data: basicData, error: basicError, count } = await supabase
    .from('voice_feedback')
    .select('*', { count: 'exact' });
    
  if (basicError) {
    console.error('Basic fetch error:', basicError);
  } else {
    console.log(`Basic fetch success. Count: ${count}`);
    console.log('Sample data:', basicData?.slice(0, 1));
  }

  // 2. Test join fetch
  const { data: joinData, error: joinError } = await supabase
    .from('voice_feedback')
    .select('*, profiles(preferred_name)')
    .limit(5);

  if (joinError) {
    console.error('Join fetch error:', joinError);
  } else {
    console.log('Join fetch success:', joinData);
  }
}

testQuery();
