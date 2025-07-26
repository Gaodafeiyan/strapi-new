const fs = require('fs');
const path = require('path');

function fixMiddlewareError() {
  console.log('=== 修复Strapi中间件错误 ===');
  
  try {
    // 1. 检查中间件配置文件
    const middlewaresPath = path.join(__dirname, 'config', 'middlewares.ts');
    console.log('检查中间件配置文件:', middlewaresPath);
    
    if (fs.existsSync(middlewaresPath)) {
      const content = fs.readFileSync(middlewaresPath, 'utf8');
      console.log('当前中间件配置:');
      console.log(content);
      
      // 检查是否包含有问题的中间件
      if (content.includes('plugin::users-permissions.jwt') || content.includes('plugin::users-permissions.permissions')) {
        console.log('\n❌ 发现有问题的中间件配置');
        console.log('需要移除以下中间件:');
        console.log('- plugin::users-permissions.jwt');
        console.log('- plugin::users-permissions.permissions');
        
        // 修复中间件配置
        const fixedContent = content
          .replace(/,\s*'plugin::users-permissions\.jwt'/g, '')
          .replace(/,\s*'plugin::users-permissions\.permissions'/g, '')
          .replace(/'plugin::users-permissions\.jwt',?\s*/g, '')
          .replace(/'plugin::users-permissions\.permissions',?\s*/g, '');
        
        fs.writeFileSync(middlewaresPath, fixedContent);
        console.log('\n✅ 中间件配置已修复');
        console.log('修复后的配置:');
        console.log(fixedContent);
      } else {
        console.log('✅ 中间件配置正常');
      }
    } else {
      console.log('❌ 中间件配置文件不存在');
    }
    
    // 2. 检查插件配置
    const pluginsPath = path.join(__dirname, 'config', 'plugins.ts');
    console.log('\n检查插件配置文件:', pluginsPath);
    
    if (fs.existsSync(pluginsPath)) {
      const content = fs.readFileSync(pluginsPath, 'utf8');
      console.log('当前插件配置:');
      console.log(content);
    } else {
      console.log('❌ 插件配置文件不存在');
    }
    
    // 3. 检查package.json中的依赖
    const packagePath = path.join(__dirname, 'package.json');
    console.log('\n检查package.json:', packagePath);
    
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      console.log('Strapi版本:', packageJson.dependencies['@strapi/strapi']);
      console.log('users-permissions插件版本:', packageJson.dependencies['@strapi/plugin-users-permissions']);
    }
    
    // 4. 提供修复建议
    console.log('\n=== 修复建议 ===');
    console.log('1. 中间件配置已修复');
    console.log('2. 重新启动Strapi应用:');
    console.log('   npm run develop');
    console.log('3. 如果仍有问题，尝试重新安装依赖:');
    console.log('   npm install');
    console.log('4. 清除缓存:');
    console.log('   npm run strapi cache:clean');
    
  } catch (error) {
    console.error('修复过程中发生错误:', error.message);
  }
}

fixMiddlewareError(); 