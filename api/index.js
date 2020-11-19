// Authors:
// Shane Oatman https://github.com/shoatman
// Sunil Bandla https://github.com/sunilbandla
// Daniel Dobalian https://github.com/danieldobalian

var express = require("express");
var morgan = require("morgan");
var passport = require("passport");
const config = require('./config');
var BearerStrategy = require('passport-azure-ad').BearerStrategy;

// TODO: Update the first 3 variables
/*
var clientID = process.env.B2C_clientId || "94e08f79-4a04-444c-bda6-7aeef012dde7"; // "d636beb4-e0c5-4c5e-9bb0-d2fd4e1f9525";
var b2cDomainHost = process.env.B2C_domainHost || "cljungdemob2c.b2clogin.com";
var tenantIdGuid = process.env.B2C_tenantId || "b6c11183-fc66-4937-86fe-98a7af31a023";
var policyName = process.env.B2C_policyName || "B2C_1A_UX_signup_signin"; 
var options = {
    identityMetadata: "https://" + b2cDomainHost + "/" + tenantIdGuid + "/" + policyName + "/v2.0/.well-known/openid-configuration/",

    clientID: clientID,
    policyName: policyName,
    isB2C: true,
    validateIssuer: false,
    loggingLevel: 'info',
    loggingNoPII: false,
    passReqToCallback: false
};
*/
var bearerStrategy = new BearerStrategy(config,
    function (token, done) {
        // Send user info using the second argument
        done(null, {}, token);
    }
);

var app = express();
app.use(morgan('dev'));

app.use(passport.initialize());
passport.use(bearerStrategy);

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Authorization, Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get("/echo",
    function (req, res) {
        res.status(200).json({
            'date': new Date().toISOString(),
            'api': "active-directory-b2c-javascript-nodejs-webapi/echo"
            });
    }
);

app.get("/hello",
    passport.authenticate('oauth-bearer', {session: false}),
    function (req, res) {
        var claims = req.authInfo;
        console.log('User info: ', req.user);
        console.log('Validated claims: ', claims);
        
        if ( 'scp' in claims && claims['scp'].split(" ").indexOf("Api.Read") >= 0) {
            // Service relies on the name claim.  
            res.status(200).json({
                'date': new Date().toISOString(),
                'name': claims['name'], 
                'api': "active-directory-b2c-javascript-nodejs-webapi/hello",
                'scp': claims['scp']
                });
        } else {
            console.log("Invalid Scope, 403");
            res.status(403).json({'error': 'insufficient_scope'}); 
        }
    }
);

app.get("/hello-write",
    passport.authenticate('oauth-bearer', {session: false}),
    function (req, res) {
        var claims = req.authInfo;
        console.log('User info: ', req.user);
        console.log('Validated claims: ', claims);
        
        if ( 'scp' in claims && claims['scp'].split(" ").indexOf("Api.Write") >= 0) {
            // Service relies on the name claim.  
            res.status(200).json({
                'date': new Date().toISOString(),
                'name': claims['name'], 
                'api': "active-directory-b2c-javascript-nodejs-webapi/hello",
                'scp': claims['scp']
                });
        } else {
            console.log("Invalid Scope, 403");
            res.status(403).json({'error': 'insufficient_scope'}); 
        }
    }
);

var port = process.env.PORT || 5000;
app.listen(port, function () {
    console.log("Listening on port " + port);
});