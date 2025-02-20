


// Stripe Gateway Implementation
router.post('/process-initiate', [verifyToken, routeAccessChecker("packageEnrollInitiate")], async (req, res) => {

    let reqData = {
        "user_id": req.body.user_id,
        "package_id": req.body.package_id
    }

    let validateId = await commonObject.checkItsNumber(reqData.package_id);


    if (validateId.success == false) {

        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Package Id Value should be integer."

        });
    } else {
        req.body.package_id = validateId.data;
        reqData.package_id = validateId.data;

    }

    let existingPackageDataById = await packageModel.getDataByWhereCondition(
        { id: reqData.package_id, status: 1 }
    );
    if (isEmpty(existingPackageDataById)) {

        return res.status(404).send({
            "success": false,
            "status": 404,
            "message": "No package data found",

        });
    }

    // check user already enrolled or not
    let existingTransactionData = await packageTransactionModel.getDataByWhereCondition(
        { package_id: reqData.package_id, user_id: req.decoded.userInfo.id, status: 1 }
    );

    let updateExistingTransaction = {};
    let previousId = 0;
    if (!isEmpty(existingTransactionData)) {
        previousId = existingTransactionData[0].id;

        if (existingTransactionData[0].transaction_status == 2) { // pending

            // checking exiting payment intent is succeed or not
            let responsePaymentIntent = await stripeCallObject.paymentIntentRetrieve(existingTransactionData[0].transaction_id);

            if (responsePaymentIntent.status != "succeeded") {
                // make that status 0
                updateExistingTransaction.status = 0,
                    updateExistingTransaction.updated_by = req.decoded.userInfo.id,
                    updateExistingTransaction.updated_at = await commonObject.getGMT()
            } else {
                // update the transaction response and add data on course enroll

                let updateTransactionData = {};

                updateTransactionData.transaction_response = JSON.stringify(responsePaymentIntent);
                updateTransactionData.transaction_status = 1; // success
                updateTransactionData.updated_at = await commonObject.getGMT();

                let result = await packageTransactionModel.updateById(existingTransactionData[0].id, updateTransactionData);

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
                    "message": "Package enrolled successful by checking existing payment intent id.",
                    "data": {
                        user_id: existingTransactionData[0].user_id,
                        package_id: existingTransactionData[0].package_id,
                    }
                });
            }

        }

    }

    // set transaction object

    let transactionData = {
        "user_id": req.decoded.userInfo.id,
        "package_id": reqData.package_id,
        "transaction_type": 1, // online
        "transaction_status": 2, // pending
        "amount": existingPackageDataById[0].price - existingPackageDataById[0].discount_amount,
        "customer_name": req.decoded.profileInfo.name,
        "details": JSON.stringify(reqData),
        "created_by": req.decoded.userInfo.id,
        "updated_by": req.decoded.userInfo.id,
        "created_at": await commonObject.getGMT(),
        "updated_at": await commonObject.getGMT(),

    }

    // call stripe payment intent
    let paymentIntent = await stripeCallObject.paymentIntentCreate(transactionData.amount, process.env.CURRENCY);

    transactionData.transaction_id = paymentIntent.id;
    transactionData.transaction_response = JSON.stringify(paymentIntent);

    let result = await packageTransactionModel.addPaymentInitialize(transactionData, previousId, updateExistingTransaction);

    if (result.affectedRows == undefined || result.affectedRows < 1) {
        return res.status(500).send({
            "success": false,
            "status": 500,
            "message": "Something Wrong in system database."
        });
    }

    return res.status(200).send({
        success: true,
        status: 200,
        message: "Payment Intent Success.",
        data: {
            paymentIntentId: paymentIntent.id,
            clientSecretKey: paymentIntent.client_secret
        }

    });

});



// verify a payment intent
router.post('/verify', [verifyToken, routeAccessChecker("packageEnrollInitiate")], async (req, res) => {

    let reqData = {
        "payment_intent_id": req.body.payment_intent_id
    }

    let responsePaymentIntent = await stripeCallObject.paymentIntentRetrieve(reqData.payment_intent_id);

    if (responsePaymentIntent.status != "succeeded") {
        return res.status(404).send({
            "success": false,
            "status": 404,
            "message": "Payment Failed!!"
        });
    }

    // find the transaction details with payment intent id

    let transactionDetails = await packageTransactionModel.getDataByWhereCondition(
        { "transaction_id": reqData.payment_intent_id, transaction_type: 1, transaction_status: 2, status: 1 }
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

    let result = await packageTransactionModel.updateById(transactionDetails[0].id, updateTransactionData);

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
        "message": "Package enrolled successfully.",
        "data": {
            user_id: transactionDetails[0].user_id,
            package_id: transactionDetails[0].package_id,
            transaction_id: transactionDetails[0].transaction_id,
        }
    });

});
