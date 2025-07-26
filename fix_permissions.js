const axios = require('axios');

async function fixPermissions() {
  console.log('开始修复钱包API权限...');
  
  const baseURL = 'http://118.107.4.158:1337';
  
  try {
    // 1. 获取authenticated角色
    console.log('\n=== 获取Authenticated角色 ===');
    const authRoleResponse = await axios.get(`${baseURL}/api/users-permissions/roles/1`);
    const role = authRoleResponse.data.role;
    
    console.log('当前角色:', role.name, 'ID:', role.id);
    
    // 2. 更新钱包API权限
    console.log('\n=== 更新钱包API权限 ===');
    const updatedPermissions = {
      ...role.permissions,
      'api::qianbao-yue': {
        controllers: {
          'qianbao-yue': {
            getMyWallet: { enabled: true, policy: '' },
            updateWallet: { enabled: true, policy: '' },
            getAllWallets: { enabled: false, policy: '' }
          }
        },
        routes: {
          'qianbao-yues': {
            routes: [
              {
                method: 'GET',
                path: '/qianbao-yues/my-wallet',
                handler: 'qianbao-yue.getMyWallet',
                config: { auth: { scope: ['authenticated'] } }
              },
              {
                method: 'PUT',
                path: '/qianbao-yues/update-wallet',
                handler: 'qianbao-yue.updateWallet',
                config: { auth: { scope: ['authenticated'] } }
              }
            ]
          }
        }
      }
    };
    
    // 3. 更新角色权限
    console.log('\n=== 更新角色权限 ===');
    const updateResponse = await axios.put(`${baseURL}/api/users-permissions/roles/1`, {
      name: role.name,
      description: role.description,
      type: role.type,
      permissions: updatedPermissions
    });
    
    console.log('权限更新成功:', updateResponse.data);
    
    // 4. 测试权限
    console.log('\n=== 测试权限配置 ===');
    const testResponse = await axios.get(`${baseURL}/api/users-permissions/roles/1`);
    console.log('更新后的权限:', testResponse.data.role.permissions['api::qianbao-yue']);
    
  } catch (error) {
    console.error('修复失败:', error.response?.data || error.message);
  }
}

fixPermissions(); 