import { Amplify } from 'aws-amplify';

const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN?.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
const cognitoScopes = import.meta.env.VITE_COGNITO_SCOPES?.trim().split(/\s+/).filter(Boolean) || ['openid'];
const redirectSignIn = import.meta.env.VITE_COGNITO_REDIRECT_SIGN_IN?.trim() || window.location.origin;
const redirectSignOut = import.meta.env.VITE_COGNITO_REDIRECT_SIGN_OUT?.trim() || redirectSignIn;

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
      loginWith: {
        oauth: {
          domain: cognitoDomain,
          scopes: cognitoScopes,
          redirectSignIn: [redirectSignIn],
          redirectSignOut: [redirectSignOut],
          responseType: import.meta.env.VITE_COGNITO_RESPONSE_TYPE || 'code',
        },
      },
    },
  },
});
