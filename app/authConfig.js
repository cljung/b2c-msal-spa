// Config object to be passed to Msal on creation.
// For a full list of msal.js configuration parameters, 
// visit https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md

const b2cLoginHintUser = "alice@contoso.com"; // this will save you time typing it in all the time when testing

const b2cTenantName = "yourtenant";
const b2cTenantNameLong = b2cTenantName + ".onmicrosoft.com";
const b2cClientId = "..guid for your B2C registered application...";
const b2cApiClientId = "...guid of the B2C-API AppId you registered above...";
const b2cSigninPolicy = "B2C_1_susi"; 

const b2cRedirectUri =  "http://localhost:3000";

const b2cScopes = {
    DemoRead: "https://" + b2cTenantNameLong + "/" + b2cClientId + "/Demo.Read", 
    DemoWrite: "https://" + b2cTenantNameLong + "/" + b2cClientId + "/Demo.Write", 
    ApiRead: "https://" + b2cTenantNameLong + "/" + b2cApiClientId + "/api.read", 
    ApiWrite: "https://" + b2cTenantNameLong + "/" + b2cApiClientId + "/api.write" 
  }
    
// you shouldn't need to change anything below here just to get the sample running with your tenant  
const b2cAuthorityUrl = "https://" + b2cTenantName + ".b2clogin.com/" + b2cTenantNameLong;

const b2cPolicies = {
    authorities: {
        knownAuthority: b2cTenantName + ".b2clogin.com", 
        signUpSignIn: {
            authority: b2cAuthorityUrl + "/" + b2cSigninPolicy,
        }, 
        /*
        forgotPassword: {
          b2cAuthorityUrl: + "/" + b2cPasswordResetPolocy,
        },
        */
    },
}

// - - - 
const msalConfig = {
    auth: {
        clientId: b2cClientId,
        authority: b2cPolicies.authorities.signUpSignIn.authority,
        knownAuthorities: [ b2cPolicies.authorities.knownAuthority ],
        redirectUri: b2cRedirectUri,
        validateAuthority: false,

    },
    cache: {
        cacheLocation: "sessionStorage", // This configures where your cache will be stored
        storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
    },
    system: {
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                if (containsPii) {	
                    return;	
                }	
                switch (level) {	
                    case msal.LogLevel.Error:	
                        console.error(message);	
                        return;	
                    case msal.LogLevel.Info:	
                        console.info(message);	
                        return;	
                    case msal.LogLevel.Verbose:	
                        console.debug(message);	
                        return;	
                    case msal.LogLevel.Warning:	
                        console.warn(message);	
                        return;	
                }
            }
        }
    }
};

// Add here the scopes that you would like the user to consent during sign-in

const loginRequest = {
    authority: b2cPolicies.authorities.signUpSignIn.authority,
    loginHint: b2cLoginHintUser
  };  
  
const tokenRequestDemoRead = {
    authority: b2cPolicies.authorities.signUpSignIn.authority,
    scopes: [ b2cScopes.DemoRead ],
    loginHint: b2cLoginHintUser
  };

const tokenRequestDemoWrite = {
    authority: b2cPolicies.authorities.signUpSignIn.authority,
    scopes: [ b2cScopes.DemoWrite ],
    loginHint: b2cLoginHintUser
  };

  const tokenRequestApiRead = {
    authority: b2cPolicies.authorities.signUpSignIn.authority,
    scopes: [ b2cScopes.ApiRead ],
    loginHint: b2cLoginHintUser
  };

  const tokenRequestApiWrite = {
    authority: b2cPolicies.authorities.signUpSignIn.authority,
    scopes: [ b2cScopes.ApiWrite ],
    loginHint: b2cLoginHintUser
  };
