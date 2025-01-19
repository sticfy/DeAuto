const express = require("express");
const isEmpty = require("is-empty");
const router = express.Router();
const commonObject = require('../common/common');
const categoryModel = require('../models/category');
const verifyToken = require('../middlewares/jwt_verify/verifyToken');

const { routeAccessChecker } = require('../middlewares/routeAccess');
require('dotenv').config();

const i18next = require('i18next');

// routeAccessChecker("")

router.get('/list', [verifyToken], async (req, res) => {

    let result = await categoryModel.getList();

    for (let index = 0; index < result.length; index++) {
        const element = result[index];
        element.title = JSON.parse(element.title);
    }

    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "Category List",
        "count": result.length,
        "data": result
    });
});

router.get('/activeList', [verifyToken], async (req, res) => {

    let language = req.headers['language']; // Default to English if language is not specified

    let result = await categoryModel.getActiveList();

    for (let index = 0; index < result.length; index++) {
        const element = result[index];
        let titleDataObject = JSON.parse(element.title);

        if (!isEmpty(language)) {
            element.title = titleDataObject[language];
        } else {
            element.title = titleDataObject;
        }
    }

    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "Category List",
        "count": result.length,
        "data": result
    });
});

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

    // title
    if (!isEmpty(req.body.title) && !(req.body.title == undefined)) {
        dataSearchConditionObject.title = {
            "like": req.body.title
        };
    }

    if (req.body.status == 0) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Status should not be 0"

        });
    } else if (isEmpty(req.body.status)) {
        dataSearchConditionObject.status = [1, 2];
    } else if (["1", "2", 1, 2].indexOf(req.body.status) == -1) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Status should be 1 or 2"

        });
    } else {
        dataSearchConditionObject.status = req.body.status;
    }


    let result = await categoryModel.getDataByWhereCondition(dataSearchConditionObject, { "id": "ASC" },
        reqData.limit,
        reqData.offset
    );

    for (let index = 0; index < result.length; index++) {
        const element = result[index];
        let titleDataObject = JSON.parse(element.title);

        if (!isEmpty(language)) {
            element.title = titleDataObject[language];
        } else {
            element.title = titleDataObject;
        }
    }


    let totalData = await categoryModel.getDataByWhereCondition(
        dataSearchConditionObject,
        { "id": "ASC" },
        undefined,
        undefined, ["count(id) as count"]
    );

    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "Category List",
        "totalCount": totalData[0].count,
        "count": result.length,
        "data": result
    });
});



router.post('/add', [verifyToken], async (req, res) => {

    let reqData = {

        "title_en": req.body.title_en,
        "title_dutch": req.body.title_dutch

    }

    // reqData.created_by = req.decoded.userInfo.id;
    // reqData.updated_by = req.decoded.userInfo.id;

    // reqData.created_at = await commonObject.getGMT();
    // reqData.updated_at = await commonObject.getGMT();


    let validateTitleEn = await commonObject.characterLimitCheck(reqData.title_en, "Category");

    if (validateTitleEn.success == false) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": validateTitleEn.message,

        });
    }

    reqData.title_en = validateTitleEn.data;

    let validateTitleDutch = await commonObject.characterLimitCheck(reqData.title_dutch, "Category");

    if (validateTitleDutch.success == false) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": validateTitleDutch.message,

        });
    }

    reqData.title_dutch = validateTitleDutch.data;

    let titleObject = {
        "en": reqData.title_en,
        "dutch": reqData.title_dutch,
    }

    let existingData = await categoryModel.getByJSONTitle(titleObject);

    if (!isEmpty(existingData)) {
        return res.status(409).send({
            "success": false,
            "status": 409,
            "message": existingData[0].status == "1" ? "Any of This Category Title Already Exists." : "Any of This Category Title Already Exists but Deactivate, You can activate it."
        });
    }

    let data = {};
    data.title = JSON.stringify(titleObject);
    data.created_by = req.decoded.userInfo.id;
    data.updated_by = req.decoded.userInfo.id;
    data.created_at = await commonObject.getGMT();
    data.updated_at = await commonObject.getGMT();

    let result = await categoryModel.addNew(data);

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
        "message": "Category Added Successfully."
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

    let existingDataById = await categoryModel.getById(reqData.id);
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
    let validateTitleEn = await commonObject.characterLimitCheck(reqData.title_en, "Category");

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
    let validateTitleDutch = await commonObject.characterLimitCheck(reqData.title_dutch, "Category");

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

    let existingDataByTitle = await categoryModel.getByJSONTitle(titleObject);

    if (!isEmpty(existingDataByTitle) && existingDataByTitle[0].id != reqData.id) {

        isError = 1;
        errorMessage += existingDataByTitle[0].status == "1" ? "Any of This Category Title Already Exist." : "Any of This Category Title Already Exist but Deactivate, You can activate it."
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

        let result = await categoryModel.updateById(reqData.id, data);

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
            "message": "Category successfully updated."
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

    let existingDataById = await categoryModel.getById(reqData.id);
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

    let result = await categoryModel.updateById(reqData.id, data);


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
        "message": "Category successfully deleted."
    });

});

router.put('/changeStatus', [verifyToken], async (req, res) => {

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

    let existingDataById = await categoryModel.getById(reqData.id);
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

    let result = await categoryModel.updateById(reqData.id, data);


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
        "message": "Category status has successfully changed."
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

    let result = await categoryModel.getById(id);

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
            message: "Category Details.",
            data: result[0],
        });

    }

});





module.exports = router;