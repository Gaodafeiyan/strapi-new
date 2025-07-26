export default {
  kind: 'collectionType',
  collectionName: 'qianbao_yue',
  info: {
    singularName: 'qianbao-yue',
    pluralName: 'qianbao-yues',
    displayName: '钱包余额',
    description: '用户钱包余额',
  },
  options: {
    draftAndPublish: false,
  },
  attributes: {
    usdtYue: { type: 'decimal', default: 0, configurable: false },
    aiYue: { type: 'decimal', default: 0, configurable: false },
    aiTokenBalances: { type: 'json', default: {}, configurable: false },
    user: {
      type: 'relation',
      relation: 'oneToOne',
      target: 'plugin::users-permissions.user',
      inversedBy: 'qianbaoYue',
      configurable: false
    },
  },
}; 