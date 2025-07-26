const axios = require('axios');

async function checkWalletPermissions() {
  console.log('开始检查钱包API权限配置...');
  
  const baseURL = 'http://118.107.4.158:1337';
  
  try {
    // 检查authenticated角色的钱包权限
    console.log('\n=== 检查Authenticated角色的钱包权限 ===');
    const authRoleResponse = await axios.get(`${baseURL}/api/users-permissions/roles/1`);
    const permissions = authRoleResponse.data.role.permissions;
    
    console.log('钱包API权限:', permissions['api::qianbao-yue']);
    
    // 检查钱包API的具体权限
    if (permissions['api::qianbao-yue']) {
      const walletPerms = permissions['api::qianbao-yue'];
      console.log('钱包API权限详情:');
      console.log('- controllers:', walletPerms.controllers);
      console.log('- routes:', walletPerms.routes);
    }
    
  } catch (error) {
    console.error('检查失败:', error.response?.data || error.message);
  }
}

checkWalletPermissions(); 