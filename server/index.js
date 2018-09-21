const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const webpack = require('webpack');
const config = require('../webpack.config');
const compiler = webpack(config);
const serverPort = process.env.PORT;
const app = express();

if (process.env.NODE_ENV !== 'production') {
    app.use(require("webpack-dev-middleware")(compiler, {
        noInfo: false,
        publicPath: config.output.publicPath,
    }));
    app.use(require("webpack-hot-middleware")(compiler));
}

app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
    next();
});


const root = path.resolve(__dirname, '..');
app.use('/public',express.static(path.join(root, 'public')));

// Handle route errors
app.use((err, req, res, next) => {
    console.log(err); // log to back end console
    res.status(err.status || 500);
    return next(err.message); // send error message text to front end
});

app.get('*', (req, res, next) => {
    res.sendFile('/index.html', {
        root: path.join(root, 'public')
    });
});

//catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    return next(err);
});

app.listen(serverPort, (err, res) => {
    err ? handleError(err) : console.log("APP is on PORT " + serverPort);
});

const handleError = (err) => {
    switch (err.code) {
        case 'EACCES':
            console.error(`port ${serverPort} requires elevated privileges`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(`port ${serverPort} is already in use`);
            process.exit(1);
            break;
        default:
            console.log(err);
            process.exit(1);
    }
};