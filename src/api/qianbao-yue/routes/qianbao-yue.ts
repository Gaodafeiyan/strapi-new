export default {
  type: 'content-api',
  routes: [
    // 获取当前用户的钱包余额
    {
      method: 'GET',
      path: '/qianbao-yues/my-wallet',
      handler: 'qianbao-yue.getMyWallet',
      config: { auth: { scope: ['authenticated'] } },
    },
    // 更新当前用户的钱包余额
    {
      method: 'PUT',
      path: '/qianbao-yues/update-wallet',
      handler: 'qianbao-yue.updateWallet',
      config: { auth: { scope: ['authenticated'] } },
    },
    // 获取所有用户钱包（管理员功能）
    {
      method: 'GET',
      path: '/qianbao-yues/all-wallets',
      handler: 'qianbao-yue.getAllWallets',
      config: { auth: { scope: ['admin'] } },
    },
  ],
}; 