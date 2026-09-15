import { createClient } from '@supabase/supabase-js';

// Credenciais vêm do ambiente. Este arquivo já teve a SENHA do admin escrita
// aqui dentro, num repositório público — troque essa senha no Supabase.
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD;

if (!SUPABASE_URL || !SUPABASE_KEY || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Defina VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, SEED_ADMIN_EMAIL e SEED_ADMIN_PASSWORD.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testUpload() {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });

  if (authError) {
    console.error('Login error:', authError.message);
    return;
  }
  
  // Create a dummy text file to upload
  const fileContent = new Blob(['Hello World!'], { type: 'text/plain' });
  const fileName = `test_file_${Date.now()}.txt`;
  
  console.log('Trying to upload to product-images...');
  const { data, error } = await supabase.storage.from('product-images').upload(fileName, fileContent);
  
  if (error) {
    console.error('Upload Error:', error);
  } else {
    console.log('Upload Success!', data);
  }
}

testUpload();
