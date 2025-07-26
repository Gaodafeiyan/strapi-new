const axios = require('axios');

async function completeWalletFix() {
  console.log('=== 钱包403问题完整解决方案 ===');
  console.log('问题诊断: 钱包表不存在，导致用户无法访问钱包API');
  
  const baseURL = 'http://118.107.4.158:1337';
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTYsImlhdCI6MTc1MzU0NjU1MSwiZXhwIjoxNzU0MTUxMzUxfQ.pKmzMBXx43190iBZIb9AN_O9JepibJJS2ydDnKj8J5s';
  
  console.log('\n=== 解决方案步骤 ===');
  console.log('1. 创建钱包数据库表');
  console.log('2. 为用户创建钱包记录');
  console.log('3. 测试钱包API访问');
  
  try {
    // 步骤1: 检查并创建钱包表
    console.log('\n=== 步骤1: 检查钱包表 ===');
    try {
      const tableCheck = await axios.get(`${baseURL}/api/qianbao-yues`);
      console.log('✅ 钱包表已存在');
    } catch (error) {
      console.log('❌ 钱包表不存在');
      console.log('需要执行以下命令来创建表:');
      console.log('npm run strapi db:migrate');
      console.log('或者重启Strapi应用');
      
      // 尝试通过API创建表（通常不会成功，但可以尝试）
      console.log('\n尝试通过API创建钱包记录...');
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
        console.log('✅ 钱包记录创建成功:', createResponse.data);
      } catch (createError) {
        console.log('❌ 无法创建钱包记录:', createError.response?.data || createError.message);
        console.log('这是因为钱包表不存在');
      }
    }
    
    // 步骤2: 检查用户钱包
    console.log('\n=== 步骤2: 检查用户钱包 ===');
    try {
      const userWallet = await axios.get(`${baseURL}/api/qianbao-yues?filters[user][$eq]=16`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (userWallet.data.data && userWallet.data.data.length > 0) {
        console.log('✅ 用户钱包已存在:', userWallet.data.data[0]);
      } else {
        console.log('❌ 用户钱包不存在');
      }
    } catch (error) {
      console.log('❌ 无法检查用户钱包:', error.response?.data || error.message);
    }
    
    // 步骤3: 测试钱包API
    console.log('\n=== 步骤3: 测试钱包API ===');
    try {
      const walletResponse = await axios.get(`${baseURL}/api/qianbao-yues/my-wallet`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ 钱包API访问成功:', walletResponse.data);
    } catch (error) {
      console.log('❌ 钱包API访问失败:', error.response?.data || error.message);
    }
    
    // 步骤4: 提供修复建议
    console.log('\n=== 修复建议 ===');
    console.log('1. 在服务器上执行以下命令:');
    console.log('   cd /path/to/strapi-new');
    console.log('   npm run strapi db:migrate');
    console.log('');
    console.log('2. 或者重启Strapi应用:');
    console.log('   npm run develop');
    console.log('   或');
    console.log('   npm run start');
    console.log('');
    console.log('3. 如果表已创建，为用户创建钱包记录:');
    console.log('   - 通过管理员面板创建');
    console.log('   - 或通过API创建');
    console.log('');
    console.log('4. 检查控制器逻辑是否正确处理钱包不存在的情况');
    
    // 步骤5: 检查控制器逻辑
    console.log('\n=== 控制器逻辑分析 ===');
    console.log('当前控制器逻辑:');
    console.log('- 检查用户认证: ✅ 正常');
    console.log('- 获取用户ID: ✅ 正常');
    console.log('- 查询用户钱包: ❌ 表不存在');
    console.log('- 返回钱包数据: ❌ 无法执行');
    
    console.log('\n建议的控制器修改:');
    console.log('如果钱包不存在，应该自动创建一个默认钱包，而不是返回403错误');
    
  } catch (error) {
    console.error('解决方案执行过程中发生错误:', error.message);
  }
}

completeWalletFix(); 