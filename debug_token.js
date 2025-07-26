const axios = require('axios');

async function debugToken() {
  console.log('开始调试JWT token和用户认证...');
  
  const baseURL = 'http://118.107.4.158:1337';
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTYsImlhdCI6MTc1MzU0NjU1MSwiZXhwIjoxNzU0MTUxMzUxfQ.pKmzMBXx43190iBZIb9AN_O9JepibJJS2ydDnKj8J5s';
  
  try {
    // 1. 解码JWT token（不验证签名）
    console.log('\n=== 1. 解码JWT Token ===');
    const tokenParts = token.split('.');
    if (tokenParts.length === 3) {
      const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
      console.log('Token payload:', payload);
      console.log('用户ID:', payload.id);
      console.log('Token过期时间:', new Date(payload.exp * 1000));
      console.log('当前时间:', new Date());
      console.log('Token是否过期:', new Date() > new Date(payload.exp * 1000));
    }
    
    // 2. 检查用户是否存在
    console.log('\n=== 2. 检查用户是否存在 ===');
    try {
      const userResponse = await axios.get(`${baseURL}/api/users/16`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ 用户存在:', userResponse.data);
    } catch (error) {
      console.log('❌ 用户不存在或无法访问:', error.response?.data || error.message);
    }
    
    // 3. 检查用户角色
    console.log('\n=== 3. 检查用户角色 ===');
    try {
      const userResponse = await axios.get(`${baseURL}/api/users/16?populate=role`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('用户角色:', userResponse.data.role);
    } catch (error) {
      console.log('❌ 无法获取用户角色:', error.response?.data || error.message);
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
    }
    
    // 5. 检查用户钱包是否存在
    console.log('\n=== 5. 检查用户钱包是否存在 ===');
    try {
      const walletResponse = await axios.get(`${baseURL}/api/qianbao-yues?filters[user][$eq]=16`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('用户钱包:', walletResponse.data);
    } catch (error) {
      console.log('❌ 无法检查用户钱包:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('调试过程中发生错误:', error.message);
  }
}

debugToken(); 