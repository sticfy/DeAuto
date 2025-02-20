const express = require("express");
const isEmpty = require("is-empty");
const router = express.Router();
const commonObject = require('../common/common');
const packageModel = require('../models/package');
const companyModel = require('../models/company');
const companySubscribedPackageModel = require('../models/company-subscribed-package');
const companySubscribedPackageHistoryModel = require('../models/company-subscribed-package-history');
const transactionModel = require('../models/transaction');
const invoiceModel = require('../models/invoice');
const invoiceItemModel = require('../models/invoice-item');
const billingCardModel = require('../models/company-billing-card');


const verifyToken = require('../middlewares/jwt_verify/verifyToken');
const { routeAccessChecker } = require('../middlewares/routeAccess');
require('dotenv').config();

const stripeCallObject = require('../common/stripe');

router.post('/current-running-package', [verifyToken], async (req, res) => {

    if (req.decoded.userInfo.role_id == 3) {
        return res.status(403).send({
            success: false,
            status: 403,
            message: "You Can't access this route.",
        });
    }

    let reqData = {
        "company_id": req.body.company_id
    }

    if (req.decoded.userInfo.role_id == 2) {
        reqData.company_id = req.decoded.profileInfo.company_id;
    } else if (req.decoded.userInfo.role_id == 1) {
        let validateId = await commonObject.checkItsNumber(reqData.company_id);

        if (validateId.success == false) {
            return res.status(400).send({
                "success": false,
                "status": 400,
                "message": "Company Value should be integer."

            });
        } else {
            req.body.company_id = validateId.data;
            reqData.company_id = validateId.data;

            let existingCompanyDataById = await companyModel.getById(reqData.company_id);
            if (isEmpty(existingCompanyDataById)) {

                return res.status(404).send({
                    "success": false,
                    "status": 404,
                    "message": "No data found for this company.",

                });
            }
        }
    }

    let subscribePackage = await commonObject.getCompanyCurrentPackageByCompanyId(reqData.company_id);

    if (isEmpty(subscribePackage)) {
        return res.status(404).send({
            "success": false,
            "status": 404,
            "message": "You have no subscription."
        });
    }

    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "Company Current Running Package.",
        "data": subscribePackage
    });
});

