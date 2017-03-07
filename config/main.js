const env = require('./config.json');

module.exports = (() => {
    const node_env = process.env.NODE_ENV || 'development';
    const env_variables = env[node_env];

    // OAuth2
    env_variables.client.id = process.env.CLIENT_ID || env_variables.client.id;
    env_variables.client.secret = process.env.CLIENT_SECRET || env_variables.client.secret;

    // LTI
    env_variables.lti.key = process.env.LTI_KEY || env_variables.lti.key;
    env_variables.lti.secret = process.env.LTI_SECRET || env_variables.lti.secret;

    return env_variables;
})();


