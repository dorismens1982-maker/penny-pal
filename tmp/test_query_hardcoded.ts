import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ypouwhelcyzyhjrcldfl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlwb3V3aGVsY3l6eWhqcmNsZGZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODc3NDIsImV4cCI6MjA3MzI2Mzc0Mn0.L6gF8wD5aufj3iACmGwXwAArxt5hcYmPjd-NZYlaofs';

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
    console.log('Sample data:', basicData);
  }

  // 2. Test join fetch
  console.log('\nTesting join fetch with profiles...');
  const { data: joinData, error: joinError } = await supabase
    .from('voice_feedback')
    .select('*, profiles(preferred_name)')
    .limit(5);

  if (joinError) {
    console.error('Join fetch error:', joinError);
  } else {
    console.log('Join fetch success:', JSON.stringify(joinData, null, 2));
  }
}

testQuery();
