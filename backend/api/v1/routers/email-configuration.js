const express = require("express");
const isEmpty = require("is-empty");
const router = express.Router();
const commonObject = require('../common/common');
const cacheDataObject = require('../common/cache-data');
const bcrypt = require('bcrypt');
const emailConfigurationModel = require('../models/email-configuration');
const verifyToken = require('../middlewares/jwt_verify/verifyToken');
const { routeAccessChecker } = require('../middlewares/routeAccess');


require('dotenv').config();

//add email configuration
router.post('/emailConfiguration',[verifyToken],async(req,res)=>{

    let reqData={
        "host": req.body.host,
        "port":req.body.port,
        "email":req.body.email,
        "password":req.body.password
    }
    
    reqData.created_by = req.decoded.userInfo.id;
    reqData.updated_by = req.decoded.userInfo.id;

    let currentDateTime = await commonObject.getGMT();
    reqData.created_at =  currentDateTime;
    reqData.updated_at =  currentDateTime;

    
    //port
    if (isEmpty(reqData.port)) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: "Invalid request data. 'Port' is required and cannot be empty.",
        });
      }
    let validatePort = await commonObject.checkItsNumber(reqData.port);

    if (validatePort.success == false) {
      return res.status(400).send({
        success: false,
        status: 400,
        message: "Invalid Port ",
      });
    }else {
      req.body.port = validatePort.data;
      reqData.port = validatePort.data;
    }

    
    //email
     if (isEmpty(reqData.email)) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: "Invalid request data. 'email' is required and cannot be empty.",
        });
      }
    
      let validateEmail = await commonObject.isValidEmail(reqData.email);
      if (validateEmail == false) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: "Email is not valid",
        });
      }

    //password
    if (isEmpty(reqData.password)) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: "Invalid request data. 'Password' is required and cannot be empty.",
        });
      }

    let validatePassword = await commonObject.characterLimitCheck(reqData.password,"password");

    if (validatePassword.success == false) {
      return res.status(400).send({
        success: false,
        status: 400,
        message: "Password is not valid",
      });
    }else{
        reqData.password = validatePassword.data;
        req.body.password = validatePassword.data;
    }

    

    let existingDataById = await emailConfigurationModel.getDataByWhereCondition(
        { "status": 1 }, { "id": "DESC" });

    if (isEmpty(existingDataById)) {
        // Add new data
        let result = await emailConfigurationModel.addNew(reqData);

        if (result.affectedRows == undefined || result.affectedRows < 1) {
            return res.status(500).send({
                success: false,
                status: 500,
                message: "Something Wrong in system database.",
            });
        }

        res.status(201).send({
            "success": true,
            "status": 201,
            "message": "Email Configurations Added Successfully."
        });

    } else {
     // Add updated data
        let updatedResult = await emailConfigurationModel.updateById(existingDataById[0].id, reqData);

        if (updatedResult.affectedRows == undefined || updatedResult.affectedRows < 1) {
            return res.status(500).send({
                success: false,
                status: 500,
                message: "Something Wrong in system database.",
            });
        }

         res.status(201).send({
            "success": true,
            "status": 201,
            "message": "Email Configurations Updated Successfully."
        });
    }

    cacheDataObject.loadCacheData();
     

});

// get email-configuration
router.get('/email-configuration',[verifyToken],async(req,res)=>{
   
    let data = {
        "host": "",
        "port": "",
        "email": "",
        "password":""
    }
    const result = await emailConfigurationModel.getDataByWhereCondition({ "status": 1 }, undefined, undefined, undefined, ["host", "port","email","password"]);

        if (result.length === 0) {
            return res.status(200).send({
                success: true,
                status: 200,
                message: "",
                data
            });
        }

        data.host = result[0].host;
        data.port = result[0].port;
        data.email = result[0].email;
        data.password = result[0].password;

        return res.status(200).send({
            success: true,
            status: 200,
            message: "",
            data
        });
});

module.exports = router;