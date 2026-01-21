import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 动态导入 supabase 模块
import('./src/utils/supabase').then(({ supabase }) => {
  // 测试 Supabase 连接
  async function testSupabaseConnection() {
    console.log('开始测试 Supabase 连接...');
    
    try {
      // 尝试执行一个简单的查询
      // 注意：这里假设你已经在 Supabase 中创建了相应的表
      // 如果没有，这个查询可能会失败，但连接测试仍然有效
      const { data, error } = await supabase
        .from('users')
        .select('*');
      
      if (error) {
        console.error('查询错误:', error);
        // 即使查询失败，只要没有抛出异常，连接就是成功的
        console.log('Supabase 连接成功，但查询失败（可能是表不存在）');
      } else {
        console.log('Supabase 连接成功，查询结果:', data);
      }
      
      console.log('测试完成：Supabase 连接正常');
    } catch (error) {
      console.error('Supabase 连接失败:', error);
    }
  }

  // 运行测试
  testSupabaseConnection();
});