const axios = require('axios');

async function fixPermissionsComplete() {
  console.log('开始完整权限修复...');
  
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
    
    // 2. 更新authenticated角色的完整权限
    console.log('\n=== 更新Authenticated角色权限 ===');
    const updatedPermissions = {
      ...authenticatedRole.permissions,
      'api::auth': {
        controllers: {
          'auth': {
            inviteRegister: { enabled: true, policy: '' },
            createFirstAdmin: { enabled: true, policy: '' }
          }
        }
      },
      'api::qianbao-yue': {
        controllers: {
          'qianbao-yue': {
            getMyWallet: { enabled: true, policy: '' },
            updateWallet: { enabled: true, policy: '' },
            getAllWallets: { enabled: false, policy: '' }
          }
        }
      },
      'plugin::users-permissions': {
        controllers: {
          'auth': {
            callback: { enabled: true, policy: '' },
            connect: { enabled: true, policy: '' },
            emailConfirmation: { enabled: true, policy: '' },
            forgotPassword: { enabled: true, policy: '' },
            register: { enabled: true, policy: '' },
            resetPassword: { enabled: true, policy: '' },
            sendEmailConfirmation: { enabled: true, policy: '' }
          },
          'user': {
            me: { enabled: true, policy: '' },
            updateMe: { enabled: true, policy: '' }
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
    
    // 4. 验证权限配置
    console.log('\n=== 验证权限配置 ===');
    const verifyResponse = await axios.get(`${baseURL}/api/users-permissions/roles/${authenticatedRole.id}`);
    const walletPerms = verifyResponse.data.role.permissions['api::qianbao-yue'];
    console.log('钱包API权限:', walletPerms);
    
    // 5. 测试注册和钱包API
    console.log('\n=== 测试完整流程 ===');
    const timestamp = Date.now();
    const testUser = `testfix${timestamp}`;
    
    // 注册
    const registerResponse = await axios.post(`${baseURL}/api/auth/invite-register`, {
      username: testUser,
      email: `${testUser}@example.com`,
      password: '123456',
      inviteCode: 'HVVSRS4BS'
    });
    
    console.log('注册响应:', registerResponse.data);
    
    if (registerResponse.data.success) {
      // 登录
      const loginResponse = await axios.post(`${baseURL}/api/auth/local`, {
        identifier: testUser,
        password: '123456'
      });
      
      console.log('登录响应:', loginResponse.data);
      
      if (loginResponse.data.jwt) {
        // 测试钱包API
        try {
          const walletResponse = await axios.get(`${baseURL}/api/qianbao-yues/my-wallet`, {
            headers: {
              'Authorization': `Bearer ${loginResponse.data.jwt}`
            }
          });
          
          console.log('✅ 钱包API访问成功:', walletResponse.data);
        } catch (error) {
          console.log('❌ 钱包API访问失败:', error.response?.data || error.message);
        }
      }
    }
    
  } catch (error) {
    console.error('修复失败:', error.response?.data || error.message);
  }
}

fixPermissionsComplete(); 