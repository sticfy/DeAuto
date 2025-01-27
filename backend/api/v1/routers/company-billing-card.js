const express = require("express");
const isEmpty = require("is-empty");
const router = express.Router();
const commonObject = require('../common/common');
const billingCardModel = require('../models/company-billing-card');
const verifyToken = require('../middlewares/jwt_verify/verifyToken');
const { routeAccessChecker } = require('../middlewares/routeAccess');
require('dotenv').config();

const dataEncryptionObject = require("../common/data-encryption");

router.get('/list', [verifyToken], async (req, res) => {  // routeAccessChecker("Billing Card listList")

    if (req.decoded.userInfo.role_id == 1) {
        return res.status(403).send({
            success: false,
            status: 403,
            message: "Can't access this route.",
        });
    }

    let result = await billingCardModel.getDataByWhereCondition(
        { "company_id": req.decoded.profileInfo.company_id, status: 1 },
        { "id": "DESC" }, undefined, undefined,
        ["id", "company_id", "card_type", "card_holder_name", "card_number", "cvv", "expired_month", "expired_year", "status"]
    );

    for (let index = 0; index < result.length; index++) {
        const element = result[index];

        element.card_holder_name = await dataEncryptionObject.decryptData(element.card_holder_name);
        element.card_number = await dataEncryptionObject.decryptData(element.card_number);
        element.cvv = await dataEncryptionObject.decryptData(element.cvv);

    }

    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "Billing Card active List.",
        "count": result.length,
        "data": result
    });
});

router.get('/activeList', [verifyToken], async (req, res) => {

    if (req.decoded.userInfo.role_id == 1) {
        return res.status(403).send({
            success: false,
            status: 403,
            message: "Can't access this route.",
        });
    }

    let result = await billingCardModel.getDataByWhereCondition({ "status": 1, "company_id": req.decoded.profileInfo.company_id }, { "id": "DESC" }, undefined, undefined,
        ["id", "company_id", "card_type", "card_holder_name", "card_number", "cvv", "expired_month", "expired_year", "status"]
    );

    for (let index = 0; index < result.length; index++) {
        const element = result[index];

        element.card_holder_name = await dataEncryptionObject.decryptData(element.card_holder_name);
        element.card_number = await dataEncryptionObject.decryptData(element.card_number);
        element.cvv = await dataEncryptionObject.decryptData(element.cvv);

    }

    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "Billing Card active List.",
        "count": result.length,
        "data": result
    });
});

router.post('/list', [verifyToken], async (req, res) => {  // routeAccessChecker("Billing Card listListLimit")

    if (req.decoded.userInfo.role_id == 1) {
        return res.status(403).send({
            success: false,
            status: 403,
            message: "Can't access this route.",
        });
    }

    let reqData = {
        "limit": req.body.limit,
        "offset": req.body.offset,
        "status": req.body.status
    }

    let dataSearchConditionObject = { "company_id": req.decoded.profileInfo.company_id };


    if (req.body.status == 0) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Status should not be 0"

        });
    } else if (isEmpty(req.body.status)) {
        dataSearchConditionObject.status = 1;
    } else if (["1", "2", 1, 2].indexOf(req.body.status) == -1) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Status should be 1 or 2"

        });
    } else {
        dataSearchConditionObject.status = req.body.status;
    }

    if (!(await commonObject.checkItsNumber(reqData.limit)).success || reqData.limit < 1) {
        dataSearchConditionObject.limit = 50;
    }

    if (!(await commonObject.checkItsNumber(reqData.offset)).success || reqData.offset < 0) {
        dataSearchConditionObject.offset = 0;
    }

    let result = await billingCardModel.getDataByWhereCondition(
        dataSearchConditionObject,
        { "id": "DESC" },
        reqData.limit,
        reqData.offset,
        ["id", "company_id", "card_type", "card_holder_name", "card_number", "cvv", "expired_month", "expired_year", "status"]
    );

    for (let index = 0; index < result.length; index++) {
        const element = result[index];

        element.card_holder_name = await dataEncryptionObject.decryptData(element.card_holder_name);
        element.card_number = await dataEncryptionObject.decryptData(element.card_number);
        element.cvv = await dataEncryptionObject.decryptData(element.cvv);

    }

    let totalData = await billingCardModel.getDataByWhereCondition(
        dataSearchConditionObject,
        { "id": "ASC" },
        undefined,
        undefined, [ ]
    );

    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "Billing Card list.",
        "count": result.length,
        "totalCount":  totalData.length,
        "data": result
    });
});

