const express = require("express");
const isEmpty = require("is-empty");
const router = express.Router();
const commonObject = require('../common/common');
const moduleModel = require('../models/module');
const modulePermissionModel = require('../models/modulePermission');
const permissionModel = require('../models/permission');
const verifyToken = require('../middlewares/jwt_verify/verifyToken');
const { routeAccessChecker } = require('../middlewares/routeAccess');
require('dotenv').config();


router.get('/list', [verifyToken, routeAccessChecker("moduleList")], async (req, res) => {

    let result = await moduleModel.getList();
    

    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "Module List.",
        "count": result.length,
        "data": result
    });
});

router.get(['/activeList', '/moduleWisePermissionListForAssignToUser'], [verifyToken, routeAccessChecker("moduleActiveList")], async (req, res) => {

    let result = await moduleModel.getList();

    // for (let index = 0; index < result.length; index++) {
    //     let modulePermissionDetails = await modulePermissionModel.getModulePermissionDetailsByModuleId(result[index].id);
    //     result[index].modulePermissionList = modulePermissionDetails;
    // }

    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "Module List.",
        "count": result.length,
        "data": result
    });

});

router.post('/list', [verifyToken, routeAccessChecker("moduleListLimit")], async (req, res) => {

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
    let result = await moduleModel.getDataByWhereCondition({ "status": 1 }, { "id": "ASC" },
        reqData.limit,
        reqData.offset
    );


    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "Module List.",
        "count": result.length,
        "data": result
    });
});

router.post('/add', [verifyToken, routeAccessChecker("moduleAdd")], async (req, res) => {

    let reqData = {
        "title": req.body.title,
        "permissionIds": req.body.permission_id
    }

    let errorMessage = "";
    let isError = 0;

    let validateModuleTitle = await commonObject.characterLimitCheck(reqData.title, "Module Title");

    if (validateModuleTitle.success == false) {
        isError = 1;
        errorMessage += validateModuleTitle.message;
    }

    reqData.title = validateModuleTitle.data;

    let existingData = await moduleModel.getByTitle(reqData.title);

    if (!isEmpty(existingData)) {
        isError = 1;
        errorMessage += existingData[0].status == "1" ? "Already Exists." : "Exist but Deactivate, You can activate it."

    }

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
            success: false,
            status: 400,
            message: errorMessage,
        });
    }

    let moduleData = {
        "title": reqData.title,
        "created_by": req.decoded.userInfo.id,
        "updated_by": req.decoded.userInfo.id,
        "created_at": await commonObject.getGMT(),
        "updated_at": await commonObject.getGMT(),
    }

    let result = await moduleModel.addNew(moduleData, permissionIds);

    if (result.affectedRows == undefined || result.affectedRows < 1) {
        return res.status(500).send({
            "success": false,
            "status": 500,
            "message": "Something Wrong in system database.",
            result
        });
    }

    return res.status(201).send({
        "success": true,
        "status": 201,
        "message": "Module Added Successfully."
    });

});

router.put('/update', [verifyToken, routeAccessChecker("moduleUpdate")], async (req, res) => {

    let reqData = {
        "id": req.body.id,
        "title": req.body.title,
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

    let existingDataById = await moduleModel.getById(reqData.id);
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

        let validateModuleTitle = await commonObject.characterLimitCheck(reqData.title, "Module Title");

        if (validateModuleTitle.success == false) {
            isError = 1;
            errorMessage += validateModuleTitle.message;
        } else {

            let existingDataByTitle = await moduleModel.getByTitle(reqData.title);

            if (!isEmpty(existingDataByTitle) && existingDataByTitle[0].id != reqData.id) {

                isError = 1;
                errorMessage += existingDataByTitle[0].status == "1" ? "This Module Already Exist." : "This Module Exist but Deactivate, You can activate it."
            }

            reqData.title = validateModuleTitle.data;
            willWeUpdate = 1;
            updateData.title = reqData.title;

        }

    }

    // existing permissions
    let existingPermissions = await modulePermissionModel.getModulePermissionDetailsByModuleId(reqData.id);

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


    //if (willWeUpdate == 1) {

    updateData.updated_by = req.decoded.userInfo.id;
    updateData.created_by = req.decoded.userInfo.id;
    updateData.updated_at = await commonObject.getGMT();
    updateData.created_at = await commonObject.getGMT();


    let result = await moduleModel.updateById(reqData.id, updateData, permissionIds, existingPermissions);


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
        "message": "Module successfully updated."
    });


    //} 


});

router.put('/changeStatus', [verifyToken, routeAccessChecker("moduleStatus")], async (req, res) => {

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

    let existingDataById = await moduleModel.getById(reqData.id);
    if (isEmpty(existingDataById)) {

        return res.status(404).send({
            "success": false,
            "status": 404,
            "message": "No data found",

        });
    }

    // module permission details
    let modulePermissionDetails = await modulePermissionModel.getModulePermissionDetailsByModuleId(existingDataById[0].id);

    existingDataById[0].modulePermissionDetails = modulePermissionDetails;


    let data = {
        status: existingDataById[0].status == 1 ? 2 : 1,
        updated_by: reqData.updated_by,
        updated_at: await commonObject.getGMT()
    }

    let result = await moduleModel.changeStatusById(reqData.id, data, modulePermissionDetails);


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
        "message": "Module status has successfully changed."
    });

});

router.get("/details/:id", [verifyToken, routeAccessChecker("moduleDetails")], async (req, res) => {


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

    let result = await moduleModel.getById(id);

    if (isEmpty(result)) {

        return res.status(404).send({
            success: false,
            status: 404,
            message: "No  data found",
        });

    }

    // module permission details
    let modulePermissionDetails = await modulePermissionModel.getModulePermissionDetailsByModuleId(result[0].id)

    result[0].modulePermissionDetails = modulePermissionDetails;


    return res.status(200).send({
        success: true,
        status: 200,
        message: "Module Details.",
        data: result[0],
    });

}
);


// router.delete('/delete', [verifyToken, routeAccessChecker("employeeTypeDelete")], async (req, res) => {

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

//     let existingDataById = await moduleModel.getEmployeeTypeById(reqData.id);
//     if (isEmpty(existingDataById)) {

//         return res.status(404).send({
//             "success": false,
//             "status": 404,
//             "message": "No data found",

//         });
//     }

//      let data = {
//       status : 0,
//       updated_by : reqData.updated_by,
//       updated_at :await commonObject.getGMT()
//      }

//      let result = await moduleModel.updateEmployeeTypeById(reqData.id,data);


//      if (result.affectedRows == undefined || result.affectedRows < 1) {
//          return res.status(500).send({
//              "success": true,
//              "status": 500,
//              "message": "Something Wrong in system database."
//          });
//      }


//      return res.status(200).send({
//          "success": true,
//          "status": 200,
//          "message": "Employee Type successfully deleted."
//      });

// });


module.exports = router;