// 使用SQLite数据库替代Supabase
import { supabase as sqliteSupabase } from './sqlite';

// 导出SQLite版本的supabase客户端
export const supabase = sqliteSupabase;

// 导出一个函数，保持与原来的使用方式兼容
export function getSupabase() {
  return supabase;
}

console.log('Using SQLite database instead of Supabase');