router.put('/update', [verifyToken], async (req, res) => {  // routeAccessChecker("Billing Card listAdd")

    if (req.decoded.userInfo.role_id == 1) {
        return res.status(403).send({
            success: false,
            status: 403,
            message: "Can't access this route.",
        });
    }

    let reqData = {
        "card_number": req.body.card_number,
        "card_holder_name": req.body.card_holder_name,
        "cvv": req.body.cvv,
        "expired_month": req.body.expired_month,
        "expired_year": req.body.expired_year
    }

    reqData.id = req.body.id;

    let updateRequest = false;
    let data = {};
    if (!isEmpty(reqData.id)) {
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

        let existingDataById = await billingCardModel.getDataByWhereCondition(
            { "id": reqData.id, "company_id": req.decoded.profileInfo.company_id, "status": [1, 2] }
        );

        if (isEmpty(existingDataById)) {
            return res.status(404).send({
                "success": false,
                "status": 404,
                "message": "No data found",
            });
        } else {
            updateRequest = true;
        }
    } else {
        let existingDataById = await billingCardModel.getDataByWhereCondition(
            { "company_id": req.decoded.profileInfo.company_id, "status": [1, 2] }
        );

        if (!isEmpty(existingDataById)) {
            return res.status(404).send({
                "success": false,
                "status": 404,
                "message": "You already have a card",
            });
        }
    }


    // cardHolderName validation
    let validateCardHolderName = await commonObject.characterLimitCheck(reqData.card_holder_name, "Name");
    if (validateCardHolderName.success == false) {

        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": validateCardHolderName.message
        });

    } else {
        reqData.card_holder_name = validateCardHolderName.data;
        data.card_holder_name = await dataEncryptionObject.encryptData(reqData.card_holder_name);
    }

    if (!isEmpty(reqData.card_number)) {

        // reqData.card_number = reqData.card_number.split(" ");
        // reqData.card_number = reqData.card_number.join("");

        data.card_number = await dataEncryptionObject.encryptData(reqData.card_number);

    } else {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Please provide card number."
        });
    }

    if (!isEmpty(reqData.cvv)) {
        data.cvv = await dataEncryptionObject.encryptData(reqData.cvv);

    } else {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Please provide cvv."
        });
    }

    // validation expired_month

    if (reqData.expired_month < 1 || reqData.expired_month > 12) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Give valid expired month."
        });
    } else {

        let validateExpiredMonth = await commonObject.checkItsNumber(reqData.expired_month);
        if (validateExpiredMonth.success == false) {
            return res.status(400).send({
                "success": false,
                "status": 400,
                "message": "Expired month should be integer."
            });
        } else {
            data.expired_month = validateExpiredMonth.data;
        }
    }


    // validation expired_year
    let validateExpiredYear = await commonObject.checkItsNumber(reqData.expired_year);
    if (validateExpiredYear.success == false) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Expired year should be integer."
        });
    } else {
        data.expired_year = validateExpiredYear.data;
    }

    if (["1", "2", 1, 2].indexOf(req.body.status) == -1) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Status should be 1 or 2"

        });
    } else {
        data.status = req.body.status;
    }


    let currentTime = await commonObject.getGMT();
    let result;
    if (updateRequest == false) {

        data.created_by = req.decoded.userInfo.id;
        data.updated_by = req.decoded.userInfo.id;
        data.company_id = req.decoded.profileInfo.company_id;
        data.created_at = currentTime;
        data.updated_at = currentTime;

        // add card info
        result = await billingCardModel.addNew(data);
    } else if (updateRequest == true) {

        data.updated_by = req.decoded.userInfo.id;
        data.updated_at = currentTime;

        // update card info
        result = await billingCardModel.updateById(reqData.id, data);

    }

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
        "message": "Card information successfully updated."
    });

});


