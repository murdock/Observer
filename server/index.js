//noinspection JSUnresolvedVariable
const fs = require('fs');
// const http = require('http');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const cors = require('cors');
// environmental variable importing
const dotenv = require('dotenv');
// Webpack imports
const webpack = require('webpack');
const config = require('../webpack.config');
let useragent = require('useragent');
dotenv.config();

const PATH_DATA = path.resolve(__dirname, './data');

const compiler = webpack(config);
const serverPort = 8086;
const env = process.env;
const app = express();

const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: env.WS_PORT });

const broadcast = (data, ws) => {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN && client !== ws) {
            client.send(JSON.stringify(data))
        }
    })
};

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

// ========= WebSocket ==================
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
    next();
});

// app root folder path
const root = path.resolve(__dirname, '..'); // __dirname is a global variable available in any file and refers to that file's directory path
//static folders
app.use(express.static(path.join(root, 'public')));

app.use('/data', express.static(PATH_DATA));

// Handle route errors
app.use((err, req, res, next) => {
    console.log(err); // log to back end console
    res.status(err.status || 500);
    return next(err.message); // send error message text to front end
});
// Serve data from root
app.get('*', (req, res, next) => {
    // console.log("[SERVER]: SEND FILE => ", req.url);
    res.sendFile('/index.html', {
        root: path.join(root, 'public')
    });
});

// // catch 404 and forward to error handler
// app.use((req, res, next) => {
//     console.log("404 ? ", req.body);
//     const err = new Error('Not Found');
//     err.status = 404;
//     return next(err);
// });

wss.on('connection', (ws) => {

    ws.on('message', (message) => {
        const data = message;
        console.log("%received: ", data);
        try {
            if (JSON.parse(data).temperature) {
                ws.send(JSON.stringify({
                    data: data
                }));
            }
        } catch (e) {
            console.log("Error on parse JSON: ", e);
        }


        broadcast({
            data: data
        }, ws);
    });

    ws.on('close', () => {

        broadcast({
            type: 'CLOSED',
            reason: 'WS closed connection'
        }, ws)
    })
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
// const getESPData = (callback) => {
//
//     const postData = JSON.stringify({
//         'msg': 'Hello World!'
//     });
//
//     const options = {
//         hostname: '192.168.1.11',
//         port: 80,
//         path: '/test',
//         method: 'GET',
//         headers: {
//             'Content-Type': 'application/x-www-form-urlencoded',
//             'Content-Length': postData.length
//         }
//     };
//     wss.on('connection', (ws) => {
//         ws.on('message', (message) => {
//             console.log('received: %s', message);
//             ws.send(message);
//             callback(message);
//         });
//         //ws.send(chunk);
//     });
//     const req = http.request(options, (res) => {
//
//         console.log(`STATUS: ${res.statusCode}`);
//         console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
//
//         res.setEncoding('utf8');
//
//         res.on('data', (chunk) => {
//             console.log(`BODY: ${chunk}`);
//
//             wss.on('connection', (ws) => {
//                 ws.on('message', (message) => {
//                     console.log('received: %s', message)
//                 });
//                 //ws.send(chunk);
//             });
//             callback(chunk);
//         });
//         res.on('end', () => {
//             console.log('No more data in response.');
//         });
//     });
//
//     req.on('error', (e) => {
//         console.error(`problem with request: ${e.message}`);
//     });
//
// // write data to request body
//     req.write(postData);
//     req.end();
//};



