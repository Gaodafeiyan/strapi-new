const http = require('http');
const https = require('https');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };
    
    const req = client.request(requestOptions, (res) => {
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
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function testWallet403() {
  console.log('开始测试钱包余额API的403错误...');
  
  const baseURL = 'http://118.107.4.158:1337';
  
  try {
    // 1. 测试未认证访问 - 应该返回403
    console.log('\n=== 测试1: 未认证访问 ===');
    try {
      const response = await makeRequest(`${baseURL}/api/qianbao-yues/my-wallet`);
      console.log('❌ 未认证访问成功，但应该失败');
      console.log('状态码:', response.status);
      console.log('响应:', response.data);
    } catch (error) {
      console.log('❌ 请求失败:', error.message);
    }
    
    // 2. 测试无效token访问 - 应该返回403
    console.log('\n=== 测试2: 无效token访问 ===');
    try {
      const response = await makeRequest(`${baseURL}/api/qianbao-yues/my-wallet`, {
        headers: {
          'Authorization': 'Bearer invalid_token_here'
        }
      });
      console.log('❌ 无效token访问成功，但应该失败');
      console.log('状态码:', response.status);
      console.log('响应:', response.data);
    } catch (error) {
      console.log('❌ 请求失败:', error.message);
    }
    
    // 3. 测试过期token访问 - 应该返回403
    console.log('\n=== 测试3: 过期token访问 ===');
    try {
      const response = await makeRequest(`${baseURL}/api/qianbao-yues/my-wallet`, {
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJ0ZXN0IiwiaWF0IjoxNjE2MTYxNjE2LCJleHAiOjE2MTYxNjE2MTd9.expired_token_signature'
        }
      });
      console.log('❌ 过期token访问成功，但应该失败');
      console.log('状态码:', response.status);
      console.log('响应:', response.data);
    } catch (error) {
      console.log('❌ 请求失败:', error.message);
    }
    
    // 4. 测试权限配置
    console.log('\n=== 测试4: 检查权限配置 ===');
    try {
      const response = await makeRequest(`${baseURL}/api/users-permissions/roles/1`);
      if (response.status === 200 && response.data.role && response.data.role.permissions) {
        const permissions = response.data.role.permissions;
        if (permissions['api::qianbao-yue']) {
          console.log('✅ 钱包API权限已配置');
          console.log('权限详情:', JSON.stringify(permissions['api::qianbao-yue'], null, 2));
        } else {
          console.log('❌ 钱包API权限未配置');
        }
      } else {
        console.log('❌ 无法获取权限配置');
      }
    } catch (error) {
      console.log('❌ 无法获取权限配置:', error.message);
    }
    
    // 5. 测试服务器连接
    console.log('\n=== 测试5: 检查服务器连接 ===');
    try {
      const response = await makeRequest(`${baseURL}/_health`);
      console.log('✅ 服务器正常运行');
      console.log('状态码:', response.status);
    } catch (error) {
      console.log('❌ 服务器连接失败:', error.message);
    }
    
  } catch (error) {
    console.error('测试过程中发生错误:', error.message);
  }
}

testWallet403(); 