router.get("/details/:id", [verifyToken], async (req, res) => {  //  routeAccessChecker("Billing Card listDetails")

    let id = req.params.id;
    let validateId = await commonObject.checkItsNumber(id);

    if (validateId.success == false) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Value should be integer."
        });
    }

    id = validateId.data;

    let result = await billingCardModel.getDataByWhereCondition(
        { "id": id, "status": 1, "company_id": req.decoded.profileInfo.company_id },
        { "id": "DESC" },
        undefined, undefined,
        ["id", "company_id", "card_type", "card_holder_name", "card_number", "cvv", "expired_month", "expired_year", "status"]
    );



    if (isEmpty(result)) {
        return res.status(404).send({
            success: false,
            status: 404,
            message: "No data found",
        });
    } else {

        const element = result[0];

        element.card_holder_name = await dataEncryptionObject.decryptData(element.card_holder_name);
        element.card_number = await dataEncryptionObject.decryptData(element.card_number);
        element.cvv = await dataEncryptionObject.decryptData(element.cvv);


    }


    return res.status(200).send({
        success: true,
        status: 200,
        message: "Card Details.",
        data: result[0],
    });
});

router.get("/my-card-details", [verifyToken], async (req, res) => {  //  routeAccessChecker("Billing Card listDetails")


    let result = await billingCardModel.getDataByWhereCondition(
        { "status": 1, "company_id": req.decoded.profileInfo.company_id },
        { "id": "DESC" },
        undefined, undefined,
        ["id", "company_id", "card_type", "card_holder_name", "card_number", "cvv", "expired_month", "expired_year", "status"]
    );

    if (isEmpty(result) || (result.length > 1)) {
        return res.status(404).send({
            success: false,
            status: 404,
            message: "Invalid Data.",
        });
    } else {

        const element = result[0];

        element.card_holder_name = await dataEncryptionObject.decryptData(element.card_holder_name);
        element.card_number = await dataEncryptionObject.decryptData(element.card_number);
        element.cvv = await dataEncryptionObject.decryptData(element.cvv);
    }

    return res.status(200).send({
        success: true,
        status: 200,
        message: "Card Details.",
        data: result[0],
    });
});


router.delete('/delete', [verifyToken], async (req, res) => {  // routeAccessChecker("permissionDelete")

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

    let existingDataById = await billingCardModel.getDataByWhereCondition({ "id": reqData.id, "status": { "not eq": 0 }, "company_id": req.decoded.profileInfo.company_id });
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

    let result = await billingCardModel.updateById(reqData.id, data);


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
        "message": "Card successfully deleted."
    });

});


// router.put('/update', [verifyToken], async (req, res) => {  // routeAccessChecker("Billing Card listUpdate")

//     if (req.decoded.userInfo.role_id == 1) {
//         return res.status(403).send({
//             success: false,
//             status: 403,
//             message: "Can't access this route.",
//         });
//     }

//     let currentTime = await commonObject.getGMT();

//     let reqData = {
//         "id": req.body.id,
//         "card_number": req.body.card_number,
//         "card_holder_name": req.body.card_holder_name,
//         "cvv": req.body.cvv,
//         "expired_month": req.body.expired_month,
//         "expired_year": req.body.expired_year
//     }

//     let validateId = await commonObject.checkItsNumber(reqData.id);
//     if (validateId.success == false) {
//         return res.status(400).send({
//             "success": false,
//             "status": 400,
//             "message": "Value should be integer.",
//             "id": reqData.id
//         });
//     } else {
//         req.body.id = validateId.data;
//         reqData.id = validateId.data;
//     }

//     let existingDataById = await billingCardModel.getDataByWhereCondition(
//         { "id": reqData.id, "company_id": req.decoded.profileInfo.company_id, "status": 1 }
//     );

//     if (isEmpty(existingDataById)) {
//         return res.status(404).send({
//             "success": false,
//             "status": 404,
//             "message": "No data found",
//         });
//     }


//     let updateData = {};

//     updateData.updated_by = req.decoded.userInfo.id;
//     updateData.updated_at = currentTime;

//     // cardHolderName validation
//     let validateCardHolderName = await commonObject.characterLimitCheck(reqData.card_holder_name, "Name");
//     if (validateCardHolderName.success == false) {

//         return res.status(400).send({
//             "success": false,
//             "status": 400,
//             "message": validateCardHolderName.message
//         });

//     } else {
//         reqData.card_holder_name = validateCardHolderName.data;
//         updateData.card_holder_name = await dataEncryptionObject.encryptData(reqData.card_holder_name);
//     }

//     if (!isEmpty(reqData.card_number)) {

//         reqData.card_number = reqData.card_number.split(" ");
//         reqData.card_number = reqData.card_number.join("");

