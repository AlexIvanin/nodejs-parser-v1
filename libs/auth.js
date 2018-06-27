const needle = require('needle');

async function auth(credentials) {

    let authUrl = credentials.url + '/signin';

    return new Promise((resolve, reject) => {

        // get cookies before sign in
        needle.get(authUrl, function(err, response){
            if (err || response.statusCode != 200)
                reject(err || response.statusCode);

            // authentification with credentials and cookies
            needle.post(
                authUrl, {
                    email: credentials.login,
                    password: credentials.password,
                    mode: ''
                }, {
                    'cookies': response.cookies
                },
                (err, response) => {
                    if (err) reject(err);

                    resolve(response.cookies)
                }
            );
        });
    });
}

module.exports = {
    auth
};