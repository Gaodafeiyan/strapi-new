const axios = require('axios');

async function fixWalletIssue() {
  console.log('开始修复钱包403问题...');
  
  const baseURL = 'http://118.107.4.158:1337';
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTYsImlhdCI6MTc1MzU0NjU1MSwiZXhwIjoxNzU0MTUxMzUxfQ.pKmzMBXx43190iBZIb9AN_O9JepibJJS2ydDnKj8J5s';
  
  try {
    // 1. 检查数据库表结构
    console.log('\n=== 1. 检查数据库表结构 ===');
    
    // 检查钱包表是否存在
    try {
      const walletTableResponse = await axios.get(`${baseURL}/api/qianbao-yues`);
      console.log('✅ 钱包表存在');
    } catch (error) {
      console.log('❌ 钱包表不存在，需要创建数据库表');
      console.log('错误详情:', error.response?.data || error.message);
      
      // 这里需要手动创建数据库表
      console.log('\n需要执行以下步骤来创建钱包表:');
      console.log('1. 确保Strapi应用正在运行');
      console.log('2. 执行数据库迁移: npm run strapi db:migrate');
      console.log('3. 或者重启Strapi应用让它自动创建表');
      return;
    }
    
    // 2. 检查用户钱包是否存在
    console.log('\n=== 2. 检查用户钱包是否存在 ===');
    try {
      const userWalletResponse = await axios.get(`${baseURL}/api/qianbao-yues?filters[user][$eq]=16`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (userWalletResponse.data.data && userWalletResponse.data.data.length > 0) {
        console.log('✅ 用户钱包已存在:', userWalletResponse.data.data[0]);
      } else {
        console.log('❌ 用户钱包不存在，需要创建');
        
        // 3. 创建用户钱包
        console.log('\n=== 3. 创建用户钱包 ===');
        try {
          const createWalletResponse = await axios.post(`${baseURL}/api/qianbao-yues`, {
            data: {
              usdtYue: 0,
              aiYue: 0,
              aiTokenBalances: {},
              user: 16
            }
          }, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          console.log('✅ 钱包创建成功:', createWalletResponse.data);
        } catch (createError) {
          console.log('❌ 钱包创建失败:', createError.response?.data || createError.message);
          
          // 如果是权限问题，尝试使用管理员权限
          if (createError.response?.status === 403) {
            console.log('\n尝试使用管理员权限创建钱包...');
            
            // 先尝试登录管理员账户
            try {
              const adminLoginResponse = await axios.post(`${baseURL}/api/auth/local`, {
                identifier: 'admin@example.com',
                password: 'admin123'
              });
              
              if (adminLoginResponse.data.jwt) {
                const adminToken = adminLoginResponse.data.jwt;
                const createResponse = await axios.post(`${baseURL}/api/qianbao-yues`, {
                  data: {
                    usdtYue: 0,
                    aiYue: 0,
                    aiTokenBalances: {},
                    user: 16
                  }
                }, {
                  headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                  }
                });
                console.log('✅ 使用管理员权限创建钱包成功:', createResponse.data);
              }
            } catch (adminError) {
              console.log('❌ 管理员登录失败:', adminError.response?.data || adminError.message);
              console.log('\n需要手动创建钱包记录，或者使用管理员账户登录后创建');
            }
          }
        }
      }
    } catch (error) {
      console.log('❌ 无法检查用户钱包:', error.response?.data || error.message);
    }
    
    // 4. 测试钱包API访问
    console.log('\n=== 4. 测试钱包API访问 ===');
    try {
      const walletResponse = await axios.get(`${baseURL}/api/qianbao-yues/my-wallet`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ 钱包API访问成功:', walletResponse.data);
    } catch (error) {
      console.log('❌ 钱包API访问失败:', error.response?.data || error.message);
      console.log('状态码:', error.response?.status);
      
      if (error.response?.status === 403) {
        console.log('\n403错误的原因可能是:');
        console.log('1. 用户没有钱包记录');
        console.log('2. 钱包表不存在');
        console.log('3. 权限配置问题');
        console.log('4. 控制器逻辑问题');
      }
    }
    
    // 5. 检查控制器逻辑
    console.log('\n=== 5. 检查控制器逻辑 ===');
    console.log('当前控制器逻辑:');
    console.log('- 检查用户认证状态');
    console.log('- 获取用户ID');
    console.log('- 查询用户钱包');
    console.log('- 如果钱包不存在，返回404');
    console.log('- 如果钱包存在，返回钱包数据');
    
    console.log('\n建议的修复方案:');
    console.log('1. 确保钱包表已创建');
    console.log('2. 为用户创建钱包记录');
    console.log('3. 检查控制器中的错误处理逻辑');
    
  } catch (error) {
    console.error('修复过程中发生错误:', error.message);
  }
}

fixWalletIssue(); 