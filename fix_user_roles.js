const axios = require('axios');

async function fixUserRoles() {
  console.log('开始修复用户角色分配...');
  
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
    
    // 2. 获取所有用户
    console.log('\n=== 获取所有用户 ===');
    const usersResponse = await axios.get(`${baseURL}/api/users`);
    const users = usersResponse.data;
    
    console.log(`找到 ${users.length} 个用户`);
    
    // 3. 修复没有角色的用户
    for (const user of users) {
      console.log(`\n检查用户: ${user.username} (ID: ${user.id})`);
      
      if (!user.role) {
        console.log(`❌ 用户 ${user.username} 没有角色，正在修复...`);
        
        try {
          // 更新用户角色
          const updateResponse = await axios.put(`${baseURL}/api/users/${user.id}`, {
            role: authenticatedRole.id
          });
          
          console.log(`✅ 用户 ${user.username} 角色修复成功`);
        } catch (error) {
          console.error(`❌ 用户 ${user.username} 角色修复失败:`, error.response?.data || error.message);
        }
      } else {
        console.log(`✅ 用户 ${user.username} 已有角色: ${user.role.id}`);
      }
    }
    
    // 4. 验证修复结果
    console.log('\n=== 验证修复结果 ===');
    const verifyResponse = await axios.get(`${baseURL}/api/users`);
    const verifiedUsers = verifyResponse.data;
    
    for (const user of verifiedUsers) {
      if (user.role) {
        console.log(`✅ 用户 ${user.username} 有角色: ${user.role.id}`);
      } else {
        console.log(`❌ 用户 ${user.username} 仍然没有角色`);
      }
    }
    
  } catch (error) {
    console.error('修复失败:', error.response?.data || error.message);
  }
}

fixUserRoles(); 