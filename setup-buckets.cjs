const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function ensureBuckets() {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.error('Error listing buckets:', listError);
    return;
  }
  
  const bucketNames = buckets.map(b => b.name);
  
  if (!bucketNames.includes('product-images')) {
    console.log('Creating product-images bucket (public)...');
    const { error } = await supabase.storage.createBucket('product-images', { public: true });
    if (error) console.error(error);
  } else {
    console.log('product-images bucket already exists.');
  }

  if (!bucketNames.includes('payment-receipts')) {
    console.log('Creating payment-receipts bucket (private)...');
    const { error } = await supabase.storage.createBucket('payment-receipts', { public: false });
    if (error) console.error(error);
  } else {
    console.log('payment-receipts bucket already exists.');
  }
}

ensureBuckets();