router.post('/subscribe-new-package', [verifyToken], async (req, res) => {

    let packageId = req.body.package_id;

    if (req.decoded.userInfo.role_id != 2) {
        return res.status(403).send({
            success: false,
            status: 403,
            message: "You Can't access this route.",
        });
    }

    // check I have billing card or not
    let billingCardDetails = await billingCardModel.getDataByWhereCondition(
        { "company_id": req.decoded.profileInfo.company_id, "status": 1 }
    );

    if (isEmpty(billingCardDetails)) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Please add a billing card."

        });
    }

    // Check package 
    let validateId = await commonObject.checkItsNumber(packageId);


    if (validateId.success == false) {

        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Package Value should be integer."

        });
    } else {
        packageId = validateId.data;

    }

    let existingPackageData = await packageModel.getDataByWhereCondition(
        { "id": packageId, "status": 1 }
    );


    if (isEmpty(existingPackageData)) {
        return res.status(404).send({
            "success": false,
            "status": 404,
            "message": "Unknown Package"
        });
    }

    existingPackageData = existingPackageData[0];

    let currentDateTime = await commonObject.getGMT();
    let subscribePackage = await commonObject.getCompanyCurrentPackageByCompanyId(req.decoded.profileInfo.company_id);

    let packageSubscribeCreatedData, packageSubscribeUpdatedData = undefined;


    let expiredDate = await commonObject.getCustomDate(
        currentDateTime, existingPackageData.duration, 0, 0
    );



    if (subscribePackage == undefined) {

        packageSubscribeCreatedData = {
            package_id: existingPackageData.id,
            company_id: req.decoded.profileInfo.company_id,
            total_available_services: existingPackageData.service_limit,
            total_available_bookings: existingPackageData.appointment_limit,
            details: JSON.stringify(existingPackageData),
            expired_date: expiredDate,
            updated_by: req.decoded.userInfo.id,
            created_by: req.decoded.userInfo.id,
        }

    } else {

        packageSubscribeUpdatedData = {
            "id": subscribePackage.id,
            "data": {
                package_id: existingPackageData.id,
                company_id: req.decoded.profileInfo.company_id,
                total_available_services: existingPackageData.service_limit,
                total_available_bookings: existingPackageData.appointment_limit,
                details: JSON.stringify(existingPackageData),
                expired_date: expiredDate,
                updated_by: req.decoded.userInfo.id
            }
        }
    }

    let packageSubscribeHistoryData = {
        package_id: existingPackageData.id,
        company_id: req.decoded.profileInfo.company_id,
        expired_date: expiredDate,
        price: existingPackageData.price - existingPackageData.discount_amount,
        details: JSON.stringify(existingPackageData),
        status: 1,
        created_by: req.decoded.userInfo.id,
        updated_by: req.decoded.userInfo.id,
    }


    let invoiceInfo = {
        "user_id": req.decoded.userInfo.id,
        "company_id": req.decoded.profileInfo.company_id,
        "sub_total_price": existingPackageData.price,
        "discount_price": existingPackageData.discount_amount,
        "total_price": existingPackageData.price - existingPackageData.discount_amount,
        "status": 1,
        "created_by": req.decoded.userInfo.id,
        "updated_by": req.decoded.userInfo.id,
    }


    let invoiceItemInfo = {
        "invoice_id": 0,
        "price": existingPackageData.price - existingPackageData.discount_amount,
        "qty": 1,
        "title": JSON.stringify(existingPackageData.title),
        "created_by": req.decoded.userInfo.id,
        "updated_by": req.decoded.userInfo.id
    }

    // payment transaction process

    let result;

    let transactionData = {
        "user_id": req.decoded.userInfo.id,
        "company_id": req.decoded.profileInfo.company_id,
        "item_id": packageId,
        "item_table_name": 'deautodb_payment_packages',
        "transaction_type": 1, // stripe,
        "amount": existingPackageData.price - existingPackageData.discount_amount,
        "email": req.decoded.profileInfo.email,
        "transaction_status": 2, // pending
        "created_by": req.decoded.userInfo.id,
        "created_at": currentDateTime,
        "updated_by": req.decoded.userInfo.id,
        "updated_at": currentDateTime
    }


    // call the transaction initialize of stripe
    let initializePayment = await stripeCallObject.paymentIntentCreate(transactionData.amount, process.env.CURRENCY);

    // console.log(initializePayment.data);
    if (initializePayment.status == false) {
        return res.status(404).send({
            "success": false,
            "status": 404,
            "message": "Payment Initiation Failed",

        });
    }

    // if(initializePayment.status == true){
    transactionData.transaction_response = JSON.stringify(initializePayment.data);
    transactionData.transaction_reference_id = initializePayment.data.id; // transaction id

    let processedData = {};
    processedData.packageSubscribeHistoryData = packageSubscribeHistoryData;
    processedData.invoiceInfo = invoiceInfo;
    processedData.invoiceItemInfo = invoiceItemInfo;


    if (packageSubscribeCreatedData == undefined) {
        // update
        processedData.packageSubscribeUpdatedData = packageSubscribeUpdatedData;

        // result = await companySubscribedPackageModel.updateWithMultipleInfo(packageSubscribeUpdatedData, packageSubscribeHistoryData, invoiceInfo, invoiceItemInfo);
    } else {
        //create
        processedData.packageSubscribeCreatedData = packageSubscribeCreatedData;

        // result = await companySubscribedPackageModel.addNewWithMultipleInfo(packageSubscribeCreatedData, packageSubscribeHistoryData, invoiceInfo, invoiceItemInfo)
    }

    transactionData.details = JSON.stringify(processedData);

    result = await transactionModel.addNew(transactionData);


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
        message: "Payment Intent Success.",
        data: {
            paymentIntentId: initializePayment.data.id,
            clientSecretKey: initializePayment.data.client_secret
        }
    });

});

