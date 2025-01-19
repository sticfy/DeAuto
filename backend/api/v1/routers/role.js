const express = require("express");
const isEmpty = require("is-empty");
const router = express.Router();
const commonObject = require('../common/common');
const roleModel = require('../models/role');
const permissionModel = require('../models/permission');
const rolePermissionModel = require('../models/rolePermission');

const verifyToken = require('../middlewares/jwt_verify/verifyToken');
require('dotenv').config();
const { routeAccessChecker } = require('../middlewares/routeAccess');

router.get('/list', [], async (req, res) => {

    let result = await roleModel.getList();

    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "Role List.",
        "count": result.length,
        "data": result
    });
});

router.post('/add', [verifyToken, routeAccessChecker("roleAdd")], async (req, res) => {

    let reqData = {
        "title": req.body.title
    }

    reqData.created_by = req.decoded.userInfo.id;
    reqData.updated_by = req.decoded.userInfo.id;

    reqData.created_at = await commonObject.getGMT();
    reqData.updated_at = await commonObject.getGMT();


    let validateTitle = await commonObject.characterLimitCheck(reqData.title, "Role");

    if (validateTitle.success == false)
        return res.status(400).send({ "success": false, "status": 400, "message": validateTitle.message });

    reqData.title = validateTitle.data;
    let existingData = await roleModel.getDataByWhereCondition(
        { "title": reqData.title, "status": [1, 2] }
    );


    if (!isEmpty(existingData))
        return res.status(409).send({
            "success": false, "status": 409,
            "message": existingData[0].status == "1" ? "This Role Already Exists." : "This Role Already Exists but Deactivate, You can activate it."
        });

    let result = await roleModel.addNew(reqData);

    if (result.affectedRows == undefined || result.affectedRows < 1)
        return res.status(500).send({ "success": false, "status": 500, "message": "Something Wrong in system database." });

    return res.status(201).send({ "success": true, "status": 201, "message": "Role Added Successfully." });

});

router.put('/update', [verifyToken, routeAccessChecker("roleUpdate")], async (req, res) => {

    let reqData = {
        "id": req.body.id,
        "title": req.body.title
    }

    reqData.updated_by = req.decoded.userInfo.id;
    let validateId = await commonObject.checkItsNumber(reqData.id);

    if (validateId.success == false)
        return res.status(400).send({ "success": false, "status": 400, "message": "Value should be integer.", "id": reqData.id });

    else {
        req.body.id = validateId.data;
        reqData.id = validateId.data;
    }

    let existingDataById = await roleModel.getDataByWhereCondition(
        { "id": reqData.id, "status": [1, 2] }
    );

    if (isEmpty(existingDataById))
        return res.status(404).send({ "success": false, "status": 404, "message": "No data found" });


    let updateData = {};

    let errorMessage = "";
    let isError = 0; // 1 = yes, 0 = no
    let willWeUpdate = 0; // 1 = yes , 0 = no;

    // title
    if (existingDataById[0].title !== reqData.title) {

        let validateTitle = await commonObject.characterLimitCheck(reqData.title, "Role");

        if (validateTitle.success == false) {
            isError = 1;
            errorMessage += validateTitle.message;
        } else {

            // let existingDataByTitle = await roleModel.getByTitle(validateTitle.data);

            let existingDataByTitle = await roleModel.getDataByWhereCondition(
                { "title": validateTitle.title, "status": [1, 2] }
            );

            if (!isEmpty(existingDataByTitle) && existingDataByTitle[0].id != reqData.id) {
                isError = 1;
                errorMessage += existingDataByTitle[0].status == "1" ? "This Role Already Exist." : "This Role Already Exist but Deactivate, You can activate it."
            }

            reqData.title = validateTitle.data;
            willWeUpdate = 1;
            updateData.title = reqData.title;
        }
    }


    if (isError == 1)
        return res.status(400).send({ "success": false, "status": 400, "message": errorMessage });


    if (willWeUpdate == 1) {

        updateData.updated_by = req.decoded.userInfo.id;
        updateData.updated_at = await commonObject.getGMT();

        let result = await roleModel.updateById(reqData.id, updateData);
        if (result.affectedRows == undefined || result.affectedRows < 1) {
            return res.status(500).send({ "success": true, "status": 500, "message": "Something Wrong in system database." });
        }

        return res.status(200).send({ "success": true, "status": 200, "message": "Role successfully updated." });
    }


    return res.status(200).send({ "success": true, "status": 200, "message": "Nothing to update." });


});

router.delete('/delete', [verifyToken, routeAccessChecker("roleDelete")], async (req, res) => {

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

    let existingDataById = await roleModel.getDataByWhereCondition(
        { "id": reqData.id, "status": [1, 2] }
    );

    if (isEmpty(existingDataById))
        return res.status(404).send({ "success": false, "status": 404, "message": "No data found" });


    let data = {
        status: 0,
        updated_by: reqData.updated_by,
        updated_at: await commonObject.getGMT()
    }


    let result = await roleModel.updateById(reqData.id, data);

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
        "message": "Role successfully deleted."
    });

});

