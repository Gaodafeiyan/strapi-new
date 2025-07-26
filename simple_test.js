const http = require('http');

console.log('开始测试钱包余额API...');

// 测试服务器连接
const testConnection = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '118.107.4.158',
      port: 1337,
      path: '/_health',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('请求超时'));
    });

    req.end();
  });
};

// 测试钱包API
const testWalletAPI = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '118.107.4.158',
      port: 1337,
      path: '/api/qianbao-yues/my-wallet',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: jsonData
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('请求超时'));
    });

    req.end();
  });
};

async function runTests() {
  try {
    console.log('1. 测试服务器连接...');
    const connectionResult = await testConnection();
    console.log('服务器状态:', connectionResult.status);
    console.log('服务器响应:', connectionResult.data);
    
    console.log('\n2. 测试钱包API（未认证）...');
    const walletResult = await testWalletAPI();
    console.log('钱包API状态码:', walletResult.status);
    console.log('钱包API响应:', walletResult.data);
    
    if (walletResult.status === 403) {
      console.log('✅ 正确返回403错误 - 认证保护正常工作');
    } else if (walletResult.status === 200) {
      console.log('❌ 错误：未认证访问成功，应该返回403');
    } else {
      console.log('⚠️ 返回了意外的状态码:', walletResult.status);
    }
    
  } catch (error) {
    console.error('测试失败:', error.message);
  }
}

runTests(); 