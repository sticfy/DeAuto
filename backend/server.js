const express = require("express");
const cors = require('cors');
const app = express();
const fileUpload = require('express-fileupload');
const path = require('path');
const isEmpty = require("is-empty");
const schedule = require('node-schedule');
const cacheDataObject = require('./api/v1/common/cache-data');
const commonObject = require('./api/v1/common/common');

const { I18n } = require('i18n');
const rateLimit = require('express-rate-limit');

const api_redirect_path = require("./api/api");
const port = process.env.PORT || 3001;
const api_version = 1.0;

const moment = require("moment");

// process.env.TZ = 'Etc/GMT-6';
process.env.TZ = 'UTC/GMT-6';


global.config.language = [
    {"id": 1, "name": "English", "short_name": "en", "image": "en.png", "is_default": false},
    {"id": 2, "name": "Dutch", "short_name": "du", "image": null, "is_default": true}
];


// give publicly access for call public path
app.use(express.static(__dirname + '/public'));
app.use(process.env.user_profile_image_path_name, express.static(process.env.user_profile_image_path));
app.use(process.env.admin_image_path_name, express.static(process.env.admin_image_path));
app.use(process.env.banner_image_path_name, express.static(process.env.banner_image_path));
app.use(process.env.company_logo_path_name, express.static(process.env.company_logo_path));
app.use(process.env.company_user_image_path_name, express.static(process.env.company_user_image_path));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(fileUpload({
    defCharset: 'utf8',
    defParamCharset: 'utf8'
}));

const i18n = new I18n({
    locales: ['en', 'bn'],
    directory: path.join(__dirname, 'translation'),
    defaultLocale: 'bn'
});

app.use(i18n.init);

// pass into a header
app.use(function (req, res, next) {
    req.headers['language'] = isEmpty(req.headers['language']) ? "en" : req.headers['language'];
    i18n.setLocale(req, req.headers['language']);
    next();
});

// Custom handler function for when request limit is reached
const onLimitReached = (req, res, options) => {
    res.status(500).send({
        success: false,
        status: 500,
        message: 'Too many requests, please try again later',

    });
};

// rate limiter
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // maximum number of requests allowed in the windowMs
    message: 'Too many requests, please try again later.',
    handler: onLimitReached // Custom handler function
});


// only in json format
app.use((err, req, res, next) => {

    if (err) {
        res.status(400).send({
            "status": 400,
            'message': "error parsing data, Request is not in a JSON Format",
            "success": false,
        });
    } else {
        next();
    }
});



app.use('/api', limiter, api_redirect_path);

app.get('/status-code', (req, res) => {
    return res.status(200).send({
        "status": 200,
        'message': "error status code",
        "success": true,
        "api v": api_version,
        "data": {
            result: [
                { "code": 200, "details": "Everything is fine" },
                { "code": 201, "details": "Everything is fine and resource is created" },
                { "code": 304, "details": "Resource is not modified" },
                { "code": 400, "details": "Bad request for request format" },
                { "code": 401, "details": "You are not authorized to access this resource" },
                { "code": 403, "details": "No access to this resource" },
                { "code": 404, "details": "Resource not found" },
                { "code": 405, "details": "Method is not allowed" },
                { "code": 409, "details": "Duplicate entry error" },
                { "code": 500, "details": "Internal server error" },
                { "code": 503, "details": "Server is not available now" },
            ]
        },
    })
});



app.all('/*', (req, res) => {
    return res.status(404).send({
        "status": 404,
        "req.method": req.method,
        "redirectUrl": req.protocol + '://' + req.get('host') + req.originalUrl,
        'message': "Unknown url",
        "success": false,
        "api v": api_version
    })
});


app.listen(port, async () => {
    console.log(`Da-auto backend running port ${port}`);
    cacheDataObject.loadCacheData();
});