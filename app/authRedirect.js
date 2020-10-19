// Create the main myMSALObj instance
// configuration parameters are located at authConfig.js
const myMSALObj = new msal.PublicClientApplication(msalConfig);

let accessToken;
let username = "";

// MSAL subtracts this from the token exp claim to make sure to not try and use an
// access token when there is 1 second left, because when hitting the WebApp it has expired.
// Since we use a 5 min token ttl for test, we want this to be 0
myMSALObj.config.system.tokenRenewalOffsetSeconds = 0; 

// Redirect: once login is successful and redirects with tokens, call Graph API
myMSALObj.handleRedirectPromise().then(handleResponse).catch(err => {
    console.error(err);
});

function handleResponse(resp) {
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

function signIn() {
    myMSALObj.loginRedirect(loginRequest);
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

/*
function getTokenRedirect(request) {
    request.account = msalGetAccount();
    return myMSALObj.acquireTokenSilent(request).catch(error => {
            console.warn("silent token acquisition fails. acquiring token using redirect");
            if (error instanceof msal.InteractionRequiredAuthError) {
                // fallback to interaction when silent call fails
                return myMSALObj.acquireTokenRedirect(request);
            } else {
                console.warn(error);   
            }
        });
}
*/
function getTokenSilentTest( request, callback) {
    displayResponse( JSON.stringify( request) );
    console.log('getTokenSilentTest');
    request.account = msalGetAccount();
    console.log(request);
    return myMSALObj.acquireTokenSilent( request )
        .then((response) => {
            //console.log(response);
            if (response.accessToken) {
                console.log('access_token acquired at: ' + new Date().toString());
                callback( true, JSON.stringify( request), response );
            } else {
                callback( false, JSON.stringify( request), "ok response but no access token" );
            }
        })
        .catch(error => {
            console.warn("silent token acquisition failed.");
            console.warn(error);
            // fallback to interaction when silent call fails
            callback( false, JSON.stringify( request), "silent token acquisition failed" );
        });
}

function getTokenRedirectEndpoint( request, callback ) {
    console.log('getTokenRedirectEndpoint');
    request.account = msalGetAccount();
    console.log(request);
    return myMSALObj.acquireTokenSilent(request)
        .then((response) => {
            //console.log(response);
            if (response.accessToken) {
                console.log('access_token acquired at: ' + new Date().toString());
                accessToken = response.accessToken;
                callback( true, JSON.stringify( request), response );
            } else {
                callback( false, JSON.stringify( request), "ok response but no access token" );
            }
        })
        .catch(error => {
            console.warn("silent token acquisition fails. acquiring token using redirect");
            // fallback to interaction when silent call fails
            return myMSALObj.acquireTokenRedirect(request)
                        .then((response) => {
                            //console.log(response);
                            if (response.accessToken) {
                                console.log('access_token acquired at: ' + new Date().toString());
                                accessToken = response.accessToken;
                                callback( true, JSON.stringify( request), response );
                            } else {
                                callback( false, JSON.stringify( request), "ok response but no access token" );
                            }
                        });    
        });
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
        .then((response) => {
            //console.log(response);
            if (response.accessToken) {
                console.log('access_token acquired at: ' + new Date().toString());
                accessToken = response.accessToken;
                restApiCallback(apiEndpoint, response.accessToken );
            }
        })
        .catch(error => {
            console.warn("silent token acquisition fails. acquiring token using redirect");
            // fallback to interaction when silent call fails
            return myMSALObj.acquireTokenRedirect(request)
                    .then((response) => {
                        //console.log(response);
                        if (response.accessToken) {
                            console.log('access_token acquired at: ' + new Date().toString());
                            accessToken = response.accessToken;
                            restApiCallback(apiEndpoint, response.accessToken );
                        }
                    });    
        });
}

function acquireReadToken() {
    console.log('acquireReadToken');
    getTokenRedirectEndpoint( tokenRequestDemoRead, updateUIToken );
}
function acquireReadTokenSilent() {
    console.log('acquireReadTokenSilent');
    getTokenSilentTest( tokenRequestDemoRead, updateUIToken )
}

function acquireWriteToken() {
    console.log('acquireWriteToken');
    getTokenRedirectEndpoint( tokenRequestDemoWrite, updateUIToken );
}
function acquireWriteTokenSilent() {
    console.log('acquireWriteTokenSilent');
    getTokenSilentTest( tokenRequestDemoWrite, updateUIToken )
}

function acquireApiReadToken() {
    console.log('acquireApiReadToken');
    getTokenRedirectEndpoint( tokenRequestApiRead, updateUIToken );
}
function acquireApiReadTokenSilent() {
    console.log('acquireApiReadTokenSilent');
    getTokenSilentTest( tokenRequestApiRead, updateUIToken )
}

function acquireApiWriteToken() {
    console.log('acquireApiWriteToken');
    getTokenRedirectEndpoint( tokenRequestApiWrite, updateUIToken, null);
}
function acquireApiWriteTokenSilent() {
    console.log('acquireApiWriteTokenSilent');
    getTokenSilentTest( tokenRequestApiWrite, updateUIToken, null )
}

