const express = require("express");
const isEmpty = require("is-empty");
const router = express.Router();
const commonObject = require('../common/common');
const genderModel = require('../models/gender');
const verifyToken = require('../middlewares/jwt_verify/verifyToken');
const fileUploaderCommonObject = require("../common/fileUploader");

const { routeAccessChecker } = require('../middlewares/routeAccess');
require('dotenv').config();

const i18next = require('i18next');

// routeAccessChecker("")


router.get('/list', [verifyToken], async (req, res) => {

    let result = await genderModel.getList();

    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "Gender List",
        "count": result.length,
        "data": result
    });
});

router.get('/activeList', [], async (req, res) => {

    let result = await genderModel.getDataByWhereCondition({"status" : 1});

    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "Gender List",
        "count": result.length,
        "data": result
    });
});







module.exports = router;