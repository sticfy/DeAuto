const express = require("express");
const isEmpty = require("is-empty");
const router = express.Router();
const commonObject = require('../common/common');
const companyModel = require('../models/company');
const companyReviewModel = require('../models/company-review');
const companyServiceModel = require('../models/company-service');
const consumerModel = require('../models/consumer');
const serviceModel = require('../models/service');
const verifyToken = require('../middlewares/jwt_verify/verifyToken');

let imageFolderPath = `${process.env.backend_url}${process.env.user_profile_image_path_name}`;


const { routeAccessChecker } = require('../middlewares/routeAccess');
require('dotenv').config();

const i18next = require('i18next');

// routeAccessChecker("")

router.post('/add', [verifyToken], async (req, res) => {

    if (req.decoded.userInfo.role_id != 3) {
        return res.status(403).send({
            success: false,
            status: 403,
            message: "You Can't access this route.",
        });
    }

    let reqData = {
        "company_id": req.body.company_id,
        "rating": req.body.rating,
        "opinion": req.body.opinion,
    }


    reqData.user_id = req.decoded.userInfo.id;
    reqData.created_by = req.decoded.userInfo.id;
    reqData.updated_by = req.decoded.userInfo.id;

    reqData.created_at = await commonObject.getGMT();
    reqData.updated_at = await commonObject.getGMT();

    // validate company id
    let validateId = await commonObject.checkItsNumber(reqData.company_id);

    if (validateId.success == false) {
        return res.status(400).send({
            success: false,
            status: 400,
            message: "Company Id Value should be integer.",
        });
    } else {

        req.body.company_id = validateId.data;
        reqData.company_id = validateId.data;

    }

    let companyDetails = await companyModel.getDataByWhereCondition({
        status: 1, id: reqData.company_id
    }, undefined, undefined, undefined, ["id", "company_name", "status"]);

    if (isEmpty(companyDetails)) {
        return res.status(400).send({
            success: false,
            status: 400,
            message: "Invalid Company.",
        });
    }

    let validateRating = await commonObject.checkItsNumber(reqData.rating);

    if (validateRating.success == false) {
        return res.status(400).send({
            success: false,
            status: 400,
            message: "Please provide valid rating.",
        });
    } else {

        req.body.rating = validateRating.data;
        reqData.rating = validateRating.data;

        if (reqData.rating > 5 || reqData.rating == 0) {
            return res.status(400).send({
                success: false,
                status: 400,
                message: "Please provide rating between 1 to 5.",
            });
        }
    }

    if (isEmpty(reqData.opinion)) {
        return res.status(400).send({
            success: false,
            status: 400,
            message: "Please write your opinion for the company.",
        });
    }

    let result = await companyReviewModel.addNew(reqData);

    if (result.affectedRows == undefined || result.affectedRows < 1) {
        return res.status(500).send({
            "success": false,
            "status": 500,
            "message": "Something Wrong in system database."
        });
    }

    return res.status(201).send({
        "success": true,
        "status": 201,
        "message": "Your Review has been Added Successfully."
    });

});

router.post('/list', [verifyToken], async (req, res) => {

    let reqData = {
        "company_id": req.body.company_id,
        "limit": req.body.limit,
        "offset": req.body.offset
    }

    let dataSearchConditionObject = {};
    let validateId = await commonObject.checkItsNumber(reqData.company_id);


    if (validateId.success == false) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Value should be integer."
        });
    } else {
        reqData.company_id = validateId.data;
    }

    let companyDetails = await companyModel.getDataByWhereCondition({ "status": 1, "id": reqData.company_id }, { "id": "DESC" }, undefined, undefined,
        ["id", "company_name", "status"]);

    if (isEmpty(companyDetails)) {

        return res.status(400).send({
            success: false,
            status: 400,
            message: "No data found",
        });

    } else {
        if ((req.decoded.userInfo.role_id == 2) && (req.decoded.profileInfo.company_id != reqData.company_id)) {
            return res.status(404).send({
                success: false,
                status: 404,
                message: "This is not your company data.",
            });
        }

        dataSearchConditionObject.company_id = reqData.company_id;
    }

    dataSearchConditionObject.status = 1;

    if (!isEmpty(req.body.rating)) {
        let validateRating = await commonObject.checkItsNumber(req.body.rating);

        if (validateRating.success == false) {
            return res.status(400).send({
                success: false,
                status: 400,
                message: "Please provide valid rating.",
            });
        } else {

            req.body.rating = validateRating.data;

            if (req.body.rating > 5 || req.body.rating == 0) {
                return res.status(400).send({
                    success: false,
                    status: 400,
                    message: "Please provide rating between 1 to 5.",
                });
            } else {
                dataSearchConditionObject.rating = req.body.rating;
            }
        }
    }

    if (!(await commonObject.checkItsNumber(reqData.limit)).success || reqData.limit < 1) {
        reqData.limit = 5;
    }

    if (!(await commonObject.checkItsNumber(reqData.offset)).success || reqData.offset < 0) {
        reqData.offset = 0;
    }

    let result = await companyReviewModel.getDataByWhereCondition(
        dataSearchConditionObject,
        { "created_at": "DESC" },
        reqData.limit,
        reqData.offset,
        ["id", "user_id", "rating", "opinion", "status", "created_at"]
    );

    for (let index = 0; index < result.length; index++) {
        const element = result[index];

        let userProfileDetails = await commonObject.getUserInfoByUserId(element.user_id);

        if (userProfileDetails.success == true) {
            element.userProfileDetails = userProfileDetails.data;
        } else {
            element.userProfileDetails = {};
        }
    }

    // average review check
    let averageReview = await companyReviewModel.companyAverageReviewById(dataSearchConditionObject.company_id);

    if (averageReview[0].rating == null) {
        averageReview = "";
    } else {
        averageReview = averageReview[0].rating.toFixed(1);
    }


    let totalData = await companyReviewModel.getDataByWhereCondition(
        dataSearchConditionObject,
        { "id": "ASC" },
        undefined,
        undefined, []
    );


    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "Review List.",
        "averageRating": averageReview,
        "imageFolderPath": imageFolderPath,
        "totalCount": totalData.length,
        "count": result.length,
        "data": result
    });
});


router.get("/details/:id", [verifyToken], async (req, res) => {


    let id = req.params.id;

    let validateId = await commonObject.checkItsNumber(id);


    if (validateId.success == false) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Value should be integer."
        });
    } else {
        id = validateId.data;
    }

    let result = await companyReviewModel.getById(id);

    if (isEmpty(result)) {

        return res.status(404).send({
            success: false,
            status: 404,
            message: "No data found",
        });

    } else {

        const element = result[0];

        if ((req.decoded.userInfo.role_id == 2) && (req.decoded.profileInfo.company_id != element.company_id)) {
            return res.status(404).send({
                success: false,
                status: 404,
                message: "This is not your company data.",
            });
        }


        return res.status(200).send({
            success: true,
            status: 200,
            message: "Company Review Details.",
            data: result[0],
        });

    }

});


module.exports = router;