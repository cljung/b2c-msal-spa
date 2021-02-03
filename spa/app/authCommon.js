// Create the main myMSALObj instance
// configuration parameters are located at authConfig.js
const myMSALObj = new msal.PublicClientApplication(msalConfig);

let accessToken;
let username = "";

var b2cAuthUXStyle = "redirect"; // "redirect"
function isRedirect() {
    return b2cAuthUXStyle == "redirect";
}

function setAuthMethod(idAuthMethod) {
    b2cAuthUXStyle = document.getElementById(idAuthMethod).value;
}
// MSAL subtracts this from the token exp claim to make sure to not try and use an
// access token when there is 1 second left, because when hitting the WebApp it has expired.
// Since we use a 5 min token ttl for test, we want this to be 0
myMSALObj.config.system.tokenRenewalOffsetSeconds = 0; 

// Redirect: once login is successful and redirects with tokens, call Graph API
myMSALObj.handleRedirectPromise().then(handleRedirectResponse).catch(err => {
    console.error(err);
});

function handleRedirectResponse(resp) {
    if (resp !== null) {
        username = resp.account.username;
        showWelcomeMessage(resp.account);
    } else {
        /**
         * See here for more info on account retrieval: 
         * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/Accounts.md
         */
        const currentAccounts = myMSALObj.getAllAccounts();
        if (currentAccounts === null) {
            return;
        } else if (currentAccounts.length > 1) {
            // Add choose account code here
            console.warn("Multiple accounts detected.");
        } else if (currentAccounts.length === 1) {
            username = currentAccounts[0].username;
            showWelcomeMessage(currentAccounts[0]);
        }
    }
}

function handlePopupResponse(response) {
    console.log("id_token acquired at: " + new Date().toString());         
    console.log(response);
  /**
     * To see the full list of response object properties, visit:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/request-response-object.md#response
     */
    if (response !== null) {
        username = response.account.username;
        showWelcomeMessage(response.account);
    } else {
        selectAccount();
    }
  }
  

function signIn() {
    if ( isRedirect() ) {
        myMSALObj.loginRedirect(loginRequest);
    } else {
        myMSALObj.loginPopup(loginRequest).then(handlePopupResponse).catch(error => {
            console.error(error);
        });
    }
}

function signOut() {
    const logoutRequest = {
        account: msalGetAccount()
    };
    myMSALObj.logout(logoutRequest);
}

function msalGetAccount() {
    var account = myMSALObj.getAccountByUsername(username);
    if ( null === account ) {
        account = myMSALObj.getAllAccounts()[0];
    }
    return account;
}

function handleAcquireTokenResponse(response) {
    //console.log(response);
    if (response.accessToken) {
        console.log('access_token acquired at: ' + new Date().toString());
        accessToken = response.accessToken;
        callback( true, JSON.stringify( request), response );
    } else {
        callback( false, JSON.stringify( request), "ok response but no access token" );
    }
}

function getTokenCallbackSilent( request, callback) {
    console.log('getTokenCallbackSilent');
    displayResponse( JSON.stringify( request) );
    request.account = msalGetAccount();
    console.log(request);
    return myMSALObj.acquireTokenSilent( request )
    .then(handleAcquireTokenResponse)
    .catch(error => {
            console.warn("silent token acquisition failed.");
            console.warn(error);
            // fallback to interaction when silent call fails
            callback( false, JSON.stringify( request), "silent token acquisition failed" );
        });
}

function getTokenCallback( request, callback ) {
    console.log('getToken');
    request.account = msalGetAccount();
    console.log(request);
    return myMSALObj.acquireTokenSilent(request)
        .then(handleAcquireTokenResponse)
        .catch(error => {
            console.warn("silent token acquisition fails. acquiring token using redirect");
            // fallback to interaction when silent call fails
            if ( isRedirect() ) {
                return myMSALObj.acquireTokenRedirect(request).then(handleAcquireTokenResponse);    
            } else {
                return myMSALObj.acquireTokenPopup(request).then(handleAcquireTokenResponse);    
            }
        });
}

function handleAcquireTokenResponseForApiCall(response, apiEndpoint, restApiCallback) {
    console.log("handleAcquireTokenResponseForApiCall");
    console.log(response);
    if (response.accessToken) {
        console.log('access_token acquired at: ' + new Date().toString());
        accessToken = response.accessToken;
        restApiCallback(apiEndpoint, response.accessToken );
    }
}

function InvokeRestApi( apiEndpoint, apiScopes, restApiCallback ) {
    console.log('InvokeRestApi');
    var request = {
        authority: b2cPolicies.authorities.signUpSignIn.authority,
        scopes: [ apiScopes ]
    };
    request.account = msalGetAccount();
    console.log(request);
    return myMSALObj.acquireTokenSilent(request)
        .then(response => handleAcquireTokenResponseForApiCall(response, apiEndpoint, restApiCallback))
        .catch(error => {
            console.warn("silent token acquisition fails. acquiring token using redirect");
            // fallback to interaction when silent call fails
            if ( isRedirect() ) {
                return myMSALObj.acquireTokenRedirect(request).then(response => handleAcquireTokenResponseForApiCall(response, apiEndpoint, restApiCallback));    
            } else {
                return myMSALObj.acquireTokenPopup(request).then(response => handleAcquireTokenResponseForApiCall(response, apiEndpoint, restApiCallback));    
            }
        });
}

function acquireReadToken() {
    console.log('acquireReadToken');
    getTokenCallback( tokenRequestDemoRead, updateUIToken );
}
function acquireReadTokenSilent() {
    console.log('acquireReadTokenSilent');
    getTokenCallbackSilent( tokenRequestDemoRead, updateUIToken )
}

function acquireWriteToken() {
    console.log('acquireWriteToken');
    getTokenCallback( tokenRequestDemoWrite, updateUIToken );
}
function acquireWriteTokenSilent() {
    console.log('acquireWriteTokenSilent');
    getTokenCallbackSilent( tokenRequestDemoWrite, updateUIToken )
}

function acquireApiReadToken() {
    console.log('acquireApiReadToken');
    getTokenCallback( tokenRequestApiRead, updateUIToken );
}
function acquireApiReadTokenSilent() {
    console.log('acquireApiReadTokenSilent');
    getTokenCallbackSilent( tokenRequestApiRead, updateUIToken )
}

function acquireApiWriteToken() {
    console.log('acquireApiWriteToken');
    getTokenCallback( tokenRequestApiWrite, updateUIToken, null);
}
function acquireApiWriteTokenSilent() {
    console.log('acquireApiWriteTokenSilent');
    getTokenCallbackSilent( tokenRequestApiWrite, updateUIToken, null )
}

