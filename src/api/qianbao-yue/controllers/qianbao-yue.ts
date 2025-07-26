import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::qianbao-yue.qianbao-yue' as any, ({ strapi }) => ({
  // 获取当前用户的钱包余额
  async getMyWallet(ctx) {
    try {
      const userId = ctx.state.user.id;
      
      const wallet = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
        filters: { user: userId },
        populate: ['user']
      });

      if (wallet.length === 0) {
        return ctx.notFound('钱包不存在');
      }

      ctx.body = {
        success: true,
        data: wallet[0]
      };
    } catch (error) {
      ctx.throw(500, `获取钱包失败: ${error.message}`);
    }
  },

  // 更新用户钱包余额
  async updateWallet(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { usdtYue, aiYue, aiTokenBalances } = ctx.request.body;

      const wallet = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
        filters: { user: userId }
      });

      if (wallet.length === 0) {
        return ctx.notFound('钱包不存在');
      }

      const updatedWallet = await strapi.entityService.update('api::qianbao-yue.qianbao-yue', wallet[0].id, {
        data: {
          usdtYue: usdtYue || wallet[0].usdtYue,
          aiYue: aiYue || wallet[0].aiYue,
          aiTokenBalances: aiTokenBalances || wallet[0].aiTokenBalances
        }
      });

      ctx.body = {
        success: true,
        data: updatedWallet,
        message: '钱包更新成功'
      };
    } catch (error) {
      ctx.throw(500, `更新钱包失败: ${error.message}`);
    }
  },

  // 获取所有用户钱包（管理员功能）
  async getAllWallets(ctx) {
    try {
      const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
        populate: ['user'],
        sort: { id: 'desc' }
      });

      ctx.body = {
        success: true,
        data: wallets
      };
    } catch (error) {
      ctx.throw(500, `获取钱包列表失败: ${error.message}`);
    }
  }
})); 