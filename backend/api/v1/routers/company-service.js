const express = require("express");
const isEmpty = require("is-empty");
const router = express.Router();
const commonObject = require('../common/common');
const companyModel = require('../models/company');
const companyServiceModel = require('../models/company-service');
const serviceModel = require('../models/service');
const categoryModel = require('../models/category');
const companySubscribedPackageModel = require('../models/company-subscribed-package');
const verifyToken = require('../middlewares/jwt_verify/verifyToken');

const companyServiceValidation = require('../middlewares/requestData/company-service-data');
const companyServiceUpdateValidation = require('../middlewares/requestData/company-service-update');
const emailCommonObject = require("../common/email");


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

        dataSearchConditionObject.service_id = { "GT": 0 };
    } else if (req.decoded.userInfo.role_id == 2) {
        dataSearchConditionObject.company_id = req.decoded.profileInfo.company_id;
    }

    // app user
    if (req.decoded.userInfo.role_id == 3) {

        if (req.body.company_id != undefined) {
            dataSearchConditionObject.company_id = req.body.company_id;
        } else {
            return res.status(400).send({
                "success": false,
                "status": 400,
                "message": "Please provide company id."

            });
        }

        dataSearchConditionObject.service_id = { "GT": 0 };

        // find with service start date and end date
        let dateTimeToday = await commonObject.getGMT();
        let dateToday = await commonObject.getCustomDate(dateTimeToday, 0, 0, 0);
        dataSearchConditionObject["date(service_end_date)"] = { "GTE": dateToday }
    }


    let result = await companyServiceModel.getDataByWhereCondition(dataSearchConditionObject, { "id": "ASC" },
        reqData.limit,
        reqData.offset
    );

    for (let index = 0; index < result.length; index++) {
        const element = result[index];

        let companyServiceDataObject = element.service_name;

        if (!isEmpty(language)) {
            element.service_name = companyServiceDataObject[language];
            element.details = element.details[language];

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

                let serviceTitleDataObject = serviceDetails[0].title;

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
            let titleDataObject = categoryDetails[0].title;

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
        undefined, []
    );

    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "Company Service List",
        "totalCount": totalData.length,
        "count": result.length,
        "data": result
    });
});


router.post('/pending-list', [verifyToken], async (req, res) => {

    let language = req.headers['language'];

    if (req.decoded.userInfo.role_id != 1) {
        return res.status(403).send({
            success: false,
            status: 403,
            message: "Can't access this route.",
        });
    }

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

    dataSearchConditionObject.status = 3;


    let result = await companyServiceModel.getDataByWhereCondition(dataSearchConditionObject, { "id": "DESC" },
        reqData.limit,
        reqData.offset
    );

    for (let index = 0; index < result.length; index++) {
        const element = result[index];

        let companyServiceDataObject = element.service_name;


        element.service_name = companyServiceDataObject;

        // category Details
        let categoryDetails = await categoryModel.getDataByWhereCondition({ "status": [1, 2], "id": element.category_id }, { "id": "DESC" }, undefined, undefined,
            ["id", "title", "status"]);

        if (isEmpty(categoryDetails)) {
            element.categoryDetails = {};
        } else {
            let titleDataObject = categoryDetails[0].title;

            if (!isEmpty(language)) {
                categoryDetails[0].title = titleDataObject[language];
            } else {
                categoryDetails[0].title = titleDataObject;
            }

            element.categoryDetails = categoryDetails[0];
        }

        // company name
        let companyDetails = await companyModel.getDataByWhereCondition({ "status": [1, 2], "id": element.company_id }, { "id": "DESC" }, undefined, undefined,
            ["id", "company_name", "status"]);

        if (isEmpty(companyDetails)) {
            element.companyDetails = {};
        } else {
            element.companyDetails = companyDetails[0];
        }
    }


    let totalData = await companyServiceModel.getDataByWhereCondition(
        dataSearchConditionObject,
        { "id": "ASC" },
        undefined,
        undefined, []
    );

    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "Company Service Pending List",
        "totalCount": totalData.length,
        "count": result.length,
        "data": result
    });
});

