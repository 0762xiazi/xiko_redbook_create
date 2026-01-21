import { createClient } from '@supabase/supabase-js';

// 导出一个函数，让调用者在需要时初始化客户端
export function getSupabase() {
  // Initialize Supabase client with service role key for full permissions
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Validate Supabase configuration
  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL environment variable is missing');
  }

  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is missing');
  }

  console.log('Creating Supabase client with URL:', supabaseUrl.substring(0, 20) + '...');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, { 
      auth: { 
        autoRefreshToken: false, 
        persistSession: false 
      } 
    });
    
    console.log('Supabase client created successfully:', typeof supabase);
    console.log('Supabase client has from method:', typeof supabase.from === 'function');
    
    return supabase;
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    throw error;
  }
}

// 同时导出一个默认的客户端实例，确保与原来的使用方式兼容
export const supabase = getSupabase();