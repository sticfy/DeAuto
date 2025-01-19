const express = require("express");
const isEmpty = require("is-empty");
const router = express.Router();
const commonObject = require('../common/common');
const faqModel = require('../models/faq');
const verifyToken = require('../middlewares/jwt_verify/verifyToken');

const { routeAccessChecker } = require('../middlewares/routeAccess');
require('dotenv').config();

const i18next = require('i18next');


// routeAccessChecker("")

router.get('/list', [verifyToken], async (req, res) => {

    let result = await faqModel.getList();

    for (let index = 0; index < result.length; index++) {
        const element = result[index];
        element.question = JSON.parse(element.question);
        element.answer = JSON.parse(element.answer);
    }

    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "Faq List",
        "count": result.length,
        "data": result
    });
});

router.get('/activeList', [verifyToken], async (req, res) => {

    let language = req.headers['language']; // Default to English if language is not specified

    let result = await faqModel.getActiveList();

    for (let index = 0; index < result.length; index++) {
        const element = result[index];
        let questionDataObject = JSON.parse(element.question);
        let answerDataObject = JSON.parse(element.answer);

        if (!isEmpty(language)) {
            element.question = questionDataObject[language];
            element.answer = answerDataObject[language];
        }
    }

    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "Faq List",
        "count": result.length,
        "data": result
    });
});

router.post('/list', [verifyToken], async (req, res) => {

    let language = req.headers['language']; // Default to English if language is not specified

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


    let result = await faqModel.getDataByWhereCondition(dataSearchConditionObject, { "id": "ASC" },
        reqData.limit,
        reqData.offset
    );

    for (let index = 0; index < result.length; index++) {
        const element = result[index];
        let questionDataObject = JSON.parse(element.question);
        let answerDataObject = JSON.parse(element.answer);

        if (!isEmpty(language)) {
            element.question = questionDataObject[language];
            element.answer = answerDataObject[language];
        }
    }


    let totalData = await faqModel.getDataByWhereCondition(
        dataSearchConditionObject,
        { "id": "ASC" },
        undefined,
        undefined, ["count(id) as count"]
    );

    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "Faq List",
        "totalCount": totalData[0].count,
        "count": result.length,
        "data": result
    });
});



router.post('/add', [verifyToken], async (req, res) => {

    let reqData = {

        "question_en": req.body.question_en,
        "question_dutch": req.body.question_dutch,
        "answer_en": req.body.answer_en,
        "answer_dutch": req.body.answer_dutch,

    }

    if (isEmpty(reqData.question_en) || isEmpty(reqData.question_dutch)) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Please provide Questions."

        });
    }

    if (isEmpty(reqData.answer_en) || isEmpty(reqData.answer_dutch)) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Please provide Answers."

        });
    }

    let questionObject = {
        "en": reqData.question_en,
        "dutch": reqData.question_dutch,
    }

    let existingData = await faqModel.getByJSONTitle(questionObject);

    if (!isEmpty(existingData)) {
        return res.status(409).send({
            "success": false,
            "status": 409,
            "message": existingData[0].status == "1" ? "Any of This Question Already Exists." : "Any of This Question Already Exists but Deactivate, You can activate it."
        });
    }

    let answerObject = {
        "en": reqData.answer_en,
        "dutch": reqData.answer_dutch,
    }

    let data = {};
    data.question = JSON.stringify(questionObject);
    data.answer = JSON.stringify(answerObject);
    data.created_by = req.decoded.userInfo.id;
    data.updated_by = req.decoded.userInfo.id;
    data.created_at = await commonObject.getGMT();
    data.updated_at = await commonObject.getGMT();

    let result = await faqModel.addNew(data);

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
        "message": "Faq Added Successfully."
    });

});



router.put('/update', [verifyToken], async (req, res) => {

    let reqData = {
        "id": req.body.id,
        "question_en": req.body.question_en,
        "question_dutch": req.body.question_dutch,
        "answer_en": req.body.answer_en,
        "answer_dutch": req.body.answer_dutch,
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

    let existingDataById = await faqModel.getById(reqData.id);
    if (isEmpty(existingDataById)) {

        return res.status(404).send({
            "success": false,
            "status": 404,
            "message": "No data found",

        });
    } else {
        existingDataById[0].question = JSON.parse(existingDataById[0].question);
        existingDataById[0].answer = JSON.parse(existingDataById[0].answer);
    }

    let updateData = {};

    let errorMessage = "";
    let isError = 0; // 1 = yes, 0 = no
    let willWeUpdate = 0; // 1 = yes , 0 = no;


    let questionObject = {
        "en": isEmpty(reqData.question_en) ? existingDataById[0].question.en : reqData.question_en,
        "dutch": isEmpty(reqData.question_dutch) ? existingDataById[0].question.dutch : reqData.question_dutch,
    }

    let existingDataByTitle = await faqModel.getByJSONTitle(questionObject);

    if (!isEmpty(existingDataByTitle) && existingDataByTitle[0].id != reqData.id) {

        isError = 1;
        errorMessage += existingDataByTitle[0].status == "1" ? "Any of This Question Already Exist." : "Any of This Question Already Exist but Deactivate, You can activate it."
    }

    let answerObject = {
        "en": isEmpty(reqData.answer_en) ? existingDataById[0].answer.en : reqData.answer_en,
        "dutch": isEmpty(reqData.answer_dutch) ? existingDataById[0].answer.dutch : reqData.answer_dutch,
    }

    if (isError == 1) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": errorMessage
        });
    }

    let data = {};
    data.question = JSON.stringify(questionObject);
    data.answer = JSON.stringify(answerObject);
    data.updated_by = req.decoded.userInfo.id;
    data.updated_at = await commonObject.getGMT();


    let result = await faqModel.updateById(reqData.id, data);

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
        "message": "Faq successfully updated."
    });


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

    let existingDataById = await faqModel.getById(reqData.id);
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

    let result = await faqModel.updateById(reqData.id, data);


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
        "message": "Faq successfully deleted."
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

    let existingDataById = await faqModel.getById(reqData.id);
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

    let result = await faqModel.updateById(reqData.id, data);


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
        "message": "Faq status has successfully changed."
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

    let result = await faqModel.getById(id);

    if (isEmpty(result)) {

        return res.status(404).send({
            success: false,
            status: 404,
            message: "No data found",
        });

    } else {
        const element = result[0];
        element.question = JSON.parse(element.question);
        element.answer = JSON.parse(element.answer);


        return res.status(200).send({
            success: true,
            status: 200,
            message: "Faq Details.",
            data: result[0],
        });

    }

});





module.exports = router;