//         updateData.card_number = await dataEncryptionObject.encryptData(reqData.card_number);

//     } else {
//         return res.status(400).send({
//             "success": false,
//             "status": 400,
//             "message": "Please provide card number."
//         });
//     }

//     if (!isEmpty(reqData.cvv)) {
//         updateData.cvv = await dataEncryptionObject.encryptData(reqData.cvv);

//     } else {
//         return res.status(400).send({
//             "success": false,
//             "status": 400,
//             "message": "Please provide cvv."
//         });
//     }

//     // validation expired_month

//     if (reqData.expired_month < 1 || reqData.expired_month > 12) {
//         return res.status(400).send({
//             "success": false,
//             "status": 400,
//             "message": "Give valid expired month."
//         });
//     } else {

//         let validateExpiredMonth = await commonObject.checkItsNumber(reqData.expired_month);
//         if (validateExpiredMonth.success == false) {
//             return res.status(400).send({
//                 "success": false,
//                 "status": 400,
//                 "message": "Expired month should be integer."
//             });
//         } else {
//             reqData.expired_month = validateExpiredMonth.data;
//         }
//     }


//     // validation expired_year
//     let validateExpiredYear = await commonObject.checkItsNumber(reqData.expired_year);
//     if (validateExpiredYear.success == false) {
//         return res.status(400).send({
//             "success": false,
//             "status": 400,
//             "message": "Expired year should be integer."
//         });
//     } else {
//         reqData.expired_year = validateExpiredYear.data;
//     }


//     let result = await billingCardModel.updateById(finalId, reqData);

//     if (result.affectedRows == undefined || result.affectedRows < 1) {
//         return res.status(500).send({
//             "success": true,
//             "status": 500,
//             "message": "Something Wrong in system database."
//         });
//     }


//     return res.status(200).send({
//         "success": true,
//         "status": 200,
//         "message": "Card info successfully updated."
//     });

// });

// router.put('/set-primary', [verifyToken], async (req, res) => {

//     let reqData = {
//         "id": req.body.id
//     }

//     reqData.updated_by = req.decoded.userInfo.id;

//     let validateId = await commonObject.checkItsNumber(reqData.id);

//     if (validateId.success == false) {

//         return res.status(400).send({
//             "success": false,
//             "status": 400,
//             "message": "Value should be integer."

//         });
//     } else {
//         req.body.id = validateId.data;
//         reqData.id = validateId.data;

//     }

//     let existingDataById = await billingCardModel.getDataByWhereCondition(
//         { company_id: req.decoded.profileInfo.company_id, id: reqData.id, status: 1 }
//     );

//     if (isEmpty(existingDataById)) {

//         return res.status(404).send({
//             "success": false,
//             "status": 404,
//             "message": "No data found",

//         });
//     }


//     if (existingDataById[0].is_primary == 1) {
//         return res.status(404).send({
//             "success": false,
//             "status": 404,
//             "message": "This is already set your primary card",

//         });
//     }

//     let data = {
//         is_primary: 1,
//         updated_by: reqData.updated_by,
//         updated_at: await commonObject.getGMT()
//     }

//     let result = await billingCardModel.updateById(reqData.id, data);

//     if (result.affectedRows == undefined || result.affectedRows < 1) {
//         return res.status(500).send({
//             "success": true,
//             "status": 500,
//             "message": "Something Wrong in system database."
//         });
//     }

//     // list of previous set primary data
//     let primaryCardList = await billingCardModel.getDataByWhereCondition({

//         "company_id": req.decoded.profileInfo.company_id,
//         "status": 1,
//         "is_primary": 1,
//     });

//     for (let i = 0; i < primaryCardList.length; i++) {
//         if (primaryCardList[i].id != reqData.id) {
//             let data = {
//                 is_primary: 0,
//                 updated_by: reqData.updated_by,
//                 updated_at: await commonObject.getGMT()
//             }

//             let result = await billingCardModel.updateById(primaryCardList[i].id, data);

//             if (result.affectedRows == undefined || result.affectedRows < 1) {
//                 return res.status(500).send({
//                     "success": true,
//                     "status": 500,
//                     "message": "Something Wrong in system database."
//                 });
//             }
//         }
//     }


//     return res.status(200).send({
//         "success": true,
//         "status": 200,
//         "message": "Primary Card set successfully."
//     });

// });


module.exports = router;