const express = require("express");
const isEmpty = require("is-empty");
const router = express.Router();
const commonObject = require('../common/common');
const companyServiceModel = require('../models/company-service');
const serviceModel = require('../models/service');
const categoryModel = require('../models/category');
const verifyToken = require('../middlewares/jwt_verify/verifyToken');

const companyServiceValidation = require('../middlewares/requestData/company-service-data');

const { routeAccessChecker } = require('../middlewares/routeAccess');
require('dotenv').config();

const i18next = require('i18next');

// routeAccessChecker("")


router.post('/list', [verifyToken], async (req, res) => {

    let language = req.headers['language'];

    let reqData = {
        "limit": req.body.limit,
        "offset": req.body.offset,
    }

    if (!(await commonObject.checkItsNumber(reqData.limit)).success || reqData.limit < 1) {
        reqData.limit = 50;
    }

    if (!(await commonObject.checkItsNumber(reqData.offset)).success || reqData.offset < 0) {
        reqData.offset = 0;
    }

    let dataSearchConditionObject = {};

    if (req.body.status == 0) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Status should not be 0"

        });
    } else if (isEmpty(req.body.status)) {
        dataSearchConditionObject.status = { "GT": 0 };
    } else if (["1", "2", "3", 1, 2, 3].indexOf(req.body.status) == -1) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Status should be 1 or 2 or 3"

        });
    } else {
        dataSearchConditionObject.status = req.body.status;
    }


    // company id search
    if (req.decoded.userInfo.role_id == 1) {
        if (req.body.company_id != undefined) {
            dataSearchConditionObject.company_id = req.body.company_id;
        }
    } else if (req.decoded.userInfo.role_id == 2) {
        dataSearchConditionObject.company_id = req.decoded.profileInfo.company_id;
    }

    let result = await companyServiceModel.getDataByWhereCondition(dataSearchConditionObject, { "id": "ASC" },
        reqData.limit,
        reqData.offset
    );

    for (let index = 0; index < result.length; index++) {
        const element = result[index];

        let companyServiceDataObject = JSON.parse(element.service_name);

        if (!isEmpty(language)) {
            element.service_name = companyServiceDataObject[language];
        } else {
            element.service_name = companyServiceDataObject;
        }

        // service details
        if (element.service_id != 0) {
            let serviceDetails = await serviceModel.getDataByWhereCondition({ "status": [1, 2], "id": element.service_id }, { "id": "DESC" }, undefined, undefined,
                ["id", "title", "status"]);

            if (isEmpty(serviceDetails)) {
                element.serviceDetails = {};
            } else {

                let serviceTitleDataObject = JSON.parse(serviceDetails[0].title);

                if (!isEmpty(language)) {
                    serviceDetails[0].title = serviceTitleDataObject[language];
                } else {
                    serviceDetails[0].title = serviceTitleDataObject;
                }

                element.serviceDetails = serviceDetails[0];
            }
        } else {
            element.serviceDetails = {};
        }

        // category Details
        let categoryDetails = await categoryModel.getDataByWhereCondition({ "status": [1, 2], "id": element.category_id }, { "id": "DESC" }, undefined, undefined,
            ["id", "title", "status"]);

        if (isEmpty(categoryDetails)) {
            element.categoryDetails = {};
        } else {
            let titleDataObject = JSON.parse(categoryDetails[0].title);

            if (!isEmpty(language)) {
                categoryDetails[0].title = titleDataObject[language];
            } else {
                categoryDetails[0].title = titleDataObject;
            }

            element.categoryDetails = categoryDetails[0];
        }

    }


    let totalData = await companyServiceModel.getDataByWhereCondition(
        dataSearchConditionObject,
        { "id": "ASC" },
        undefined,
        undefined, ["count(id) as count"]
    );

    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "Company Service List",
        "totalCount": totalData[0].count,
        "count": result.length,
        "data": result
    });
});



router.post('/add', [verifyToken, companyServiceValidation], async (req, res) => {

    let requestData = req.requestData;

    let companyServiceObject = {};

    companyServiceObject = { ...requestData };

    companyServiceObject.created_by = req.decoded.userInfo.id;
    companyServiceObject.updated_by = req.decoded.userInfo.id;
    companyServiceObject.created_at = await commonObject.getGMT();
    companyServiceObject.updated_at = await commonObject.getGMT();


    let result = await companyServiceModel.addNew(companyServiceObject);

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
        "message": "Company Service Added Successfully."
    });

});



