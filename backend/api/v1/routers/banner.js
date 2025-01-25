const express = require("express");
const isEmpty = require("is-empty");
const router = express.Router();
const commonObject = require('../common/common');
const bannerModel = require('../models/banner');
const verifyToken = require('../middlewares/jwt_verify/verifyToken');
const { routeAccessChecker } = require('../middlewares/routeAccess');
const fileUploaderCommonObject = require("../common/fileUploader");
require('dotenv').config();
let moment = require('moment');

// verifyToken, routeAccessChecker("bannerActiveList")
// verifyToken, routeAccessChecker("bannerFrontend")
// verifyToken,routeAccessChecker("bannerDetails")


router.get('/list', [verifyToken], async (req, res) => {

    let imageFolderPath = `${process.env.backend_url}${process.env.banner_image_path_name}`;
    let result = await bannerModel.getList();

    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "Banner List.",
        "imageFolderPath": imageFolderPath,
        "count": result.length,
        "data": result
    });
});

router.get('/activeList', [], async (req, res) => {

    let imageFolderPath = `${process.env.backend_url}${process.env.banner_image_path_name}`;
    let result = await bannerModel.getActiveList();

    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "Banner List.",
        "imageFolderPath": imageFolderPath,
        "count": result.length,
        "data": result
    });
});


router.post('/list', [], async (req, res) => {

    let imageFolderPath = `${process.env.backend_url}${process.env.banner_image_path_name}`;
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
    let result = await bannerModel.getDataByWhereCondition(
        { "status": 1 },
        { "id": "DESC" },
        reqData.limit,
        reqData.offset
    );

    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "Banner List.",
        "count": result.length,
        "imageFolderPath": imageFolderPath,
        "data": result
    });
});


router.post('/add', [verifyToken], async (req, res) => {

    let reqData = {
        "banner_type": 3, // middle
        // "from_date": req.body.from_date,
        // "to_date": req.body.to_date,
        // "details": req.body.details
    }


    reqData.created_by = req.decoded.userInfo.id;
    reqData.updated_by = req.decoded.userInfo.id;

    let errorMessage = "";
    let isError = 0; // 1 = yes, 0 = no


    // let validateBannerType = await commonObject.checkItsNumber(reqData.banner_type);
    // if (validateBannerType.success == false) {

    //     return res.status(400).send({
    //         "success": false,
    //         "status": 400,
    //         "message": "Banner Type Value should be integer."

    //     });
    // } else {
    //     req.body.banner_type = validateBannerType.data;
    //     reqData.banner_type = validateBannerType.data;

    // }

    // if ([2, 3, 4].indexOf(reqData.banner_type) == -1) {
    //     isError = 1;
    //     errorMessage += "Banner type should be  between 2 to 4";
    // }

    // date validation

    let today = new Date();

    // if (isEmpty(reqData.from_date)) {
    //     isError = 1;
    //     errorMessage += "Please fill up  Starting date. ";
    // } else {

    //     let date = moment(reqData.from_date)

    //     if (date.isValid() == false) {
    //         isError = 1;
    //         errorMessage += "Invalid Start Date. ";
    //     }
    // }

    // if (isEmpty(reqData.to_date)) {
    //     isError = 1;
    //     errorMessage += "Please fill up  End date. ";
    // } else {
    //     let date = moment(reqData.to_date);


    //     if (date.isValid() == false) {
    //         isError = 1;
    //         errorMessage += "Invalid End Date. ";
    //     }

    // }

    // if (reqData.from_date > reqData.to_date) {
    //     isError = 1;
    //     errorMessage += "Please give valid  start  date and end date. ";
    // }

    if (isError == 1) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": errorMessage
        });
    }

    //  file codes
    if (req.files && Object.keys(req.files).length > 0) {

        let imageUploadCode = {};

        //image code
        if (req.files.image) {

            imageUploadCode = await fileUploaderCommonObject.uploadFile(
                req,
                "bannerImage",
                "image"
            );

            if (imageUploadCode.success == false) {
                return res.status(400).send({
                    success: false,
                    status: 400,
                    message: imageUploadCode.message,
                });
            }


            reqData.image = imageUploadCode.fileName;
        }
    } else {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Please Upload an Image",

        });
    }

    let result = await bannerModel.addNew(reqData);

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
        "message": "Banner Added Successfully."
    });

});



