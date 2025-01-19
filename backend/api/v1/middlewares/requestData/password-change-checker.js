var express = require('express');
var router = express.Router();
const isEmpty = require("is-empty");
const commonObject = require('../../common/common');

router.use(async function (req, res, next) {


    let newPasswordResponse  = await commonObject.characterLimitCheck(req.body.new_password, "Password");
    let old_password  = req.body.old_password;
    let message = "";
    let error = false;

    if(isEmpty(old_password)){
        error = true;
        message = "Please provide old password.";
    }

    if (newPasswordResponse.success == false) {
        message += newPasswordResponse.message;
        error = true;
    } 

    if (error) {
        return res.status(400)
            .send({
                "success": false,
                "status": 400,
                "message": message,
                "data" : {
                    "old_password" : req.body.old_password,
                    "new_password" : req.body.new_password
                }
            });
    } else {
        req.body.new_password = newPasswordResponse.data;
        next()
    }

});

module.exports = router;