router.post('/verify-payment', [verifyToken], async (req, res) => {

    let payment_intent_id = req.body.payment_intent_id;

    if (req.decoded.userInfo.role_id != 2) {
        return res.status(403).send({
            success: false,
            status: 403,
            message: "You Can't access this route.",
        });
    }

    let responsePaymentIntent = await stripeCallObject.paymentIntentRetrieve(payment_intent_id);

   
    if (responsePaymentIntent == false) {
        return res.status(404).send({
            "success": false,
            "status": 404,
            "message": "Invalid Payment Intent!!"
        });
    }

    // if (responsePaymentIntent.status != "succeeded") {
    //     return res.status(404).send({
    //         "success": false,
    //         "status": 404,
    //         "message": "Payment Failed!!"
    //     });
    // }

    // find the transaction details with payment reference id
    let transactionDetails = await transactionModel.getDataByWhereCondition(
        { "transaction_reference_id": payment_intent_id, item_table_name: 'deautodb_payment_packages', transaction_type: 1, transaction_status: 2, status: 1 }
    );

    if (isEmpty(transactionDetails)) {
        return res.status(404).send({
            "success": false,
            "status": 404,
            "message": "Invalid Transaction Details",
        });
    }

    // update the transaction response and add data on course enroll
    let updateTransactionData = {};

    updateTransactionData.transaction_response = JSON.stringify(responsePaymentIntent);
    updateTransactionData.transaction_status = 1; // success
    updateTransactionData.updated_at = await commonObject.getGMT();

    // other data
    let processedData = transactionDetails[0].details;

    processedData = JSON.parse(processedData);

    // return res.status(404).send({
    //     "success": false,
    //     "status": 404,
    //     "transactionDetails": transactionDetails[0],
    //     "updateTransactionData": updateTransactionData,
    //     "processedData": processedData,
    // });

    let result = await transactionModel.updateById(transactionDetails[0].id, updateTransactionData, processedData);

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
        "message": "Payment successfully done."
    });


});

router.post('/package-payment-list', [verifyToken], async (req, res) => {

    if (req.decoded.userInfo.role_id == 3) {
        return res.status(403).send({
            success: false,
            status: 403,
            message: "You Can't access this route.",
        });
    }

    let reqData = {
        "limit": req.body.limit,
        "offset": req.body.offset,
        "company_id": req.body.company_id
    }

    if (!(await commonObject.checkItsNumber(reqData.limit)).success || reqData.limit < 1) {
        dataSearchConditionObject.limit = 50;
    }

    if (!(await commonObject.checkItsNumber(reqData.offset)).success || reqData.offset < 0) {
        dataSearchConditionObject.offset = 0;
    }


    if (req.decoded.userInfo.role_id == 2) {
        reqData.company_id = req.decoded.profileInfo.company_id;
    } else if (req.decoded.userInfo.role_id == 1) {
        let validateId = await commonObject.checkItsNumber(reqData.company_id);

        if (validateId.success == false) {
            return res.status(400).send({
                "success": false,
                "status": 400,
                "message": "Company Value should be integer."

            });
        } else {
            req.body.company_id = validateId.data;
            reqData.company_id = validateId.data;

            let existingCompanyDataById = await companyModel.getById(reqData.company_id);
            if (isEmpty(existingCompanyDataById)) {

                return res.status(404).send({
                    "success": false,
                    "status": 404,
                    "message": "Company not found.",

                });
            }

        }

    }

    let packageInvoiceList = await invoiceModel.getDataByWhereCondition(
        { "status": 1, "company_id": reqData.company_id, "type": 1 },
        { "created_at": "DESC" },
        reqData.limit,
        reqData.offset,
        ["id", "inv_no", "sub_total_price", "discount_price", "total_price", "related_info_id", "created_at", "updated_at", "status"
        ]
    );

    for (let index = 0; index < packageInvoiceList.length; index++) {
        const element = packageInvoiceList[index];

        let subscribedPackageHistoryDetails = await companySubscribedPackageHistoryModel.getDataByWhereCondition(
            { "status": 1, "company_id": reqData.company_id, "id": element.related_info_id },
            undefined, undefined, undefined, ["package_id", "details"]
        );

        if (!isEmpty(subscribedPackageHistoryDetails)) {
            subscribedPackageHistoryDetails = JSON.parse(subscribedPackageHistoryDetails[0].details)
            // subscribedPackageHistoryDetails = subscribedPackageHistoryDetails[0]
        } else {
            subscribedPackageHistoryDetails = {};
        }

        packageInvoiceList[index].package_history = subscribedPackageHistoryDetails;
    }

    let allPackageInvoiceList = await invoiceModel.getDataByWhereCondition(
        { "status": 1, "company_id": reqData.company_id, "type": 1 },
        { "id": "DESC" },
        "skip",
        undefined,
        []);


    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "Subscribed package payment list.",
        "totalCount": allPackageInvoiceList.length,
        "count": packageInvoiceList.length,
        "data": packageInvoiceList
    });
});


