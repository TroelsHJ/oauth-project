//#region imports
import * as Express from 'express';
let app = Express();
import * as querystring from 'query-string';
import * as request from 'request';
import * as FileHandler from 'fs';
import * as HTTP from 'http-status-codes';
import { Resource } from 'hal';
import * as BodyParser from 'body-parser';
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
//#endregion

//#region server_setup
app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'), () => {
    console.log("Server is running on port", app.get('port'));
});
//#endregion ´


app.get("/", (req, resp) => {
    resp.sendFile(__dirname + "/index.html");
});


function generateRandomString(length: any) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

let secretKey = FileHandler.readFileSync("./secretKey.txt", "utf8");
let myClient_id = "4b2dab3b-0bf0-4a0e-b253-d1c102da3210.apps.xena.biz";
let myClient_secret = "JjFEh3aanXYrvAi6ZyuIOn7s";
let myRedirect_uri = "https://hidden-brook-94877.herokuapp.com/callback"

app.get('/login', function (req, res) {
    let nonce = "" + generateRandomString(32);
    res.redirect('https://login.xena.biz/connect/authorize?' +
        querystring.stringify({
            response_type: 'code id_token',
            client_id: myClient_id,
            redirect_uri: myRedirect_uri,
            response_mode: "form_post",
            scope: 'openid testapi',
            nonce: nonce,
            json: true
        }));
});

app.post("/callback", function (req, resp) {

    let code = req.body.code || null;

    let authOptions = {
        url: 'https://login.xena.biz/connect/token?',
        form: {
            code: code,
            client_id: myClient_id,
            client_secret: myClient_secret,
            redirect_uri: myRedirect_uri,
            grant_type: 'authorization_code',
            response_mode: "form_post"
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
                url: 'https://my.xena.biz/',
                headers: { 'Authorization': 'Bearer ' + access_token },
                json: true
            };

            resp.redirect('eb.dk' +
                querystring.stringify({
                    access_token: access_token,
                    refresh_token: refresh_token
                }));
        } else {
            resp.redirect('/#' +
                querystring.stringify({
                    error: 'invalid_token'
                }));

            console.log(error);
        }
    });

});

/*
app.get("/fun", (req, resp) => {
    let access_token = req.query.access_token;

    let options = {
        url: 'https://my.xena.biz/',
        headers: { 'Authorization': 'Bearer ' + access_token },
        json: true
    };

    request.get(options, function (error, response, body) {
        if (!body.error) {
            let result = new Resource({}, "/quote");
            result.link("quote: " + "addQuote", "https://eb.dk");
            result.link("curie", { href: "/", templated: true, name: "quote" });
            resp.status(HTTP.OK).json(result);
        } else
            resp.status(HTTP.UNAUTHORIZED).send("You are not logged in to XENA");
    });


});
*/


