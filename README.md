# JavaScript SPA Authenticating with Azure AD B2C via MSAL.JS 2.x 

This simple SPA app is cloned from [https://github.com/Azure-Samples/ms-identity-javascript-v2](https://github.com/Azure-Samples/ms-identity-javascript-v2), which is the official MSAL.JS 2.x sample. This clone is targeted towards Azure AD B2C and focuses on showing you how the acquiring of tokens happen and how MSAL.JS handles them in the local token cache.


## Contents

| File/folder       | Description                                |
|-------------------|--------------------------------------------|
| `app`             | Contains sample source files               |
| `authRedirect.js` | Authentication with redirect flow.   |
| `authConfig.js`   | Contains configuration parameters for the sample. |
| `ui.js`           | Contains UI logic.                         |
| `index.html`      | Contains the UI of the sample.            |
| `package.json`    | Package manifest for npm.                   |
| `README.md`       | This README file.                          |
| `server.js`       | Implements a simple Node server to serve index.html.  |

## Prerequisites

[Node](https://nodejs.org/en/) must be installed to run this sample.

## Setup in the Azure AD B2C portal

### Register an Application
1. [Register a new application](https://docs.microsoft.com/en-us/azure/active-directory-b2c/tutorial-register-applicationn) in the [Azure Portal](https://portal.azure.com) im your Azure AD B2C tenant. Ensure that the application is enabled for the [authorization code flow with PKCE](https://docs.microsoft.com/azure/active-directory/develop/v2-oauth2-auth-code-flow). This will require that you redirect URI configured in the portal is of type `SPA`. Set the redirectUri to http://localhost:3000
2. Under ***Expose an API***, add two scopes where one is named ***Demo.Read*** and the other ***Demo.Write***
3. Under ***API Permissions***, add permissions from ***My APIs*** and add Demo.Read and Demo.Write as ***Delegated*** permissions. Make sure you perform ***Grant admin consent*** in the portal 

### Create a B2C UserFlow
1. In Azure AD B2C panel in portal.azure.com, go to ***User flows*** under Policies
2. Click on ***+ New user flow***, then ***select Sign up and sign in*** and then ***Standard*** and press Create
3. Name the flow ***susi*** or similar and select ***Email signup***
4. In the ***User attributes and claims*** list, select Display name, Given name, Surname and Email address for both Collect attribute and Return claim.
5. Goto ***Properties*** for your UserFlow, Enable javascript, reduce the lifetime of the token to 5 minutes and Save
6. Goto ***Page Layouts*** for your UserFlow, change the Page Layout version to 1.2.0 (or higher if exist) and Save
7. (Optional) Goto ***Company Branding*** for your B2C tenant and upload a background image and logotype to spiece it up

## Modifying the source code

Open the [/app/authConfig.js](./app/authConfig.js) and make the following changes

```javascript
const b2cLoginHintUser = "alice@contoso.com"; // this will save you time typing it in all the time when testing

const b2cTenantName = "yourtenant";
const b2cTenantNameLong = b2cTenantName + ".onmicrosoft.com";
const b2cClientId = "...guid of the AppId you registered above...";
const b2cSigninPolicy = "B2C_1_susi"; // name of your B2C UserFlow policy

const b2cRedirectUri =  "http://localhost:3000"; // don't need to change this unless you change host:port

const b2cScopes = {
    DemoRead: "https://" + b2cTenantNameLong + "/" + b2cClientId + "/Demo.Read", 
    DemoWrite: "https://" + b2cTenantNameLong + "/" + b2cClientId + "/Demo.Write", 
}
```

On the command line, navigate to the root of the repository, and run `npm install` to install the project dependencies via npm.

## Running the sample

To start the sample application, navigate to the project folder and run `npm start` or `node server.js`.
4. Finally, open a browser and navigate to [http://localhost:3000](http://localhost:3000).

## Things to play with

* **Sign in** to get an SSO and an id token from B2C
If you do F12 in Chrome/Edge you can see the SSO cookie `x-ms-cpim-sso` under Cookies in the Application tab and you can see the id token in the session storage.

* **List Token Cache** Will list what you have in the MSAL token cache in Session Storage and the time-to-live for the acquired tokens.  

* **Acquire Read Access Silent** will acquire an access token with `scope` Demo.Read. When an existing access token with TTL that is negative, you have a token that is expired. Clicking on `Acquire Token Silent` will give you another one using the refresh token. Acquire token silent will fail if you in Chrome/Edge delete the Session Storage values and the SSO cookie x-ms-cpim-sso - do that to verify that.

* **Acquire Read Access Redirect** will first try to acquire the token silently, but if that fails, it will launch the Signin UX and ask the user to enter credentials.

* The `Write` buttons is just so you can see that you get different access tokens if you ask for different scopes. You can see the Session Storage list growing.
