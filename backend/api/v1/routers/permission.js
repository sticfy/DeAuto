const express = require("express");
const isEmpty = require("is-empty");
const router = express.Router();
const commonObject = require('../common/common');
const modulePermissionModel = require('../models/modulePermission');
const moduleModel = require('../models/module');


const permissionModel = require('../models/permission');
const verifyToken = require('../middlewares/jwt_verify/verifyToken');
const { routeAccessChecker } = require('../middlewares/routeAccess');
require('dotenv').config();


router.get('/list', [verifyToken, routeAccessChecker("permissionList")], async (req, res) => {

    let result = await permissionModel.getList();

    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "Permission List.",
        "count": result.length,
        "data": result
    });
});

router.get('/notAssignPermissionList', [verifyToken, routeAccessChecker("permissionNotAssignedList")], async (req, res) => {

    let result = await permissionModel.getNotAssignPermissionList();

    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "Permission List.",
        "count": result.length,
        "data": result
    });
});

router.get('/activeList', [verifyToken, routeAccessChecker("permissionActiveList")], async (req, res) => {

    let result = await permissionModel.getActiveList();


    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "Permission List.",
        "count": result.length,
        "data": result
    });
});

router.post('/list', [verifyToken, routeAccessChecker("permissionListLimit")], async (req, res) => {

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
    let result = await permissionModel.getDataByWhereCondition({ "status": 1 }, { "id": "ASC" },
        reqData.limit,
        reqData.offset
    );


    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "Permission List.",
        "count": result.length,
        "data": result
    });
});

router.post('/add', [verifyToken, routeAccessChecker("permissionAdd")], async (req, res) => {

    let reqData = {
        "title": req.body.title,
        "key_name": req.body.key_name,
        "access_user": req.body.access_user,
        "details": req.body.details,
        "status": 1
    }

    reqData.created_by = req.decoded.userInfo.id;
    reqData.updated_by = req.decoded.userInfo.id;

    reqData.created_at = await commonObject.getGMT();
    reqData.updated_at = await commonObject.getGMT();


    let validatePermissionTitle = await commonObject.characterLimitCheck(reqData.title, "Permission Title");

    if (validatePermissionTitle.success == false) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": validatePermissionTitle.message,

        });
    }


    reqData.title = validatePermissionTitle.data;
    let existingData = await permissionModel.getByTitle(reqData.title);


    if (!isEmpty(existingData)) {
        return res.status(409).send({
            "success": false,
            "status": 409,
            "message": existingData[0].status == "1" ? "Title Already Exists." : "Title Exist but Deactivate, You can activate it."
        });

    }


    let validatePermissionKeyName = await commonObject.characterLimitCheck(reqData.key_name, "Permission Key Name");

    if (validatePermissionKeyName.success == false) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": validatePermissionKeyName.message,
        });
    }

    // reqData.key_name = (validatePermissionKeyName.data).toLowerCase();
    existingData = await permissionModel.getByKeyName(reqData.key_name);


    if (!isEmpty(existingData)) {
        return res.status(409).send({
            "success": false,
            "status": 409,
            "message": existingData[0].status == 1 ? "Key Already Exists." : "Key exist but deactivate, You can activate it."
        });
    }

    if ([1, 2, 3, "1", "2", "3"].indexOf(reqData.access_user) == -1) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Please give access user type."
        });

        // reqData.access_user = 3
    }


    reqData.access_user = reqData.access_user;

    let result = await permissionModel.addNew(reqData);

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
        "message": "Permission Added Successfully."
    });

});