router.post('/package-payment-invoice-details', [verifyToken], async (req, res) => {

    if (req.decoded.userInfo.role_id == 3) {
        return res.status(403).send({
            success: false,
            status: 403,
            message: "You Can't access this route.",
        });
    }

    let id = req.body.id;
    let company_id = req.body.company_id;

    let validateId = await commonObject.checkItsNumber(id);
    if (validateId.success == false) {

        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Invoice Value should be integer.",
            "id": id

        });
    } else {
        id = validateId.data;
    }

    if (req.decoded.userInfo.role_id == 2) {
        company_id = req.decoded.profileInfo.company_id;
    } else if (req.decoded.userInfo.role_id == 1) {
        let validateId = await commonObject.checkItsNumber(company_id);

        if (validateId.success == false) {
            return res.status(400).send({
                "success": false,
                "status": 400,
                "message": "Company Value should be integer."

            });
        } else {
            company_id = validateId.data;

            let existingCompanyDataById = await companyModel.getById(company_id);
            if (isEmpty(existingCompanyDataById)) {

                return res.status(404).send({
                    "success": false,
                    "status": 404,
                    "message": "Company not found.",

                });
            }

        }
    }

    let invoiceDetails = await invoiceModel.getDataByWhereCondition(
        { "status": 1, "company_id": company_id, "type": 1, "id": id },
        { "id": "DESC" }, 1, 0,
        ["id", "inv_no", "sub_total_price", "discount_price", "total_price", "related_info_id", "created_at", "updated_at", "status"
        ]);

    if (isEmpty(invoiceDetails)) {
        return res.status(404).send({
            "success": false,
            "status": 404,
            "message": "No invoice data found",
        });
    }

    const element = invoiceDetails[0];

    let subscribedPackageHistoryDetails = await companySubscribedPackageHistoryModel.getDataByWhereCondition(
        { "status": 1, "company_id": company_id, "id": element.related_info_id },
        undefined, undefined, undefined, ["package_id", "details"]
    );

    if (!isEmpty(subscribedPackageHistoryDetails)) {
        subscribedPackageHistoryDetails = JSON.parse(subscribedPackageHistoryDetails[0].details)
        // subscribedPackageHistoryDetails = subscribedPackageHistoryDetails[0]
    } else {
        subscribedPackageHistoryDetails = {};
    }



    invoiceDetails[0].package_history = subscribedPackageHistoryDetails;


    let invoiceItems = await invoiceItemModel.getDataByWhereCondition(
        { "status": 1, "invoice_id": id },
        { "id": "DESC" }, undefined, undefined,
        [
            "id", "price", "title", "qty", "status"
        ], "en"
    );

    invoiceDetails[0].invoice_items = invoiceItems;


    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "Package payment invoice details.",
        "data": invoiceDetails[0]
    });
});

module.exports = router;