router.put('/changeStatus', [verifyToken, routeAccessChecker("roleStatus")], async (req, res) => {

    let reqData = { "id": req.body.id }

    reqData.updated_by = req.decoded.userInfo.id;
    let validateId = await commonObject.checkItsNumber(reqData.id);

    if (validateId.success == false)
        return res.status(400).send({ "success": false, "status": 400, "message": "Value should be integer." });
    else {
        req.body.id = validateId.data;
        reqData.id = validateId.data;
    }


    let existingDataById = await roleModel.getDataByWhereCondition(
        { "id": reqData.id, "status": [1, 2] }
    );

    if (isEmpty(existingDataById))
        return res.status(404).send({ "success": false, "status": 404, "message": "No data found" });


    let data = {
        status: existingDataById[0].status == 1 ? 2 : 1,
        updated_by: reqData.updated_by,
        updated_at: await commonObject.getGMT()
    }

    let result = await roleModel.updateById(reqData.id, data);
    if (result.affectedRows == undefined || result.affectedRows < 1)
        return res.status(500).send({ "success": true, "status": 500, "message": "Something Wrong in system database." });


    return res.status(200).send({ "success": true, "status": 200, "message": "Role status has successfully changed." });

});

router.post('/update-role-permission', [verifyToken, routeAccessChecker("rolePermissionUpdate")], async (req, res) => {

    let reqData = {
        "id": req.body.id,
        "permissionIds": req.body.permission_id
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

    let existingDataById = await roleModel.getById(reqData.id);
    if (isEmpty(existingDataById)) {

        return res.status(404).send({
            "success": false,
            "status": 404,
            "message": "No data found",

        });
    }


    let errorMessage = "";
    let isError = 0; // 1 = yes, 0 = no



    // existing permissions
    let existingPermissions = await rolePermissionModel.getRolePermissionDetailsByRoleId(reqData.id);

    // permission id check
    let permissionIds;

    if (reqData.permissionIds != undefined || !(isEmpty(reqData.permissionIds))) {

        if (Array.isArray(reqData.permissionIds) && reqData.permissionIds.length > 0) {

            let duplicateCheckInArrayResult = await commonObject.duplicateCheckInArray(reqData.permissionIds);

            if (duplicateCheckInArrayResult.result) {
                isError = 1;
                errorMessage += "Permission Ids contains duplicate value.";
            }


            //check permission ids from database 

            for (let i = 0; i < reqData.permissionIds.length; i++) {

                let validatePermissionId = await commonObject.checkItsNumber(
                    reqData.permissionIds[i]
                );


                if (validatePermissionId.success == false) {
                    isError = 1;
                    errorMessage += `Permission Id ${reqData.permissionIds[i]} value should be integer.`;

                    return res.status(400).send({
                        success: false,
                        status: 400,
                        message: errorMessage,
                    });

                }

                reqData.permissionIds[i] = validatePermissionId.data;

                let permissionData = await permissionModel.getPermissionDetailsById(reqData.permissionIds[i]);

                if (isEmpty(permissionData)) {
                    isError = 1;
                    errorMessage += `${reqData.permissionIds[i]} Permission not exist. `;
                }
            }
        }

        permissionIds = reqData.permissionIds;
    } else {
        permissionIds = [];
    }



    if (isError == 1) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": errorMessage
        });
    }


    let data = {
        updated_by: req.decoded.userInfo.id,
        created_by: req.decoded.userInfo.id,
        updated_at: await commonObject.getGMT(),
        created_at: await commonObject.getGMT()
    }


    let result = await rolePermissionModel.updatePermissionById(reqData.id, data, permissionIds, existingPermissions);


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
        "message": "Role permission successfully updated."
    });


    //} 


});


router.get("/details/:id", [verifyToken], async (req, res) => {


    let id = req.params.id;
    let validateId = await commonObject.checkItsNumber(id);


    if (validateId.success == false)
        return res.status(400).send({ "success": false, "status": 400, "message": "Value should be integer." });

    id = validateId.data;
    let result = await roleModel.getDataByWhereCondition(
        { "id": id, "status": [1, 2] }
    );

    if (isEmpty(result)) {
        return res.status(404).send({
            success: false,
            status: 404,
            message: "No data found",
        });
    }

    // module permission details
    let rolePermissionList = await rolePermissionModel.getRolePermissionDetailsByRoleId(result[0].id)
    result[0].permissions = rolePermissionList;


    return res.status(200).send({
        success: true,
        status: 200,
        message: "Role details.",
        data: result[0],
    });

}
);

module.exports = router;