router.post('/add', [verifyToken, companyServiceValidation], async (req, res) => {

    let requestData = req.requestData;
    let packageData = req.packageData;

    let companyServiceObject = {};

    companyServiceObject = { ...requestData };

    companyServiceObject.created_by = req.decoded.userInfo.id;
    companyServiceObject.updated_by = req.decoded.userInfo.id;
    companyServiceObject.created_at = await commonObject.getGMT();
    companyServiceObject.updated_at = await commonObject.getGMT();


    let message = "";
    let result;
    if (companyServiceObject.status == 3) {
        message = "Company Service Added Successfully but waiting for admin approval.";
        result = await companyServiceModel.addNew(companyServiceObject);

    } else {
        message = "Company Service Added Successfully."
        result = await companyServiceModel.addWithMultipleInfo(companyServiceObject, packageData);

    }

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
        "message": message
    });

});

router.put('/update', [verifyToken, companyServiceUpdateValidation], async (req, res) => {

    let reqData = req.requestData;

    let companyServiceUpdateObject = {};

    companyServiceUpdateObject = { ...reqData };

    delete companyServiceUpdateObject.id;

    companyServiceUpdateObject.updated_by = req.decoded.userInfo.id;
    companyServiceUpdateObject.updated_at = await commonObject.getGMT();


    let result = await companyServiceModel.updateById(reqData.id, companyServiceUpdateObject);

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

    // check this company has the limit of adding service or not
    let currentSubscribedPackage = await companySubscribedPackageModel.getDataByWhereCondition(
        { company_id: company_id, status: 1 }
    );


    if (isEmpty(currentSubscribedPackage)) {
        return res.status(400).send({
            success: false,
            status: 400,
            message: "You are not associated with any subscription package."
        });
    } else {
        if (currentSubscribedPackage[0].total_available_services <= 0) {
            return res.status(400).send({
                success: false,
                status: 400,
                message: "Adding Service limit has been crossed."
            });
        }
    }

    let updatePackageData = {};
    updatePackageData.total_available_services = currentSubscribedPackage[0].total_available_services + 1;
    updatePackageData.updated_by = reqData.updated_by;
    updatePackageData.updated_at = await commonObject.getGMT();

    let result;
    if (existingDataById[0].status == 3) {
        result = await companyServiceModel.updateById(reqData.id, data);
    } else {
        result = await companyServiceModel.deleteWithMultipleInfo(reqData.id, data, currentSubscribedPackage[0].id, updatePackageData);
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

    let language = req.headers['language'];

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

        if ((req.decoded.userInfo.role_id == 2) && (req.decoded.profileInfo.company_id != element.company_id)) {
            return res.status(404).send({
                success: false,
                status: 404,
                message: "This is not your company data.",
            });
        }

        let companyServiceDataObject = element.service_name;
        let companyServiceDetailsObject = element.details;

        if (!isEmpty(language)) {
            element.service_name = companyServiceDataObject[language];
            element.details = companyServiceDetailsObject[language];
        } else {
            element.service_name = JSON.parse(companyServiceDataObject);
            element.details = JSON.parse(companyServiceDetailsObject);
        }

        // service details
        if (element.service_id != 0) {
            let serviceDetails = await serviceModel.getDataByWhereCondition({ "status": [1, 2], "id": element.service_id }, { "id": "DESC" }, undefined, undefined,
                ["id", "title", "status"]);

            if (isEmpty(serviceDetails)) {
                element.serviceDetails = {};
            } else {

                let serviceTitleDataObject = serviceDetails[0].title;

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
            let titleDataObject = categoryDetails[0].title;

            if (!isEmpty(language)) {
                categoryDetails[0].title = titleDataObject[language];
            } else {
                categoryDetails[0].title = titleDataObject;
            }

            element.categoryDetails = categoryDetails[0];
        }


        return res.status(200).send({
            success: true,
            status: 200,
            message: "Company Service Details.",
            data: result[0],
        });

    }

});

router.get("/my-service-details/:id", [verifyToken], async (req, res) => {

    let language = req.headers['language'];

    if (req.decoded.userInfo.role_id != 2) {
        return res.status(403).send({
            success: false,
            status: 403,
            message: "Can't access this route.",
        });
    }

    let id = req.params.id; // company service id

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

    let result = await companyServiceModel.getDataByWhereCondition({
        "id": id, "status": { "not eq": 0 },
        "company_id": req.decoded.profileInfo.company_id
    });

    if (isEmpty(result)) {

        return res.status(404).send({
            success: false,
            status: 404,
            message: "No data found",
        });

    } else {

        const element = result[0];

        let companyServiceDataObject = element.service_name;
        let companyServiceDetailsObject = element.details;

        if (!isEmpty(language)) {
            element.service_name = companyServiceDataObject[language];
            element.details = companyServiceDetailsObject[language];
        } else {
            element.service_name = companyServiceDataObject;
            element.details = companyServiceDetailsObject;
        }

        // service details
        if (element.service_id != 0) {
            let serviceDetails = await serviceModel.getDataByWhereCondition({ "status": [1, 2], "id": element.service_id }, { "id": "DESC" }, undefined, undefined,
                ["id", "title", "status"]);

            if (isEmpty(serviceDetails)) {
                element.serviceDetails = {};
            } else {

                let serviceTitleDataObject = serviceDetails[0].title;

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
            let titleDataObject = categoryDetails[0].title;

            if (!isEmpty(language)) {
                categoryDetails[0].title = titleDataObject[language];
            } else {
                categoryDetails[0].title = titleDataObject;
            }

            element.categoryDetails = categoryDetails[0];
        }


        return res.status(200).send({
            success: true,
            status: 200,
            message: "My Company Service Details.",
            data: result[0],
        });

    }

});


router.post('/pending-list', [verifyToken], async (req, res) => {

    let language = req.headers['language'];

    if (req.decoded.userInfo.role_id != 1) {
        return res.status(403).send({
            success: false,
            status: 403,
            message: "Can't access this route.",
        });
    }

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

    dataSearchConditionObject.status = 3;


    let result = await companyServiceModel.getDataByWhereCondition(dataSearchConditionObject, { "id": "DESC" },
        reqData.limit,
        reqData.offset
    );

    for (let index = 0; index < result.length; index++) {
        const element = result[index];

        let companyServiceDataObject = element.service_name;


        element.service_name = companyServiceDataObject;

        // category Details
        let categoryDetails = await categoryModel.getDataByWhereCondition({ "status": [1, 2], "id": element.category_id }, { "id": "DESC" }, undefined, undefined,
            ["id", "title", "status"]);

        if (isEmpty(categoryDetails)) {
            element.categoryDetails = {};
        } else {
            let titleDataObject = categoryDetails[0].title;

            if (!isEmpty(language)) {
                categoryDetails[0].title = titleDataObject[language];
            } else {
                categoryDetails[0].title = titleDataObject;
            }

            element.categoryDetails = categoryDetails[0];
        }

        // company name
        let companyDetails = await companyModel.getDataByWhereCondition({ "status": [1, 2], "id": element.company_id }, { "id": "DESC" }, undefined, undefined,
            ["id", "company_name", "status"]);

        if (isEmpty(companyDetails)) {
            element.companyDetails = {};
        } else {
            element.companyDetails = companyDetails[0];
        }
    }


    let totalData = await companyServiceModel.getDataByWhereCondition(
        dataSearchConditionObject,
        { "id": "ASC" },
        undefined,
        undefined, []
    );

    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "Company Service Pending List",
        "totalCount": totalData.length,
        "count": result.length,
        "data": result
    });
});


