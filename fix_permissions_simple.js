const axios = require('axios');

async function fixPermissionsSimple() {
  console.log('开始简化权限修复...');
  
  const baseURL = 'http://118.107.4.158:1337';
  
  try {
    // 1. 获取authenticated角色
    console.log('\n=== 获取Authenticated角色 ===');
    const rolesResponse = await axios.get(`${baseURL}/api/users-permissions/roles`);
    const authenticatedRole = rolesResponse.data.roles.find(role => role.type === 'authenticated');
    
    if (!authenticatedRole) {
      console.error('❌ 未找到authenticated角色');
      return;
    }
    
    console.log('Authenticated角色:', authenticatedRole);
    
    // 2. 只更新钱包API权限
    console.log('\n=== 更新钱包API权限 ===');
    const updatedPermissions = {
      ...authenticatedRole.permissions,
      'api::qianbao-yue': {
        controllers: {
          'qianbao-yue': {
            getMyWallet: { enabled: true, policy: '' },
            updateWallet: { enabled: true, policy: '' },
            getAllWallets: { enabled: false, policy: '' }
          }
        }
      }
    };
    
    // 3. 更新角色权限
    console.log('\n=== 更新角色权限 ===');
    const updateResponse = await axios.put(`${baseURL}/api/users-permissions/roles/${authenticatedRole.id}`, {
      name: authenticatedRole.name,
      description: authenticatedRole.description,
      type: authenticatedRole.type,
      permissions: updatedPermissions
    });
    
    console.log('权限更新成功:', updateResponse.data);
    
    // 4. 测试钱包API
    console.log('\n=== 测试钱包API ===');
    const testJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTYsImlhdCI6MTc1MzU0NTMzOSwiZXhwIjoxNzU0MTUwMTM5fQ.hQQ2TZUYkIhEJcPPYKDmNZXOnAcyY1P6evK4WeqzQpo';
    
    try {
      const walletResponse = await axios.get(`${baseURL}/api/qianbao-yues/my-wallet`, {
        headers: {
          'Authorization': `Bearer ${testJWT}`
        }
      });
      
      console.log('✅ 钱包API访问成功:', walletResponse.data);
    } catch (error) {
      console.log('❌ 钱包API访问失败:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('修复失败:', error.response?.data || error.message);
  }
}

fixPermissionsSimple(); 