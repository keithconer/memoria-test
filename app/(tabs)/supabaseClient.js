import { createClient } from '@supabase/supabase-js';

// Replace with your own Supabase URL and Anon Key
const SUPABASE_URL = 'https://izlbwdskrcjvzkwkaaod.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6bGJ3ZHNrcmNqdnprd2thYW9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0MzM5MjAsImV4cCI6MjA1MDAwOTkyMH0.UIBxtmj8PDfLf9GBaNdNiyj4h3PxumNzz-gzKccidAw';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


export const uploadImage = async (file, userId) => {
  const filePath = `user_images/${userId}/${file.name}`;
  const { data, error } = await supabase.storage
    .from('memoriabucket')
    .upload(filePath, file);

  if (error) {
    console.error('Error uploading file:', error.message);
    return null;
  }

  const publicUrl = supabase.storage
    .from('memoriabucket')
    .getPublicUrl(filePath).publicURL;

  return publicUrl;
};

export default supabase;
