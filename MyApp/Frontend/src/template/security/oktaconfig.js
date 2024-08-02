const CLIENT_ID = process.env.REACT_APP_CLIENT_ID || '0oaib8w4auIZcjdtN5d7';
const ISSUER = process.env.REACT_APP_ISSUER || 'https://dev-92455550.okta.com/oauth2/default';
const REDIRECT_URI = `${window.location.origin}/login/callback`;

const oktaConfig = {
  oidc: {
    clientId: CLIENT_ID,
    issuer: ISSUER,
    redirectUri: REDIRECT_URI,
    scopes: ['openid', 'profile', 'email','offline_access'],
    pkce: true,
    responseType: ['id_token', 'token', 'refresh_token']
  }
};

export default oktaConfig;