router.put('/update', [verifyToken, routeAccessChecker("permissionUpdate")], async (req, res) => {

    let reqData = {
        "id": req.body.id,
        "title": req.body.title,
        "key_name": req.body.key_name,
        "access_user": req.body.access_user,
        "details": req.body.details
    }

    reqData.updated_by = req.decoded.userInfo.id;

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

    let existingDataById = await permissionModel.getById(reqData.id);
    if (isEmpty(existingDataById)) {

        return res.status(404).send({
            "success": false,
            "status": 404,
            "message": "No data found",

        });
    }

    let updateData = {};

    let errorMessage = "";
    let isError = 0; // 1 = yes, 0 = no
    let willWeUpdate = 0; // 1 = yes , 0 = no;

    // title
    if (existingDataById[0].title !== reqData.title) {

        let validatePermissionTitle = await commonObject.characterLimitCheck(reqData.title, "Permission Title");

        if (validatePermissionTitle.success == false) {
            isError = 1;
            errorMessage += validatePermissionTitle.message;
        } else {

            let existingDataByTitle = await permissionModel.getByTitle(reqData.title);

            if (!isEmpty(existingDataByTitle) && existingDataByTitle[0].id != reqData.id) {

                isError = 1;
                errorMessage += existingDataByTitle[0].status == "1" ? "This Permission Already Exist." : "This Permission Exist but Deactivate, You can activate it."
            }

            reqData.title = validatePermissionTitle.data;
            willWeUpdate = 1;
            updateData.title = reqData.title;

        }

    }

    //key name 
    if (existingDataById[0].key_name !== reqData.key_name) {

        // key name check
        let validateAddress = await commonObject.characterLimitCheck(reqData.key_name, "Permission Key Name");

        if (validateAddress.success == false) {
            isError = 1;
            errorMessage += validateAddress.message;
        } else {

            let existingDataByKeyName = await permissionModel.getByKeyName(reqData.key_name);

            if (!isEmpty(existingDataByKeyName) && existingDataByKeyName[0].id != reqData.id) {

                isError = 1;
                errorMessage += existingDataByKeyName[0].status == 1 ? "This Permission Key Name Already Exist." : "This Permission Key name Exist but Deactivate, You can activate it."
            }

            reqData.key_name = validateAddress.data;
            willWeUpdate = 1;
            updateData.key_name = reqData.key_name;

        }

    }

    //details 
    if (existingDataById[0].details !== reqData.details) {

        // details check
        willWeUpdate = 1;
        updateData.details = reqData.details;

    }

    if (isError == 1) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": errorMessage
        });
    }

    if ([1, 2, 3, "1", "2", "3"].indexOf(reqData.access_user) == -1) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Please give access user type."
        });
    }

    if (existingDataById[0].access_user != reqData.access_user) {
        reqData.access_user = reqData.access_user;
        willWeUpdate = 1;
    }

    if (willWeUpdate == 1) {

        updateData.updated_by = req.decoded.userInfo.id;
        updateData.updated_at = await commonObject.getGMT();

        let result = await permissionModel.updateById(reqData.id, updateData);

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
            "message": "Permission successfully updated."
        });

    } else {
        return res.status(200).send({
            "success": true,
            "status": 200,
            "message": "Nothing to update."
        });
    }

});


router.delete('/delete', [verifyToken, routeAccessChecker("permissionDelete")], async (req, res) => {

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

    let existingDataById = await permissionModel.getById(reqData.id);
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

    let result = await permissionModel.updateById(reqData.id, data);


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
        "message": "Permission successfully deleted."
    });

});

router.put('/changeStatus', [verifyToken, routeAccessChecker("permissionStatus")], async (req, res) => {

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

    let existingDataById = await permissionModel.getById(reqData.id);
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

    let result = await permissionModel.updateById(reqData.id, data);


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
        "message": "Permission status has successfully changed."
    });

});

router.get("/details/:id", [verifyToken, routeAccessChecker("permissionDetails")], async (req, res) => {


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

    let result = await permissionModel.getById(id);

    if (isEmpty(result)) {

        return res.status(404).send({
            success: false,
            status: 404,
            message: "No permission data found",
        });

    } else {

        // let assignModule = "Not Assign yet";
        // let assignModuleList = await modulePermissionModel.getDataByWhereCondition({
        //     "permission_id": result[0].id,
        //     "status": 1,
        // });

        // if (!isEmpty(assignModuleList)) {
        //     let moduleInfo = await moduleModel.getDataByWhereCondition({
        //         id: assignModuleList[0].module_id,
        //         status: 1
        //     })

        //     if (!isEmpty(moduleInfo)) {
        //         assignModule = moduleInfo[0].title;
        //     }
        // }

        // result[0].module_name = assignModule;

        return res.status(200).send({
            success: true,
            status: 200,
            message: "Permission Details.",
            data: result[0],
        });
    }

}
);


module.exports = router;