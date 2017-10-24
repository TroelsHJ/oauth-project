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
