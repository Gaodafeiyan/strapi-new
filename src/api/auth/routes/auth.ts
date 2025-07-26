export default {
  type: 'content-api',
  routes: [
    {
      method: 'POST',
      path: '/auth/invite-register',
      handler: 'auth.inviteRegister',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/auth/create-first-admin',
      handler: 'auth.createFirstAdmin',
      config: { auth: false },
    },
  ],
}; 