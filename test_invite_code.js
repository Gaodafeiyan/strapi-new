const http = require('http');

console.log('=== 邀请码测试 ===\n');
console.log('邀请码: HVVSRS4BS');
console.log('服务器: 118.107.4.158:1337\n');

// HTTP请求工具函数
function makeRequest(hostname, port, path, options = {}) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      hostname,
      port,
      path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
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

async function testInviteCode() {
  const hostname = '118.107.4.158';
  const port = 1337;
  const inviteCode = 'HVVSRS4BS';
  
  try {
    // 测试1: 检查邀请码是否存在
    console.log('1. 检查邀请码是否存在');
    try {
      const checkResult = await makeRequest(hostname, port, `/api/invite-codes?filters[code][$eq]=${inviteCode}`);
      console.log(`   状态码: ${checkResult.status}`);
      if (checkResult.status === 200) {
        const invites = checkResult.data.data || [];
        if (invites.length > 0) {
          console.log(`   ✅ 邀请码存在，找到 ${invites.length} 个记录`);
          console.log(`   邀请码详情:`, JSON.stringify(invites[0], null, 2));
        } else {
          console.log('   ❌ 邀请码不存在');
        }
      } else {
        console.log(`   ❌ 查询失败: ${checkResult.status}`);
      }
    } catch (error) {
      console.log(`   ❌ 请求失败: ${error.message}`);
    }
    console.log('');

    // 测试2: 尝试使用邀请码注册
    console.log('2. 测试邀请码注册功能');
    try {
      const registerResult = await makeRequest(hostname, port, '/api/auth/local/register', {
        method: 'POST',
        body: {
          username: `test_user_${Date.now()}`,
          email: `test_${Date.now()}@example.com`,
          password: 'TestPassword123!',
          inviteCode: inviteCode
        }
      });
      console.log(`   状态码: ${registerResult.status}`);
      if (registerResult.status === 200) {
        console.log('   ✅ 注册成功');
        console.log(`   用户信息:`, JSON.stringify(registerResult.data, null, 2));
      } else if (registerResult.status === 400) {
        console.log('   ⚠️ 注册失败 - 可能是邀请码无效或已使用');
        console.log(`   错误信息:`, JSON.stringify(registerResult.data, null, 2));
      } else {
        console.log(`   ❌ 注册失败: ${registerResult.status}`);
        console.log(`   响应:`, JSON.stringify(registerResult.data, null, 2));
      }
    } catch (error) {
      console.log(`   ❌ 请求失败: ${error.message}`);
    }
    console.log('');

    // 测试3: 检查邀请码使用状态
    console.log('3. 检查邀请码使用状态');
    try {
      const statusResult = await makeRequest(hostname, port, `/api/invite-codes?filters[code][$eq]=${inviteCode}&populate=*`);
      console.log(`   状态码: ${statusResult.status}`);
      if (statusResult.status === 200) {
        const invites = statusResult.data.data || [];
        if (invites.length > 0) {
          const invite = invites[0];
          console.log(`   ✅ 邀请码状态检查成功`);
          console.log(`   - 邀请码: ${invite.attributes?.code}`);
          console.log(`   - 是否已使用: ${invite.attributes?.used ? '是' : '否'}`);
          console.log(`   - 创建时间: ${invite.attributes?.createdAt}`);
          console.log(`   - 使用时间: ${invite.attributes?.usedAt || '未使用'}`);
          console.log(`   - 使用者: ${invite.attributes?.usedBy?.data?.attributes?.username || '无'}`);
        }
      } else {
        console.log(`   ❌ 状态检查失败: ${statusResult.status}`);
      }
    } catch (error) {
      console.log(`   ❌ 请求失败: ${error.message}`);
    }
    console.log('');

    // 测试4: 检查邀请码相关的API端点
    console.log('4. 检查邀请码相关API端点');
    const endpoints = [
      '/api/invite-codes',
      '/api/invite-codes/validate',
      '/api/invite-codes/generate'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const result = await makeRequest(hostname, port, endpoint);
        console.log(`   ${endpoint}: ${result.status} ${result.status === 200 ? '✅' : '❌'}`);
      } catch (error) {
        console.log(`   ${endpoint}: ❌ ${error.message}`);
      }
    }
    console.log('');

    // 测试5: 验证邀请码
    console.log('5. 验证邀请码有效性');
    try {
      const validateResult = await makeRequest(hostname, port, `/api/invite-codes/validate`, {
        method: 'POST',
        body: {
          code: inviteCode
        }
      });
      console.log(`   状态码: ${validateResult.status}`);
      if (validateResult.status === 200) {
        console.log('   ✅ 邀请码验证成功');
        console.log(`   验证结果:`, JSON.stringify(validateResult.data, null, 2));
      } else {
        console.log(`   ❌ 邀请码验证失败: ${validateResult.status}`);
        console.log(`   错误信息:`, JSON.stringify(validateResult.data, null, 2));
      }
    } catch (error) {
      console.log(`   ❌ 验证请求失败: ${error.message}`);
    }
    console.log('');

    console.log('=== 测试总结 ===');
    console.log('邀请码 HVVSRS4BS 测试完成');
    console.log('请查看上述结果了解邀请码的状态和功能');

  } catch (error) {
    console.error('测试过程中发生错误:', error.message);
  }
}

testInviteCode(); 