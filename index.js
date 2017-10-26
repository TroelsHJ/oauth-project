"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//#region imports
var Express = require("express");
var app = Express();
var querystring = require("query-string");
var request = require("request");
var FileHandler = require("fs");
//#endregion
//#region server_setup
app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'), function () {
    console.log("Server is running on port", app.get('port'));
});
//#endregion ´
app.get("/", function (req, resp) {
    resp.sendFile(__dirname + "/index.html");
});
function generateRandomString(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
;
var secretKey = FileHandler.readFileSync("./secretKey.txt", "utf8");
var myClient_id = "4b2dab3b-0bf0-4a0e-b253-d1c102da3210.apps.xena.biz";
var myClient_secret = secretKey;
var myRedirect_uri = "https://hidden-brook-94877.herokuapps.com/callback";
app.get('/login', function (req, res) {
    var nonce = "" + generateRandomString(32);
    var scope = "openid profile";
    res.redirect('https://login.xena.biz/connect/authorize?' +
        querystring.stringify({
            response_type: 'code id_token',
            client_id: myClient_id,
            redirect_uri: myRedirect_uri,
            response_mode: "form_post",
            scope: 'openid testapi',
            nonce: nonce
        }));
});
app.get("/callback", function (req, resp) {
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
            resp.redirect('/#' +
                querystring.stringify({
                    access_token: access_token,
                    refresh_token: refresh_token
                }));
        }
        else {
            resp.redirect('/#' +
                querystring.stringify({
                    error: 'invalid_token'
                }));
        }
    });
});
