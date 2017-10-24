import * as Express from 'express';
let app = Express();

app.set('port', (process.env.PORT || 5000));

app.get("/", (req, resp) => {
    resp.send("Hey!");
});

app.listen(app.get('port'), () => {
    console.log("Server is running on port ", app.get('port'));
});