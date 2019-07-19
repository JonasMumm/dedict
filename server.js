
const express = require('express');
const expressBodyParser = require("body-parser");
const app = express();
const isDev = app.get('env') === 'development';

app.set('views', __dirname + '/views');

const expressNunjucks = require('express-nunjucks');
const njk = expressNunjucks(app, {
    watch: isDev,
    noCache: isDev,
    autoescape: true
});
const useLocalHost=false;

const model = require("./src/model");
const controller = require("./src/controller");

console.log("Prepparing!");
model.connectionInit(() => { dbInitialized() });

const appURL=useLocalHost?"":"/dedict";
function dbInitialized() {

app.use(`${appURL}/public`, express.static('public'));

//app.get(`${appURL}`,expressBodyParser.urlencoded({ extended: true }),(req, res) => controllerStats.actionStatsCurrent(req,res));
app.get(`${appURL}`,expressBodyParser.urlencoded({ extended: true }),(req, res) => {res.render("index.html")});
app.get(`${appURL}/scrollload/:requested_id/:requested_direction`,expressBodyParser.urlencoded({ extended: true }),(req, res) => {controller.scrollLoad(req,res)});
app.get(`${appURL}/word_id/:word`,expressBodyParser.urlencoded({ extended: true }),(req, res) => {controller.word_id(req,res)});

    app.use((req, res) => { res.status(404).send("Error 404 - Page not found") });

    if(useLocalHost)
    app.listen(3000, () => console.log("Listening at port 3000."));
    else
    app.listen(() => console.log("Listening at no specific port."));
}
