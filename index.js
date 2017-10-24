"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Express = require("express");
var app = Express();
app.set('port', (process.env.PORT || 5000));
app.get("/", function (req, resp) {
    resp.send("Hey!");
});
app.listen(app.get('port'), function () {
    console.log("Server is running on port ", app.get('port'));
});
var BodyParser = require("body-parser");
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
var querystring = require("query-string");
var request = require("request");
//import * as cookieParser from 'cookie-parser';
//app.use (Express.static(__dirname + "/public")).use(cookieParser());
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
var myRedirect_uri = "https://hidden-brook-94877/callback";
var stateKey = "spotify<<_auth_state";
app.get("/login", function (req, resp) {
    var myScope = "api";
    var myState = generateRandomString(16);
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
app.get("/callback", function (req, resp) {
    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;
    if (state === null || state !== storedState) {
        resp.redirect('/#' +
            querystring.stringify({
                error: 'state_mismatch'
            }));
    }
    else {
        resp.clearCookie(stateKey);
        var authOptions = {
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
                var access_token = body.access_token, refresh_token = body.refresh_token;
                var options = {
                    url: 'https://login.xena.biz/connect/authorize?',
                    headers: { 'Authorization': 'Bearer ' + access_token },
                    json: true
                };
            }
        });
    }
});
