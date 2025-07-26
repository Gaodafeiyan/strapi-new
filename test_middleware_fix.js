const axios = require('axios');

async function testMiddlewareFix() {
  console.log('开始测试中间件修复...');
  
  const baseURL = 'http://118.107.4.158:1337';
  
  try {
    // 1. 登录获取JWT
    console.log('\n=== 登录获取JWT ===');
    const loginResponse = await axios.post(`${baseURL}/api/auth/local`, {
      identifier: 'testfix1753545338886',
      password: '123456'
    });
    
    const jwt = loginResponse.data.jwt;
    console.log('JWT获取成功:', jwt ? '是' : '否');
    
    if (!jwt) {
      console.error('❌ 登录失败，无法获取JWT');
      return;
    }
    
    // 2. 测试钱包API
    console.log('\n=== 测试钱包API ===');
    try {
      const walletResponse = await axios.get(`${baseURL}/api/qianbao-yues/my-wallet`, {
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });
      
      console.log('✅ 钱包API访问成功:', walletResponse.data);
    } catch (error) {
      console.log('❌ 钱包API访问失败:', error.response?.data || error.message);
      
      // 3. 检查用户信息
      console.log('\n=== 检查用户信息 ===');
      try {
        const userResponse = await axios.get(`${baseURL}/api/users/me`, {
          headers: {
            'Authorization': `Bearer ${jwt}`
          }
        });
        
        console.log('用户信息:', userResponse.data);
      } catch (userError) {
        console.log('获取用户信息失败:', userError.response?.data || userError.message);
      }
    }
    
  } catch (error) {
    console.error('测试失败:', error.response?.data || error.message);
  }
}

testMiddlewareFix(); 