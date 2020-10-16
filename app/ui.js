// Select DOM elements to work with
const welcomeDiv = document.getElementById("WelcomeMessage");
const signInButton = document.getElementById("SignIn");
const cardDiv = document.getElementById("card-div");
const listTokens = document.getElementById("listTokens");
const getReadSilent = document.getElementById("getReadSilent");
const getWriteSilent = document.getElementById("getWriteSilent");
const getReadRedirect = document.getElementById("getReadRedirect");
const getWriteRedirect = document.getElementById("getWriteRedirect");
const responseElement = document.getElementById("idResponse");
const profileDiv = document.getElementById("profile-div");

welcomeDiv.innerHTML = "Please sign-in to Azure AD B2C tenant " + b2cTenantNameLong;

function openWellKnown() {
    var url = b2cPolicies.authorities.signUpSignIn.authority + "/v2.0/.well-known/openid-configuration";
    var win = window.open(url, '_blank');
    win.focus();
}

function showWelcomeMessage(account) {
    // Reconfiguring DOM elements
    //cardDiv.style.display = 'initial';
    if ( account.username.length == 0 ) {
        welcomeDiv.innerHTML = "Welcome " + getUserName();
    } else {
        welcomeDiv.innerHTML = `Welcome ${account.username}`;
    }
    signInButton.setAttribute("onclick", "signOut();");
    signInButton.setAttribute('class', "btn btn-success")
    signInButton.innerHTML = "Sign Out";
}


function displayResponse( innerHtml ) {
    responseElement.innerHTML = innerHtml;
}

function updateUIToken(success, scopes, data) {

    var table = "<table class=\"table table-striped\"><thead><th class=\"col-sm-8\">ttl</th><th class=\"col-sm-3\">scopes</th><th class=\"col-sm-3\">aud</th><th class=\"col-sm-3\">acr</th><th class=\"col-sm-3\">link</th></thead>";
    table += drawTokenTable();
    table += "</table>";

    var json = JSON.stringify(data);
    if ( json.substring(0,1)== "{") {
        var accessToken = JSON.parse(atob(data.accessToken.split(".")[1]));
        var nowSeconds = Math.round(new Date().getTime() / 1000.0);
        var ttl = Number(accessToken.exp) - nowSeconds; 

        var urlId = "<a href=\"https://jwt.ms/#id_token=" + data.idToken + "\" target=\"_blank\">jwt.ms id_token</a>";
        var urlAT = "<a href=\"https://jwt.ms/#access_token=" + data.accessToken + "\" target=\"_blank\">jwt.ms access_token</a>";

        responseElement.innerHTML = scopes + "<br/><br/>" + urlId + "&nbsp;" + urlAT + " ttl: " + ttl + " seconds<br/><br/>" + table + "<br/><br/>" + json;
    } else {
        responseElement.innerHTML = scopes + "<br/><br/><div style=\"color: red\">" + json + "</div><br/><br/>" + table;
    }
}

function listTokenCache() {
    var table = "<table class=\"table table-striped\"><thead><th class=\"col-sm-3\">scopes/acr</th><th class=\"col-sm-3\">ttl secs</th><th class=\"col-sm-3\">aud</th><th class=\"col-sm-3\">sub</th><th class=\"col-sm-3\">link</th></thead>";
    table += drawTokenTable();
    table += "</table>";
    responseElement.innerHTML = table;
}
function drawTokenTable() {
    var html = "";
    for (var i = 0; i < myMSALObj.browserStorage.windowStorage.length; i++) {
        var key = myMSALObj.browserStorage.windowStorage.key(i);
        try {
            var data = JSON.parse(myMSALObj.browserStorage.windowStorage.getItem(key));
            if ( data.credentialType === "AccessToken") {
                var accessToken = JSON.parse(atob(data.secret.split(".")[1]));
                var nowSeconds = Math.round(new Date().getTime() / 1000.0);
                var ttl = Number(accessToken.exp) - nowSeconds; 
                html += '<tr>';
                html += '<td>' + accessToken.scp + '</td>';
                html += '<td>' + ttl + '</td>';
                html += '<td>' + accessToken.aud + '</td>';
                html += '<td>' + accessToken.sub + '</td>';
                html += "<td>" + "<a href=\"https://jwt.ms/#access_token=" + data.secret + "\" target=\"_blank\">jwt.ms</a>";
                html += '</tr>';
            } else if ( data.credentialType === "IdToken") {
                var idToken = JSON.parse(atob(data.secret.split(".")[1]));
                var nowSeconds = Math.round(new Date().getTime() / 1000.0);
                var ttl = Number(idToken.exp) - nowSeconds; 
                var policyid = "";
                if ( undefined === idToken.acr ) {
                    policyid = idToken.tfp;
                } else {
                    policyid = idToken.acr;
                }
                html += '<tr>';
                html += '<td>' + "id_token<br/>" + policyid + '</td>';
                html += '<td>' + ttl + '</td>';
                html += '<td>' + idToken.aud + '</td>';
                html += '<td>' + idToken.sub + '</td>';
                html += "<td>" + "<a href=\"https://jwt.ms/#access_token=" + data.secret + "\" target=\"_blank\">jwt.ms</a>";
                html += '</tr>';
            }
            } catch(err) {}
    }
    return html;
}

function getUserName() {
    var userid = "";
    for (var i = 0; i < myMSALObj.browserStorage.windowStorage.length; i++) {
        var key = myMSALObj.browserStorage.windowStorage.key(i);
        try {
            var data = JSON.parse(myMSALObj.browserStorage.windowStorage.getItem(key));
            if ( data.authorityType === "MSSTS") {
                userid = data.name;
            }
        } catch(err) {}
    }
    return userid;
}
