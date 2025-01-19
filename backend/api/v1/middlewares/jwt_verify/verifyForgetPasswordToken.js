var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
const isEmpty = require("is-empty");

router.use(async function (req, res, next) {
    const token = req.body.token;


    if (token) {
        jwt.verify(token, global.config.secretKey,
            {
                algorithm: global.config.algorithm

            }, async function (err, decoded) {
                if (err) return res.status(401)
                    .send({
                        "success": false,
                        "status": 401,
                        "message": "Token time expired."
                    });

                req.decoded = decoded;
                next();
            });

    } else {

        return res.status(404)
            .send({
                "success": false,
                "status": 404,
                "message": "Please give token."
            });
    }
});

module.exports = router;