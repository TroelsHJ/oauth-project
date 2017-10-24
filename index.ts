import * as Express from 'express';
let app = Express();

app.set('port', (process.env.PORT || 5000));

app.get("/", (req, resp) => {
    resp.send("Hey!");
});

app.listen(app.get('port'), () => {
    console.log("Server is running on port ", app.get('port'));
});

import * as BodyParser from 'body-parser';
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true}));

import * as querystring from 'query-string';
import * as request from 'request';
//import * as cookieParser from 'cookie-parser';

//app.use (Express.static(__dirname + "/public")).use(cookieParser());

let generateRandomString = function (length: number) {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

let myClient_id = "4b2dab3b-0bf0-4a0e-b253-d1c102da3210.apps.xena.biz";
let myClient_secret = "JjFEh3aanXYrvAi6ZyuIOn7s";
let myRedirect_uri = "https://hidden-brook-94877/callback"
let stateKey = "spotify<<_auth_state";

app.get("/login", (req, resp) => {
    let myScope = "api";
    let myState = generateRandomString(16);

    resp.cookie(stateKey, myState);


    resp.redirect("https://login.xena.biz/connect/authorize?" +
    querystring.stringify({
        response_type: "code",
        client_id: myClient_id,
        scope: myScope,
        redirect_uri: myRedirect_uri,
        state: myState
    }));
});

app.get("/callback", (req, resp) => {
    let code = req.query.code || null;
    let state = req.query.state || null;
    let storedState = req.cookies ? req.cookies[stateKey] : null;

    if (state === null || state !== storedState) {
        resp.redirect('/#' +
            querystring.stringify({
                error: 'state_mismatch'
            }));
    } else {
        resp.clearCookie(stateKey);
        let authOptions = {
            url: 'https://login.xena.biz/connect/authorize?',
            form: {
                code: code,
                redirect_uri: myRedirect_uri,
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic ' + (new Buffer(myClient_id + ':' + myClient_secret).toString('base64'))
            },
            json: true
        };

        request.post(authOptions, function (error, response, body) {
            if (!error && response.statusCode === 200) {

                let access_token = body.access_token,
                    refresh_token = body.refresh_token;

                let options = {
                    url: 'https://login.xena.biz/connect/authorize?',
                    headers: { 'Authorization': 'Bearer ' + access_token },
                    json: true
                };
            }
        });
    }

});



