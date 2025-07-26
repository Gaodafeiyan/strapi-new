const axios = require('axios');

async function testWalletFix() {
  console.log('=== 测试钱包修复效果 ===');
  
  const baseURL = 'http://118.107.4.158:1337';
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTYsImlhdCI6MTc1MzU0NjU1MSwiZXhwIjoxNzU0MTUxMzUxfQ.pKmzMBXx43190iBZIb9AN_O9JepibJJS2ydDnKj8J5s';
  
  try {
    // 测试钱包API访问
    console.log('\n=== 测试钱包API访问 ===');
    try {
      const walletResponse = await axios.get(`${baseURL}/api/qianbao-yues/my-wallet`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ 钱包API访问成功!');
      console.log('响应数据:', walletResponse.data);
      
      if (walletResponse.data.success && walletResponse.data.data) {
        console.log('✅ 钱包数据正常');
        console.log('- USDT余额:', walletResponse.data.data.usdtYue);
        console.log('- AI余额:', walletResponse.data.data.aiYue);
        console.log('- AI Token余额:', walletResponse.data.data.aiTokenBalances);
      }
    } catch (error) {
      console.log('❌ 钱包API访问失败:', error.response?.data || error.message);
      console.log('状态码:', error.response?.status);
      
      if (error.response?.status === 403) {
        console.log('\n403错误仍然存在，可能的原因:');
        console.log('1. 数据库表仍未创建');
        console.log('2. 控制器修改未生效');
        console.log('3. 需要重启Strapi应用');
      }
    }
    
    // 检查钱包表是否存在
    console.log('\n=== 检查钱包表状态 ===');
    try {
      const tableResponse = await axios.get(`${baseURL}/api/qianbao-yues`);
      console.log('✅ 钱包表存在');
      console.log('钱包记录数量:', tableResponse.data.data?.length || 0);
    } catch (error) {
      console.log('❌ 钱包表不存在:', error.response?.data || error.message);
      console.log('需要执行: npm run strapi db:migrate');
    }
    
    // 检查用户钱包
    console.log('\n=== 检查用户钱包 ===');
    try {
      const userWalletResponse = await axios.get(`${baseURL}/api/qianbao-yues?filters[user][$eq]=16`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (userWalletResponse.data.data && userWalletResponse.data.data.length > 0) {
        console.log('✅ 用户钱包存在');
        console.log('钱包ID:', userWalletResponse.data.data[0].id);
      } else {
        console.log('❌ 用户钱包不存在');
      }
    } catch (error) {
      console.log('❌ 无法检查用户钱包:', error.response?.data || error.message);
    }
    
    console.log('\n=== 修复状态总结 ===');
    console.log('如果仍然出现403错误，请按以下步骤操作:');
    console.log('1. 确保数据库表已创建: npm run strapi db:migrate');
    console.log('2. 重启Strapi应用: npm run develop');
    console.log('3. 检查控制器修改是否生效');
    console.log('4. 如果问题持续，可能需要手动创建钱包记录');
    
  } catch (error) {
    console.error('测试过程中发生错误:', error.message);
  }
}

testWalletFix(); 