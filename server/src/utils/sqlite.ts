import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

let db: Database | null = null;

// 初始化SQLite数据库
export async function initDatabase() {
  try {
    // 打开或创建SQLite数据库文件
    db = await open({
      filename: './local-db.sqlite',
      driver: sqlite3.Database
    });
    
    console.log('SQLite database opened successfully');
    
    // 创建表结构
    await createTables();
    
    return db;
  } catch (error) {
    console.error('Error initializing SQLite database:', error);
    throw error;
  }
}

// 创建表结构
async function createTables() {
  if (!db) throw new Error('Database not initialized');
  
  // 创建用户表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  // 创建API密钥表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS user_api_keys (
      id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      service VARCHAR(50) NOT NULL,
      api_key VARCHAR(255) NOT NULL,
      df_api_key VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, service)
    );
  `);
  
  // 创建生成内容表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS user_generations (
      id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      type VARCHAR(50) NOT NULL,
      content TEXT NOT NULL,
      metadata TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  console.log('Database tables created successfully');
}

// 获取数据库实例
export async function getDatabase() {
  if (!db) {
    await initDatabase();
  }
  return db;
}

// 导出默认数据库实例
export const supabase = {
  from: (table: string) => {
    return {
      select: (columns: string) => {
        // 构建WHERE子句
        let whereClause = '';
        let whereValues: any[] = [];
        
        const builder = {
          eq: (column: string, value: any) => {
            whereClause += (whereClause ? ' AND ' : '') + `${column} = ?`;
            whereValues.push(value);
            return builder;
          },
          async single() {
            const database:any = await getDatabase();
            const rows = await database.all(
              `SELECT ${columns} FROM ${table}${whereClause ? ' WHERE ' + whereClause : ''}`,
              whereValues
            );
            return { data: rows[0] || null, error: rows.length === 0 ? { code: 'PGRST116' } : null };
          },
          async execute() {
            const database:any = await getDatabase();
            const rows = await database.all(
              `SELECT ${columns} FROM ${table}${whereClause ? ' WHERE ' + whereClause : ''}`,
              whereValues
            );
            return { data: rows, error: null };
          }
        };
        
        return builder;
      },
      insert: (data: any) => {
        return {
          select: (columns: string) => {
            return {
              async single() {
                const database:any = await getDatabase();
                const keys = Object.keys(data);
                const values = Object.values(data);
                const placeholders = keys.map((_, index) => `?`).join(', ');
                
                await database.run(
                  `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`,
                  values
                );
                
                // 对于使用UUID作为ID的表，我们需要使用不同的方法获取刚插入的行
                // 这里我们通过email来查找刚插入的用户
                let rows = [];
                if (table === 'users' && data.email) {
                  console.log(`Looking up user by email: ${data.email}`);
                  rows = await database.all(
                    `SELECT ${columns} FROM ${table} WHERE email = ?`,
                    data.email
                  );
                  console.log(`Found ${rows.length} users`);
                } else if (table === 'user_api_keys' && data.user_id && data.service) {
                  console.log(`Looking up API key by user_id and service: ${data.user_id}, ${data.service}`);
                  rows = await database.all(
                    `SELECT ${columns} FROM ${table} WHERE user_id = ? AND service = ?`,
                    data.user_id, data.service
                  );
                  console.log(`Found ${rows.length} API keys`);
                } else {
                  // 对于其他表，尝试使用last_insert_rowid()
                  rows = await database.all(
                    `SELECT ${columns} FROM ${table} WHERE id = last_insert_rowid()`
                  );
                }
                
                console.log(`Returning data:`, rows[0] || { ...data });
                return { data: rows[0] || { ...data }, error: null };
              }
            };
          },
          async execute() {
            const database:any = await getDatabase();
            const keys = Object.keys(data);
            const values = Object.values(data);
            const placeholders = keys.map((_, index) => `?`).join(', ');
            
            await database.run(
              `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`,
              values
            );
            
            return { data: { ...data }, error: null };
          }
        };
      },
      update: (data: any) => {
        return {
          eq: (column: string, value: any) => {
            return {
              select: (columns: string) => {
                return {
                  async single() {
                    const database:any = await getDatabase();
                    const keys = Object.keys(data);
                    const setClause = keys.map(key => `${key} = ?`).join(', ');
                    
                    await database.run(
                      `UPDATE ${table} SET ${setClause} WHERE ${column} = ?`,
                      [...Object.values(data), value]
                    );
                    
                    const rows = await database.all(
                      `SELECT ${columns} FROM ${table} WHERE ${column} = ?`,
                      value
                    );
                    
                    return { data: rows[0] || { ...data }, error: null };
                  }
                };
              },
              async execute() {
                const database:any = await getDatabase();
                const keys = Object.keys(data);
                const setClause = keys.map(key => `${key} = ?`).join(', ');
                
                await database.run(
                  `UPDATE ${table} SET ${setClause} WHERE ${column} = ?`,
                  [...Object.values(data), value]
                );
                
                return { data: { ...data }, error: null };
              }
            };
          }
        };
      }
    };
  }
};