router.put('/update', [verifyToken], async (req, res) => {

    let reqData = {
        "id": req.body.id,
        "title_en": req.body.title_en,
        "title_dutch": req.body.title_dutch
    }

    let validateId = await commonObject.checkItsNumber(reqData.id);
    if (validateId.success == false) {

        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Value should be integer.",
            "id": reqData.id

        });
    } else {
        req.body.id = validateId.data;
        reqData.id = validateId.data;

    }

    let existingDataById = await companyServiceModel.getById(reqData.id);
    if (isEmpty(existingDataById)) {

        return res.status(404).send({
            "success": false,
            "status": 404,
            "message": "No data found",

        });
    } else {
        existingDataById[0].title = JSON.parse(existingDataById[0].title);
    }

    let updateData = {};

    let errorMessage = "";
    let isError = 0; // 1 = yes, 0 = no
    let willWeUpdate = 0; // 1 = yes , 0 = no;

    // title en
    let validateTitleEn = await commonObject.characterLimitCheck(reqData.title_en, "Company Service");

    if (validateTitleEn.success == false) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": validateTitleEn.message,

        });
    } else {
        willWeUpdate = 1;
        updateData.title_en = validateTitleEn.data;
    }

    // title dutch
    let validateTitleDutch = await commonObject.characterLimitCheck(reqData.title_dutch, "Company Service");

    if (validateTitleDutch.success == false) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": validateTitleDutch.message,

        });
    } else {
        willWeUpdate = 1;
        updateData.title_dutch = validateTitleDutch.data;
    }

    let titleObject = {
        "en": isEmpty(updateData.title_en) ? existingDataById[0].title.en : updateData.title_en,
        "dutch": isEmpty(updateData.title_dutch) ? existingDataById[0].title.dutch : updateData.title_dutch,
    }

    let existingDataByTitle = await companyServiceModel.getByJSONTitle(titleObject);

    if (!isEmpty(existingDataByTitle) && existingDataByTitle[0].id != reqData.id) {

        isError = 1;
        errorMessage += existingDataByTitle[0].status == "1" ? "Any of This Company Service Title Already Exist." : "Any of This Company Service Title Already Exist but Deactivate, You can activate it."
    }


    if (isError == 1) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": errorMessage
        });
    }

    if (willWeUpdate == 1) {

        let data = {};
        data.title = JSON.stringify(titleObject);
        data.updated_by = req.decoded.userInfo.id;
        data.updated_at = await commonObject.getGMT();

        let result = await companyServiceModel.updateById(reqData.id, data);

        if (result.affectedRows == undefined || result.affectedRows < 1) {
            return res.status(500).send({
                "success": true,
                "status": 500,
                "message": "Something Wrong in system database."
            });
        }


        return res.status(200).send({
            "success": true,
            "status": 200,
            "message": "Company Service successfully updated."
        });


    } else {
        return res.status(200).send({
            "success": true,
            "status": 200,
            "message": "Nothing to update."
        });
    }

});



router.delete('/delete', [verifyToken], async (req, res) => {

    if (req.decoded.userInfo.role_id == 3) {
        return res.status(403).send({
            success: false,
            status: 403,
            message: "Can't access this route.",
        });
    }


    let reqData = {
        "id": req.body.id
    }

    reqData.updated_by = req.decoded.userInfo.id;

    let validateId = await commonObject.checkItsNumber(reqData.id);


    if (validateId.success == false) {

        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Value should be integer."

        });
    } else {
        req.body.id = validateId.data;
        reqData.id = validateId.data;

    }

    let company_id;
    if (req.decoded.userInfo.role_id == 1) {
        company_id = req.body.company_id;
    } else {
        company_id = req.decoded.profileInfo.company_id;
    }

    let existingDataById = await companyServiceModel.getDataByWhereCondition({ "id": reqData.id, "status": { "not eq": 0 }, "company_id": company_id });

    if (isEmpty(existingDataById)) {

        return res.status(404).send({
            "success": false,
            "status": 404,
            "message": "No data found",

        });
    }

    let data = {
        status: 0,
        updated_by: reqData.updated_by,
        updated_at: await commonObject.getGMT()
    }

    let result = await companyServiceModel.updateById(reqData.id, data);


    if (result.affectedRows == undefined || result.affectedRows < 1) {
        return res.status(500).send({
            "success": true,
            "status": 500,
            "message": "Something Wrong in system database."
        });
    }


    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "Company Service successfully deleted."
    });

});

router.put('/change-status', [verifyToken], async (req, res) => {

    let reqData = {
        "id": req.body.id
    }

    reqData.updated_by = req.decoded.userInfo.id;

    let validateId = await commonObject.checkItsNumber(reqData.id);


    if (validateId.success == false) {

        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Value should be integer."

        });
    } else {
        req.body.id = validateId.data;
        reqData.id = validateId.data;

    }

    let company_id;
    if (req.decoded.userInfo.role_id == 1) {
        company_id = req.body.company_id;
    } else {
        company_id = req.decoded.profileInfo.company_id;
    }

    let existingDataById = await companyServiceModel.getDataByWhereCondition({ "id": reqData.id, "status": [1, 2], "company_id": company_id });

    if (isEmpty(existingDataById)) {

        return res.status(404).send({
            "success": false,
            "status": 404,
            "message": "No data found",

        });
    }

    let data = {
        status: existingDataById[0].status == 1 ? 2 : 1,
        updated_by: reqData.updated_by,
        updated_at: await commonObject.getGMT()
    }

    let result = await companyServiceModel.updateById(reqData.id, data);


    if (result.affectedRows == undefined || result.affectedRows < 1) {
        return res.status(500).send({
            "success": true,
            "status": 500,
            "message": "Something Wrong in system database."
        });
    }


    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "Company Service status has successfully changed."
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

    let result = await companyServiceModel.getById(id);

    if (isEmpty(result)) {

        return res.status(404).send({
            success: false,
            status: 404,
            message: "No data found",
        });

    } else {

        const element = result[0];
        element.title = JSON.parse(element.title);

        return res.status(200).send({
            success: true,
            status: 200,
            message: "Company Service Details.",
            data: result[0],
        });

    }

});





module.exports = router;