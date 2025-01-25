const express = require("express");
const isEmpty = require("is-empty");
const router = express.Router();
const commonObject = require("../common/common");
const verifyToken = require("../middlewares/jwt_verify/verifyToken");
const fileUploaderCommonObject = require("../common/fileUploader");
const configurationModel = require("../models/configuration");
const { default: ClientHints } = require("node-device-detector/client-hints");


require("dotenv").config();

let imagePathName = `${process.env.backend_url}${process.env.flag_image_path_name}`;


//configuration
router.get("/list", async (req, res) => {
  let result = await configurationModel.getList();

  return res.status(200).send({
    success: true,
    status: 200,
    message: "Configurations List.",
    imageFolderPath: imagePathName,
    data: result[0],
  });
});



router.get('/app_configuration_data', async (req, res) => {

  let backendUrl = process.env.backend_url;
  let data = {};

  return res.status(200).send({
    "success": true,
    "status": 200,
    "message": "Configuration",
    "data": data
  });
});



router.get('/app_language', async (req, res) => {

  let languageList = global.config.language;

  return res.status(200).send({
    "success": true,
    "status": 200,
    "message": "System language list",
    "data": languageList,
    "imageFolderPath": imagePathName
  });

});

router.get('/configuration-data', async (req, res) => {

  let languageList = global.config.language;
  let finalData = {};
  let userLanguage = "du";


  for (let languageIndex = 0; languageIndex < languageList.length; languageIndex++) {
    const language = languageList[languageIndex];
    finalData[language.short_name] = {};

    let tempData = await configurationModel.getDataByWhereCondition();
    let processData = {};

    for (let tempDataIndex = 0; tempDataIndex < tempData.length; tempDataIndex++) {  // page 
      let element = tempData[tempDataIndex];
      let tempContentKeys = [];

      element.content = JSON.parse(element.content);
      processData[element.page_key] = {};

      for (let contentIndex = 0; contentIndex < element.content.length; contentIndex++) {
        let content = element.content[contentIndex];
        processData[element.page_key][content.content_key] = content.data[language.short_name];
        tempContentKeys.push(content.content_key);
      }

      processData[element.page_key].key_list = tempContentKeys;

    }

    finalData[language.short_name]["content_text"] = processData;

    //  user language check
    if (req.headers['language'] == language.short_name) userLanguage = language.short_name;

  }
 

  return res.status(200).send({
    "success": true,
    "status": 200,
    "message": "System language list",
    "data": finalData[userLanguage],
    "imageFolderPath": imagePathName
  });

});





module.exports = router;