router.put('/approve-decline', [verifyToken], async (req, res) => {

    if (req.decoded.userInfo.role_id != 1) {
        return res.status(403).send({
            success: false,
            status: 403,
            message: "Can't access this route.",
        });
    }

    let reqData = {
        "id": req.body.id, // company service id
        "is_approved": req.body.is_approved
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

    let existingDataById = await companyServiceModel.getDataByWhereCondition({ "id": reqData.id, "status": 3 });

    if (isEmpty(existingDataById)) {

        return res.status(404).send({
            "success": false,
            "status": 404,
            "message": "No data found",

        });
    }

    // approve/decline
    if (([0, 1, "0", "1"].includes(reqData.is_approved)) == false) {
        return res.status(404).send({
            "success": false,
            "status": 404,
            "message": "Invalid Request",

        });
    }

    // company details
    let receiverMail;
    let companyDetails = await companyModel.getDataByWhereCondition({ "status": [1, 2], "id": existingDataById[0].company_id }, { "id": "DESC" }, undefined, undefined,
        ["id", "company_name", "email", "status"]);

    if (!isEmpty(companyDetails)) {
        receiverMail = companyDetails[0].email;
    }

    let result;
    let message = (reqData.is_approved == 1) ? "Approved" : "Declined";

    if (reqData.is_approved == 0) {

        let data = {
            status: 0,
            updated_by: reqData.updated_by,
            updated_at: await commonObject.getGMT()
        }

        if (existingDataById[0].is_data_coming_from_update == 0) {
            result = await companyServiceModel.updateById(reqData.id, data);
        } else if (existingDataById[0].is_data_coming_from_update == 1) {

            let currentSubscribedPackage = await companySubscribedPackageModel.getDataByWhereCondition(
                { company_id: existingDataById[0].company_id, status: 1 }
            );


            if (isEmpty(currentSubscribedPackage)) {
                return res.status(400).send({
                    success: false,
                    status: 400,
                    message: "You are not associated with any subscription package."
                });
            }

            let updatePackageData = {};
            updatePackageData.total_available_services = currentSubscribedPackage[0].total_available_services + 1;
            updatePackageData.updated_by = reqData.updated_by;
            updatePackageData.updated_at = await commonObject.getGMT();

            data.is_data_coming_from_update = 0;

            result = await companyServiceModel.deleteWithMultipleInfo(reqData.id, data, currentSubscribedPackage[0].id, updatePackageData);
        }

    } else {

        let updatePackageData = {};
        let packageId = 0;
        let currentSubscribedPackage;
        if (existingDataById[0].is_data_coming_from_update == 0) {
            // check this company has the limit of adding service or not
            currentSubscribedPackage = await companySubscribedPackageModel.getDataByWhereCondition(
                { company_id: existingDataById[0].company_id, status: 1 }
            );


            if (isEmpty(currentSubscribedPackage)) {
                return res.status(400).send({
                    success: false,
                    status: 400,
                    message: "You are not associated with any subscription package."
                });
            } else {
                if (currentSubscribedPackage[0].total_available_services <= 0) {
                    return res.status(400).send({
                        success: false,
                        status: 400,
                        message: "Adding Service limit has been crossed."
                    });
                }
            }

            // update available service on package
            updatePackageData.total_available_services = currentSubscribedPackage[0].total_available_services - 1;
            updatePackageData.updated_by = reqData.updated_by;
            updatePackageData.updated_at = await commonObject.getGMT();

            packageId = currentSubscribedPackage[0].id;
        }


        // update company service table and insert into service table

        let companyServiceUpdateData = {
            status: 1,
            is_data_coming_from_update: 0,
            updated_by: reqData.updated_by,
            updated_at: await commonObject.getGMT()
        }

        let serviceData = {};
        serviceData.category_id = existingDataById[0].category_id;
        serviceData.status = 1;
        serviceData.title = JSON.stringify(existingDataById[0].service_name);
        serviceData.created_by = req.decoded.userInfo.id;
        serviceData.updated_by = req.decoded.userInfo.id;
        serviceData.created_at = await commonObject.getGMT();
        serviceData.updated_at = await commonObject.getGMT();

        result = await companyServiceModel.updateWithMultipleInfo(reqData.id, companyServiceUpdateData, serviceData, packageId, updatePackageData);
    }

    if (result.affectedRows == undefined || result.affectedRows < 1) {
        return res.status(500).send({
            "success": true,
            "status": 500,
            "message": "Something Wrong in system database."
        });
    }

    // send email
    if (!isEmpty(receiverMail)) {
        let sendEmail = await emailCommonObject.sentEmailByHtmlFormate(
            receiverMail,
            `Company Service Request has been ${message}`,
            `Your request for the service on De-Auto app has been ${message}. Thank you. `,
        );
    }

    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": `Company Service Request has been ${message}.`
    });

});


