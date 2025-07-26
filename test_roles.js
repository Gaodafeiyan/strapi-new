const axios = require('axios');

async function testRoles() {
  console.log('开始测试Strapi角色配置...');
  
  const baseURL = 'http://118.107.4.158:1337';
  
  try {
    // 1. 检查角色列表
    console.log('\n=== 检查角色列表 ===');
    const rolesResponse = await axios.get(`${baseURL}/api/users-permissions/roles`);
    console.log('角色列表:', rolesResponse.data);
    
    // 2. 检查authenticated角色
    console.log('\n=== 检查authenticated角色 ===');
    const authRoleResponse = await axios.get(`${baseURL}/api/users-permissions/roles/2`);
    console.log('Authenticated角色:', authRoleResponse.data);
    
    // 3. 检查admin角色
    console.log('\n=== 检查admin角色 ===');
    const adminRoleResponse = await axios.get(`${baseURL}/api/users-permissions/roles/1`);
    console.log('Admin角色:', adminRoleResponse.data);
    
  } catch (error) {
    console.error('测试失败:', error.response?.data || error.message);
  }
}

testRoles(); 