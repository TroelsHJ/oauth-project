"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//#region imports
var Express = require("express");
var app = Express();
var BodyParser = require("body-parser");
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
var querystring = require("query-string");
var request = require("request");
var FileHandler = require("fs");
var secretKey = FileHandler.readFileSync("./secretKey.txt");
//#endregion
//#region endpoints
app.set('port', (process.env.PORT || 5000));
app.get("/", function (req, resp) {
    resp.sendFile(__dirname + "/index.html");
});
app.listen(app.get('port'), function () {
    console.log("Server is running on port ", app.get('port'));
});
//#endregion ´
var generateRandomString = function (length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};
var myClient_id = "4b2dab3b-0bf0-4a0e-b253-d1c102da3210.apps.xena.biz";
var myClient_secret = "JjFEh3aanXYrvAi6ZyuIOn7s";
var myRedirect_uri = "https://hidden-brook-94877.herokuapps.com/callback";
app.get("/login", function (req, resp) {
    var myScope = "openid testapi";
    var myNonce = generateRandomString(32);
    resp.redirect("https://login.xena.biz/connect/authorize?" +
        querystring.stringify({
            response_type: "code id_token",
            client_id: myClient_id,
            redirect_uri: myRedirect_uri,
            respons_mode: "form_post",
            grant_type: 'authorization_code',
            scope: myScope,
            nonce: myNonce
        }));
});
/*app.get("/callback", (req, resp) => {
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
                redirect_uri: myRedirect_uri
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

});*/
app.get("/callback", function (req, res) {
    // your application requests refresh and access tokens
    // after checking the state parameter
    var code = req.query.code || null;
    var authOptions = {
        url: 'https://login.xena.biz/connect/token?',
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
            var access_token = body.access_token, refresh_token = body.refresh_token;
            var options = {
                url: 'https://my.xena.biz/',
                headers: { 'Authorization': 'Bearer ' + access_token },
                json: true
            };
            // we can also pass the token to the browser to make requests from there
            res.redirect('/#' +
                querystring.stringify({
                    access_token: access_token,
                    refresh_token: refresh_token
                }));
        }
        else {
            res.redirect('/#' +
                querystring.stringify({
                    error: 'invalid_token'
                }));
        }
    });
});
