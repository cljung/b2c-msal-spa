// Update these four variables with values from your B2C tenant in the Azure portal

const clientID = process.env.B2C_clientId || "...client_id...";
const b2cDomainHost = process.env.B2C_domainHost || "yourtenant.b2clogin.com";
const tenantIdGuid = process.env.B2C_tenantId || "yourtenant.onmicrosoft.com";//"...or guid...";
const policyName = process.env.B2C_policyName || "B2C_1_susi"; 

const config = {
    identityMetadata: "https://" + b2cDomainHost + "/" + tenantIdGuid + "/" + policyName + "/v2.0/.well-known/openid-configuration/",

    clientID: clientID,
    policyName: policyName,
    isB2C: true,
    validateIssuer: false,
    loggingLevel: 'info',
    loggingNoPII: false,
    passReqToCallback: false
};

module.exports = config;
