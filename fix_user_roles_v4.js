const strapi = require('@strapi/strapi');

async function fixUserRolesV4() {
  console.log('开始修复历史用户的role_id...');
  
  try {
    // 初始化Strapi
    const app = await strapi().load();
    
    // 1. 获取authenticated角色
    console.log('\n=== 获取Authenticated角色 ===');
    const [authenticatedRole] = await app.entityService.findMany('plugin::users-permissions.role', {
      filters: { type: 'authenticated' },
      limit: 1
    });
    
    if (!authenticatedRole) {
      console.error('❌ 未找到authenticated角色');
      await app.destroy();
      return;
    }
    
    console.log('Authenticated角色:', authenticatedRole);
    
    // 2. 获取所有没有role_id的用户
    console.log('\n=== 获取没有role_id的用户 ===');
    const usersWithoutRole = await app.entityService.findMany('plugin::users-permissions.user', {
      filters: { role: null }
    });
    
    console.log(`找到 ${usersWithoutRole.length} 个没有role_id的用户`);
    
    if (usersWithoutRole.length === 0) {
      console.log('✅ 所有用户都有role_id，无需修复');
      await app.destroy();
      return;
    }
    
    // 3. 为每个用户设置role_id
    console.log('\n=== 开始修复用户role_id ===');
    for (const user of usersWithoutRole) {
      try {
        await app.entityService.update('plugin::users-permissions.user', user.id, {
          data: {
            role: authenticatedRole.id
          }
        });
        
        console.log(`✅ 为用户 ${user.username} (ID: ${user.id}) 设置role_id成功`);
      } catch (error) {
        console.log(`❌ 为用户 ${user.username} (ID: ${user.id}) 设置role_id失败:`, error.message);
      }
    }
    
    console.log('\n=== role_id修复完成 ===');
    
    // 4. 验证修复结果
    console.log('\n=== 验证修复结果 ===');
    const usersAfterFix = await app.entityService.findMany('plugin::users-permissions.user', {
      filters: { role: null }
    });
    
    console.log(`修复后还有 ${usersAfterFix.length} 个用户没有role_id`);
    
    // 关闭Strapi
    await app.destroy();
    
  } catch (error) {
    console.error('脚本执行失败:', error.message);
  }
}

fixUserRolesV4(); 