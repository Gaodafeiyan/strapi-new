const axios = require('axios');

async function fixExistingUsersWallets() {
  console.log('开始为现有用户创建钱包...');
  
  const baseURL = 'http://118.107.4.158:1337';
  
  try {
    // 1. 获取所有用户
    console.log('\n=== 获取所有用户 ===');
    const usersResponse = await axios.get(`${baseURL}/api/users`);
    const users = usersResponse.data;
    console.log(`找到 ${users.length} 个用户`);
    
    // 2. 获取所有钱包
    console.log('\n=== 获取所有钱包 ===');
    const walletsResponse = await axios.get(`${baseURL}/api/qianbao-yues/all-wallets`);
    const wallets = walletsResponse.data.data || [];
    console.log(`找到 ${wallets.length} 个钱包`);
    
    // 3. 找出没有钱包的用户
    const usersWithWallets = wallets.map(wallet => wallet.user?.id).filter(Boolean);
    const usersWithoutWallets = users.filter(user => !usersWithWallets.includes(user.id));
    
    console.log(`\n=== 需要创建钱包的用户 ===`);
    console.log(`有钱包的用户: ${usersWithWallets.length} 个`);
    console.log(`没有钱包的用户: ${usersWithoutWallets.length} 个`);
    
    if (usersWithoutWallets.length === 0) {
      console.log('✅ 所有用户都有钱包，无需创建');
      return;
    }
    
    // 4. 为每个没有钱包的用户创建钱包
    console.log('\n=== 开始创建钱包 ===');
    for (const user of usersWithoutWallets) {
      try {
        const createResponse = await axios.post(`${baseURL}/api/qianbao-yues`, {
          data: {
            usdtYue: 0,
            aiYue: 0,
            aiTokenBalances: {},
            user: user.id
          }
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`✅ 为用户 ${user.username} (ID: ${user.id}) 创建钱包成功`);
      } catch (error) {
        console.log(`❌ 为用户 ${user.username} (ID: ${user.id}) 创建钱包失败:`, error.response?.data || error.message);
      }
    }
    
    console.log('\n=== 钱包创建完成 ===');
    
  } catch (error) {
    console.error('脚本执行失败:', error.response?.data || error.message);
  }
}

fixExistingUsersWallets(); 