router.put('/update', [verifyToken], async (req, res) => {

    let reqData = {
        "id": req.body.id,
        // "banner_type": req.body.banner_type,
        // "from_date": req.body.from_date,
        // "to_date": req.body.to_date,
        // "details": req.body.details
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

    let existingDataById = await bannerModel.getById(reqData.id);
    if (isEmpty(existingDataById)) {

        return res.status(404).send({
            "success": false,
            "status": 404,
            "message": "No data found",

        });
    }

    let previousFile = existingDataById[0].image;

    let updateData = {};

    let errorMessage = "";
    let isError = 0; // 1 = yes, 0 = no
    let willWeUpdate = 0; // 1 = yes , 0 = no;

    

    // date validation
    let today = new Date();

    // // start date
    // if (!isEmpty(reqData.from_date)) {

    //     let date = moment(reqData.from_date)

    //     if (date.isValid() == false) {
    //         isError = 1;
    //         errorMessage += "Invalid Start Date. ";
    //     } else {
    //         willWeUpdate = 1;
    //         updateData.from_date = reqData.from_date;

    //     }
    // } else {

    //     willWeUpdate = 1;
    //     if (existingDataById[0].from_date != null) {
    //         updateData.from_date = new Date(existingDataById[0].from_date).toISOString().split('T')[0];
    //     }
    // }


    // // end date
    // if (!isEmpty(reqData.to_date)) {

    //     let date = moment(reqData.to_date)

    //     if (date.isValid() == false) {
    //         isError = 1;
    //         errorMessage += "Invalid End Date. ";
    //     } else {
    //         willWeUpdate = 1;
    //         updateData.to_date = reqData.to_date;

    //     }
    // } else {
    //     willWeUpdate = 1;
    //     if (existingDataById[0].to_date != null) {
    //         updateData.to_date = new Date(existingDataById[0].to_date).toISOString().split('T')[0];
    //     }

    // }


    // if (updateData.from_date > updateData.to_date) {

    //     isError = 1;
    //     errorMessage += "Please give valid  start  date and end date. ";
    // }

    // if (isError == 1) {
    //     return res.status(400).send({
    //         "success": false,
    //         "status": 400,
    //         "message": errorMessage
    //     });
    // }


    //  file codes
    if (req.files && Object.keys(req.files).length > 0) {

        let imageUploadCode = {};

        //image code
        if (req.files.image) {

            imageUploadCode = await fileUploaderCommonObject.uploadFile(
                req,
                "bannerImage",
                "image"
            );

            if (imageUploadCode.success == false) {
                return res.status(200).send({
                    success: false,
                    status: 400,
                    message: imageUploadCode.message,
                });
            }

            willWeUpdate = 1;
            updateData.image = imageUploadCode.fileName;
        }
    }


    if (isError == 1) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": errorMessage
        });
    }



    if (willWeUpdate == 1) {

        updateData.updated_by = req.decoded.userInfo.id;


        let result = await bannerModel.updateById(reqData.id, updateData);

        // existing file delete
        if (req.files && Object.keys(req.files).length > 0) {

            // image delete
            if (req.files.image) {
                if (previousFile != updateData.image) {
                    if (previousFile != "default_image.png") {
                        let fileDelete = {};

                        fileDelete = await fileUploaderCommonObject.fileRemove(
                            previousFile,
                            "bannerImage"
                        );
                    }
                }
            }

        }

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
            "message": "Banner successfully updated."
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

    let existingDataById = await bannerModel.getById(reqData.id);
    if (isEmpty(existingDataById)) {

        return res.status(404).send({
            "success": false,
            "status": 404,
            "message": "No data found",

        });
    }

    let previousFile = existingDataById[0].image;

    let data = {
        status: 0,
        updated_by: reqData.updated_by
    }

    let result = await bannerModel.updateById(reqData.id, data);

    // existing file delete
    if (previousFile != null) {
        if (previousFile != "default_image.png") {
            let fileDelete = {};

            fileDelete = await fileUploaderCommonObject.fileRemove(
                previousFile,
                "bannerImage"
            );
        }
    }


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
        "message": "Banner successfully deleted."
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

    let existingDataById = await bannerModel.getById(reqData.id);
    if (isEmpty(existingDataById)) {

        return res.status(404).send({
            "success": false,
            "status": 404,
            "message": "No data found",

        });
    }

    let data = {
        status: existingDataById[0].status == 1 ? 2 : 1,
        updated_by: reqData.updated_by
    }

    let result = await bannerModel.updateById(reqData.id, data);


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
        "message": "Banner status has successfully changed."
    });

});

router.get("/details/:id", [], async (req, res) => {

    let imageFolderPath = `${process.env.backend_url}${process.env.banner_image_path_name}`;
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

    let result = await bannerModel.getById(id);

    if (isEmpty(result)) {

        return res.status(404).send({
            success: false,
            status: 404,
            message: "No data found",
        });

    } else {

        return res.status(200).send({
            success: true,
            status: 200,
            message: "Banner Details.",
            imageFolderPath: imageFolderPath,
            data: result[0],
        });

    }

}
);







module.exports = router;