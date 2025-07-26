const axios = require('axios');

async function testAPI() {
  console.log('开始测试API...');
  
  try {
    // 1. 注册新用户
    console.log('\n=== 注册新用户 ===');
    const registerResponse = await axios.post('http://118.107.4.158:1337/api/auth/invite-register', {
      username: 'testfix',
      email: 'testfix@example.com',
      password: '123456',
      inviteCode: 'HVVSRS4BS'
    });
    
    console.log('注册响应:', registerResponse.data);
    
    if (registerResponse.data.success) {
      // 2. 登录
      console.log('\n=== 登录 ===');
      const loginResponse = await axios.post('http://118.107.4.158:1337/api/auth/local', {
        identifier: 'testfix',
        password: '123456'
      });
      
      console.log('登录响应:', loginResponse.data);
      
      if (loginResponse.data.jwt) {
        // 3. 测试钱包API
        console.log('\n=== 测试钱包API ===');
        try {
          const walletResponse = await axios.get('http://118.107.4.158:1337/api/qianbao-yues/my-wallet', {
            headers: {
              'Authorization': `Bearer ${loginResponse.data.jwt}`
            }
          });
          
          console.log('钱包响应:', walletResponse.data);
          console.log('✅ 钱包API访问成功！');
        } catch (error) {
          console.log('❌ 钱包API访问失败:', error.response?.data || error.message);
        }
      }
    }
    
  } catch (error) {
    console.log('❌ 测试失败:', error.response?.data || error.message);
  }
}

testAPI(); 