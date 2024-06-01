const AWS = require('aws-sdk');

const cognito = new AWS.CognitoIdentityServiceProvider({
    region: 'eu-central-1',
});

const userPoolId = 'eu-central-1_qeTSL0PSD';
const clientId = '5h0cmc6p678nck7en3597b6ht2';

async function authenticate(username, password) {
    const params = {
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: clientId,
        AuthParameters: {
            USERNAME: username,
            PASSWORD: password,
        },
    };
    return cognito.initiateAuth(params).promise();
}

module.exports = {
    authenticate,
};
