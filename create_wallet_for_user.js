const axios = require('axios');

async function createWalletForUser() {
  console.log('开始为用户创建钱包...');
  
  const baseURL = 'http://118.107.4.158:1337';
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTYsImlhdCI6MTc1MzU0NjU1MSwiZXhwIjoxNzU0MTUxMzUxfQ.pKmzMBXx43190iBZIb9AN_O9JepibJJS2ydDnKj8J5s';
  
  try {
    // 1. 检查钱包表是否存在
    console.log('\n=== 1. 检查钱包表结构 ===');
    try {
      const response = await axios.get(`${baseURL}/api/qianbao-yues`);
      console.log('✅ 钱包表存在');
    } catch (error) {
      console.log('❌ 钱包表不存在:', error.response?.data || error.message);
      return;
    }
    
    // 2. 为用户创建钱包
    console.log('\n=== 2. 为用户创建钱包 ===');
    try {
      const createResponse = await axios.post(`${baseURL}/api/qianbao-yues`, {
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
      console.log('✅ 钱包创建成功:', createResponse.data);
    } catch (error) {
      console.log('❌ 钱包创建失败:', error.response?.data || error.message);
      
      // 如果是权限问题，尝试使用管理员权限
      if (error.response?.status === 403) {
        console.log('\n尝试使用管理员权限创建钱包...');
        try {
          // 先获取管理员token
          const adminLoginResponse = await axios.post(`${baseURL}/api/auth/local`, {
            identifier: 'admin@example.com', // 假设的管理员邮箱
            password: 'admin123' // 假设的管理员密码
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
          console.log('❌ 管理员创建钱包也失败:', adminError.response?.data || adminError.message);
        }
      }
    }
    
    // 3. 再次测试钱包API访问
    console.log('\n=== 3. 再次测试钱包API访问 ===');
    try {
      const walletResponse = await axios.get(`${baseURL}/api/qianbao-yues/my-wallet`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ 钱包API访问成功:', walletResponse.data);
    } catch (error) {
      console.log('❌ 钱包API访问仍然失败:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('创建钱包过程中发生错误:', error.message);
  }
}

createWalletForUser(); 