//*** SEARCH BY ALL COMPANY ALL SERVICE *///

router.post('/all-company-service-list', [verifyToken], async (req, res) => {


    if (req.decoded.userInfo.role_id != 3) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "You can't access this."

        });
    }

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

    dataSearchConditionObject.status = 1;
    dataSearchConditionObject.service_id = { "GT": 0 };

    // find with service start date and end date
    let dateTimeToday = await commonObject.getGMT();
    let dateToday = await commonObject.getCustomDate(dateTimeToday, 0, 0, 0);
    dataSearchConditionObject["date(service_end_date)"] = { "GTE": dateToday }


    let result = await companyServiceModel.getDataByWhereCondition(dataSearchConditionObject, { "id": "ASC" },
        reqData.limit,
        reqData.offset
    );

    for (let index = 0; index < result.length; index++) {
        const element = result[index];

        let companyServiceDataObject = element.service_name;

        if (!isEmpty(language)) {
            element.service_name = companyServiceDataObject[language];
            element.details = element.details[language];

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

                let serviceTitleDataObject = serviceDetails[0].title;

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


    }


    let totalData = await companyServiceModel.getDataByWhereCondition(
        dataSearchConditionObject,
        { "id": "ASC" },
        "skip",
        undefined, []
    );

    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "All Company All Service List",
        "totalCount": totalData.length,
        "count": result.length,
        "data": result
    });
});


module.exports = router;