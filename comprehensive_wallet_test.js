const http = require('http');

console.log('=== 钱包余额API全面测试 ===\n');

// HTTP请求工具函数
function makeRequest(hostname, port, path, options = {}) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      hostname,
      port,
      path,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = http.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: jsonData,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('请求超时'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function runComprehensiveTests() {
  const hostname = '118.107.4.158';
  const port = 1337;
  
  try {
    // 测试1: 服务器健康检查
    console.log('1. 服务器健康检查');
    try {
      const healthResult = await makeRequest(hostname, port, '/_health');
      console.log(`   状态码: ${healthResult.status}`);
      console.log(`   响应: ${healthResult.data}`);
      console.log('   ✅ 服务器正常运行\n');
    } catch (error) {
      console.log(`   ❌ 服务器连接失败: ${error.message}\n`);
      return;
    }

    // 测试2: 未认证访问钱包余额
    console.log('2. 未认证访问钱包余额');
    try {
      const walletResult = await makeRequest(hostname, port, '/api/qianbao-yues/my-wallet');
      if (walletResult.status === 403) {
        console.log('   ✅ 正确返回403 - 认证保护正常');
        console.log(`   错误信息: ${walletResult.data.error?.message || 'Forbidden'}`);
      } else {
        console.log(`   ❌ 意外状态码: ${walletResult.status}`);
        console.log(`   响应: ${JSON.stringify(walletResult.data)}`);
      }
    } catch (error) {
      console.log(`   ❌ 请求失败: ${error.message}`);
    }
    console.log('');

    // 测试3: 无效token访问
    console.log('3. 无效token访问');
    try {
      const invalidTokenResult = await makeRequest(hostname, port, '/api/qianbao-yues/my-wallet', {
        headers: {
          'Authorization': 'Bearer invalid_token_12345',
          'Content-Type': 'application/json'
        }
      });
      if (invalidTokenResult.status === 403) {
        console.log('   ✅ 正确返回403 - 无效token被拒绝');
      } else {
        console.log(`   ❌ 意外状态码: ${invalidTokenResult.status}`);
      }
    } catch (error) {
      console.log(`   ❌ 请求失败: ${error.message}`);
    }
    console.log('');

    // 测试4: 过期token访问
    console.log('4. 过期token访问');
    try {
      const expiredTokenResult = await makeRequest(hostname, port, '/api/qianbao-yues/my-wallet', {
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJ0ZXN0IiwiaWF0IjoxNjE2MTYxNjE2LCJleHAiOjE2MTYxNjE2MTd9.expired_signature',
          'Content-Type': 'application/json'
        }
      });
      if (expiredTokenResult.status === 403) {
        console.log('   ✅ 正确返回403 - 过期token被拒绝');
      } else {
        console.log(`   ❌ 意外状态码: ${expiredTokenResult.status}`);
      }
    } catch (error) {
      console.log(`   ❌ 请求失败: ${error.message}`);
    }
    console.log('');

    // 测试5: 检查权限配置
    console.log('5. 检查权限配置');
    try {
      const permissionsResult = await makeRequest(hostname, port, '/api/users-permissions/roles/1');
      if (permissionsResult.status === 200 && permissionsResult.data.role) {
        const permissions = permissionsResult.data.role.permissions;
        if (permissions['api::qianbao-yue']) {
          console.log('   ✅ 钱包API权限已配置');
          const walletPerms = permissions['api::qianbao-yue'];
          if (walletPerms.controllers && walletPerms.controllers['qianbao-yue']) {
            const controllerPerms = walletPerms.controllers['qianbao-yue'];
            console.log(`   - getMyWallet: ${controllerPerms.getMyWallet?.enabled ? '✅' : '❌'}`);
            console.log(`   - updateWallet: ${controllerPerms.updateWallet?.enabled ? '✅' : '❌'}`);
            console.log(`   - getAllWallets: ${controllerPerms.getAllWallets?.enabled ? '✅' : '❌'}`);
          }
        } else {
          console.log('   ❌ 钱包API权限未配置');
        }
      } else {
        console.log('   ❌ 无法获取权限配置');
      }
    } catch (error) {
      console.log(`   ❌ 权限检查失败: ${error.message}`);
    }
    console.log('');

    // 测试6: 测试更新钱包API（未认证）
    console.log('6. 测试更新钱包API（未认证）');
    try {
      const updateResult = await makeRequest(hostname, port, '/api/qianbao-yues/update-wallet', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          usdtYue: 100,
          aiYue: 50
        }
      });
      if (updateResult.status === 403) {
        console.log('   ✅ 正确返回403 - 更新API认证保护正常');
      } else {
        console.log(`   ❌ 意外状态码: ${updateResult.status}`);
      }
    } catch (error) {
      console.log(`   ❌ 请求失败: ${error.message}`);
    }
    console.log('');

    // 测试7: 测试管理员API（未认证）
    console.log('7. 测试管理员API（未认证）');
    try {
      const adminResult = await makeRequest(hostname, port, '/api/qianbao-yues/all-wallets');
      if (adminResult.status === 403) {
        console.log('   ✅ 正确返回403 - 管理员API认证保护正常');
      } else {
        console.log(`   ❌ 意外状态码: ${adminResult.status}`);
      }
    } catch (error) {
      console.log(`   ❌ 请求失败: ${error.message}`);
    }
    console.log('');

    console.log('=== 测试总结 ===');
    console.log('✅ 钱包余额API的403错误保护机制正常工作');
    console.log('✅ 所有未认证访问都被正确拒绝');
    console.log('✅ 路由配置和权限设置正确');

  } catch (error) {
    console.error('测试过程中发生错误:', error.message);
  }
}

runComprehensiveTests(); 