const express = require("express");
const isEmpty = require("is-empty");
const router = express.Router();
const commonObject = require('../common/common');
const favouriteModel = require('../models/favourite');
const companyModel = require('../models/company');
const companyServiceModel = require('../models/company-service');
const userModel = require("../models/user");

const verifyToken = require('../middlewares/jwt_verify/verifyToken');

const { routeAccessChecker } = require('../middlewares/routeAccess');
require('dotenv').config();

let companyLogoFolderPath = `${process.env.backend_url}${process.env.company_logo_path_name}`;

router.post('/make-favourite', [verifyToken], async (req, res) => {

    if (req.decoded.userInfo.role_id != 3) {
        return res.status(403).send({
            success: false,
            status: 403,
            message: "You Can't access this route.",
        });
    }

    let reqData = {
        "company_id": req.body.company_id
    }

    let data = {};
    data.user_id = req.decoded.userInfo.id;
    data.created_by = req.decoded.userInfo.id;
    data.updated_by = req.decoded.userInfo.id;

    data.created_at = await commonObject.getGMT();
    data.updated_at = await commonObject.getGMT();


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
    } else {
        data.item_id = reqData.company_id;
    }

    // find this already in your favourite list
    let alreadyExist = await favouriteModel.getDataByWhereCondition(
        {
            "status": 1,
            "user_id": req.decoded.userInfo.id,
            "item_id": data.item_id,
            "type": "company"
        }
    );

    if (isEmpty(alreadyExist)) {

        // check company has any service or not
        let companyServiceList = await companyServiceModel.getDataByWhereCondition({ company_id: data.item_id, status: 1 }, { "id": "ASC" },
            undefined,
            undefined
        );

        if (isEmpty(companyServiceList)) {
            return res.status(400).send({
                success: false,
                status: 400,
                message: "This company does not have any service.",
            });
        }

        data.type = "company";

        // insert to DB
        let result = await favouriteModel.addNew(data);

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
            "message": "This has been added to favorite list."
        });
    } else {
        // update by removing from favourite

        let updateData = {};

        updateData.status = 0;
        updateData.updated_by = req.decoded.userInfo.id;
        updateData.updated_at = await commonObject.getGMT();

        let result = await favouriteModel.updateById(alreadyExist[0].id, updateData);

        if (result.affectedRows == undefined || result.affectedRows < 1) {
            return res.status(500).send({
                "success": false,
                "status": 500,
                "message": "Something Wrong in system database."
            });
        }

        return res.status(200).send({
            "success": true,
            "status": 200,
            "message": "This has been removed from favorite list."
        });

    }

});


router.post('/my-favourite-list', [verifyToken], async (req, res) => {

    let language = req.headers['language'];

    let reqData = {
        "limit": req.body.limit,
        "offset": req.body.offset
    }

    let dataSearchConditionObject = {
        "status": 1
    };

    // favourite properties
    let favoriteProperties = await favouriteModel.getDataByWhereCondition(
        {
            "status": 1,
            "user_id": req.decoded.userInfo.id,
            "type": "company"
        }, { "created_at": "DESC" }
    );


    let companyIds = [];

    for (let i = 0; i < favoriteProperties.length; i++) {

        let companyId = favoriteProperties[i].item_id;

        // Check if companyIds is already in categoryIds array
        if (!companyIds.includes(companyId)) {
            companyIds.push(companyId);
        }
    }

    if (isEmpty(companyIds)) {
        companyIds = [0];
    }

    // insert property id in data search object
    dataSearchConditionObject.id = {
        "IN": companyIds
    }


    if (!(await commonObject.checkItsNumber(reqData.limit)).success || reqData.limit < 1) {
        reqData.limit = 5;
    }

    if (!(await commonObject.checkItsNumber(reqData.offset)).success || reqData.offset < 0) {
        reqData.offset = 0;
    }

    let result = await companyModel.getDataByWhereCondition(
        dataSearchConditionObject,
        { "created_at": "DESC" },
        reqData.limit,
        reqData.offset,
        ["id", "company_name", "logo", "status"]
    );

    for (let index = 0; index < result.length; index++) {
        const element = result[index];

        let companyBasedInformation = await commonObject.companyOtherInformationById(element.id, req.decoded.userInfo.id);
        element.companyOtherInfo = companyBasedInformation;

        if (!isEmpty(language) && !isEmpty(element.companyOtherInfo.categoryList)) {
            for (let index = 0; index < element.companyOtherInfo.categoryList.length; index++) {
                const category = element.companyOtherInfo.categoryList[index];
                category.title = category.title[language];
            }
        }
    }



    let totalData = await companyModel.getDataByWhereCondition(
        dataSearchConditionObject,
        { "id": "ASC" },
        undefined,
        undefined, []
    );



    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "Favourite List.",
        "companyLogoFolderPath": companyLogoFolderPath,
        "totalCount": totalData.length,
        "count": result.length,
        "data": result
    });
});



module.exports = router;