import { factories } from '@strapi/strapi';
import { validateEmail, validateUsername, validatePassword, validateInviteCode, sanitizeInput } from '../../../../utils/validation';
import { generateInviteCode } from '../../../../utils/invite';

export default factories.createCoreController(
  'plugin::users-permissions.user',
  ({ strapi }) => ({
    /**
     * 邀请注册接口
     * @param {Object} ctx - Koa context
     * @param {string} ctx.request.body.username - 用户名
     * @param {string} ctx.request.body.email - 邮箱
     * @param {string} ctx.request.body.password - 密码
     * @param {string} ctx.request.body.inviteCode - 邀请码
     * @returns {Object} 注册结果
     */
    async inviteRegister(ctx) {
      try {
        const { username, email, password, inviteCode } = ctx.request.body;
        
        if (!username || !email || !password || !inviteCode) {
          return ctx.badRequest('缺少必要参数');
        }

        // 验证输入格式
        if (!validateEmail(email)) {
          return ctx.badRequest('邮箱格式不正确');
        }

        if (!validateUsername(username)) {
          return ctx.badRequest('用户名长度应在3-20位之间');
        }

        if (!validatePassword(password)) {
          return ctx.badRequest('密码长度至少6位');
        }

        if (!validateInviteCode(inviteCode)) {
          return ctx.badRequest('邀请码格式不正确');
        }

        // 检查用户名和邮箱是否已存在
        const existingUser = await strapi.entityService.findMany('plugin::users-permissions.user', {
          filters: {
            $or: [
              { username },
              { email }
            ]
          } as any
        });

        if (existingUser.length > 0) {
          return ctx.badRequest('用户名或邮箱已存在');
        }

        // 校验邀请码
        const inviteUser = await strapi.entityService.findMany('plugin::users-permissions.user', {
          filters: { inviteCode } as any
        });

        if (inviteUser.length === 0) {
          return ctx.badRequest('邀请码无效');
        }

        // 获取默认角色（authenticated）
        const [authenticatedRole] = await strapi.entityService.findMany('plugin::users-permissions.role', {
          filters: { type: 'authenticated' },
          limit: 1
        }) as any[];

        console.log('找到的角色:', authenticatedRole);

        if (!authenticatedRole) {
          return ctx.badRequest('系统错误：未找到默认角色');
        }

        // 创建新用户（Strapi会自动加密密码）
        const userData = {
          username: sanitizeInput(username),
          email: sanitizeInput(email),
          password,
          provider: 'local',
          confirmed: true,
          inviteCode: generateInviteCode(),
          invitedBy: inviteUser[0].id,
          role: authenticatedRole.id
        };
        
        console.log('创建用户数据:', { ...userData, password: '[HIDDEN]' });
        
        const newUser = await strapi.entityService.create('plugin::users-permissions.user', {
          data: {
            username: sanitizeInput(username),
            email: sanitizeInput(email),
            password,
            provider: 'local',
            confirmed: true,
            inviteCode: generateInviteCode(),
            invitedBy: inviteUser[0].id,
            role: authenticatedRole.id
          }
        });



        console.log('新用户创建成功:', newUser);

        ctx.body = {
          success: true,
          data: {
            id: newUser.id,
            username: (newUser as any).username,
            email: (newUser as any).email,
            inviteCode: (newUser as any).inviteCode
          },
          message: '注册成功'
        };
      } catch (error) {
        console.error('邀请注册失败:', error);
        ctx.throw(500, `注册失败: ${error.message}`);
      }
    },

    /**
     * 创建第一个管理员用户接口（用于初始化系统）
     * @param {Object} ctx - Koa context
     * @param {string} ctx.request.body.username - 用户名
     * @param {string} ctx.request.body.email - 邮箱
     * @param {string} ctx.request.body.password - 密码
     * @returns {Object} 创建结果
     */
    async createFirstAdmin(ctx) {
      try {
        const { username, email, password } = ctx.request.body;
        
        if (!username || !email || !password) {
          return ctx.badRequest('缺少必要参数');
        }

        // 验证输入格式
        if (!validateEmail(email)) {
          return ctx.badRequest('邮箱格式不正确');
        }

        if (!validateUsername(username)) {
          return ctx.badRequest('用户名长度应在3-20位之间');
        }

        if (!validatePassword(password)) {
          return ctx.badRequest('密码长度至少6位');
        }

        // 检查用户名和邮箱是否已存在
        const existingUser = await strapi.entityService.findMany('plugin::users-permissions.user', {
          filters: {
            $or: [
              { username },
              { email }
            ]
          } as any
        });

        if (existingUser.length > 0) {
          return ctx.badRequest('用户名或邮箱已存在');
        }

        // 检查是否已有用户
        const existingUsers = await strapi.entityService.count('plugin::users-permissions.user');
        if (existingUsers > 0) {
          return ctx.badRequest('系统已有用户，无法创建初始管理员');
        }

        // 获取管理员角色
        const [adminRole] = await strapi.entityService.findMany('plugin::users-permissions.role', {
          filters: { type: 'admin' },
          limit: 1
        }) as any[];

        if (!adminRole) {
          return ctx.badRequest('系统错误：未找到管理员角色');
        }

        // 创建第一个管理员用户（Strapi会自动加密密码）
        const firstAdmin = await strapi.entityService.create('plugin::users-permissions.user', {
          data: {
            username: sanitizeInput(username),
            email: sanitizeInput(email),
            password,
            provider: 'local',
            confirmed: true,
            inviteCode: generateInviteCode(),
            role: adminRole.id
          }
        });



        ctx.body = {
          success: true,
          data: {
            id: firstAdmin.id,
            username: (firstAdmin as any).username,
            email: (firstAdmin as any).email,
            inviteCode: (firstAdmin as any).inviteCode
          },
          message: '初始管理员创建成功'
        };
      } catch (error) {
        console.error('创建初始管理员失败:', error);
        ctx.throw(500, `创建失败: ${error.message}`);
      }
    }
  })
); 