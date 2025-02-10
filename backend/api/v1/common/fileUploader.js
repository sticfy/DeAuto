const fs = require('fs');
const fileUpload = require('express-fileupload');
const encrypt = require('node-file-encrypt');
const isEmpty = require("is-empty");

const commonObject = require('../common/common');


var path = require("path");
require('dotenv').config();

// 1 KB  = 1024 BYTE 

let uploadFileFormate = [{
    fileType: "image",
    maxSize: 15 * 1024, //  MB TO KB
    mimetype: ["jpg", "jpeg", "png"],
    fileSavePath: process.env.profile_image_path,
    willEncrypt: false
},
{
    fileType: "adminImage",
    maxSize: 15 * 1024, //  MB TO KB
    mimetype: ["jpg", "jpeg", "png"],
    fileSavePath: process.env.admin_image_path,
    willEncrypt: false
},
{
    fileType: "profileImage",
    maxSize: 15 * 1024, //  MB TO KB
    mimetype: ["jpg", "jpeg", "png"],
    fileSavePath: process.env.user_profile_image_path,
    willEncrypt: false
},
{
    fileType: "bannerImage",
    maxSize: 15 * 1024, //  MB TO KB
    mimetype: ["jpg", "jpeg", "png"],
    fileSavePath: process.env.banner_image_path,
    willEncrypt: false
},

{
    fileType: "companyLogo",
    maxSize: 15 * 1024, //  MB TO KB
    mimetype: ["jpg", "jpeg", "png"],
    fileSavePath: process.env.company_logo_path,
    willEncrypt: false
},

{
    fileType: "companyImage",
    maxSize: 15 * 1024, //  MB TO KB
    mimetype: ["jpg", "jpeg", "png"],
    fileSavePath: process.env.company_image_path,
    willEncrypt: false
},

{
    fileType: "companyUserImage",
    maxSize: 15 * 1024, //  MB TO KB
    mimetype: ["jpg", "jpeg", "png"],
    fileSavePath: process.env.company_user_image_path,
    willEncrypt: false
},
{
    fileType: "categoryImage",
    maxSize: 15 * 1024, //  MB TO KB
    mimetype: ["jpg", "jpeg", "png"],
    fileSavePath: process.env.category_image_path,
    willEncrypt: false
},


{
    fileType: "dealerBulkUpload",
    maxSize: 15 * 1024, //  MB TO KB
    mimetype: ["xls", "x-xls", "msexcel", "vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
    fileSavePath: process.env.disease_detection_bulk_file_path,
    willEncrypt: false,
    changeMimeType: [{ "old": "vnd.openxmlformats-officedocument.spreadsheetml.sheet", "new": "xlsx" }]
},
{
    fileType: "noteImage",
    maxSize: 15 * 1024, //  MB TO KB
    mimetype: ["jpg", "jpeg", "png"],
    fileSavePath: process.env.note_image_path,
    willEncrypt: false
}

]

let uploadFile = async (req, fileTypeObjectName = "image", inputFieldName = "unknown") => {

    return new Promise(async (resolve, reject) => {

        try {

            // check file is exits or not
            if (isEmpty(req.files) || Object.keys(req.files).length < 1) {
                return resolve({
                    success: false,
                    message: "No files were uploaded."
                });
            }


            // get file condition check and get
            let tempFileFormate;

            for (let index = 0; index < uploadFileFormate.length; index++) {

                if (uploadFileFormate[index].fileType == fileTypeObjectName) {
                    tempFileFormate = uploadFileFormate[index];
                    break;
                }
            }

            if (tempFileFormate === undefined) {
                return resolve({
                    success: false,
                    message: "Unknown file type"
                });
            }

            // check input field name in exit or not 
            // if (!req.files.hasOwnProperty(inputFieldName)) {

            if (Object.keys(req.files).indexOf(inputFieldName) == -1) {
                return resolve({
                    success: false,
                    message: "Unknown request field name"
                });
            }



            // upload file location check, mime type and size
            let directory = __dirname.split("backend");
            let tempMimetype = req.files[inputFieldName].mimetype.split("/");
            tempMimetype = tempMimetype[tempMimetype.length - 1];

            if (tempFileFormate.mimetype.indexOf(tempMimetype) < 0) {
                return resolve({
                    success: false,
                    message: "Invalid file type"
                });

            } else if (tempFileFormate.maxSize < (req.files[inputFieldName].size / 1024)) {
                return resolve({
                    success: false,
                    message: "File size is too large. Max limit is " + (tempFileFormate.maxSize / 1024) + " MB"
                });
            }

            try {
                if (!isEmpty(tempFileFormate.changeMimeType)) { // change mime type
                    for (let index = 0; index < tempFileFormate.changeMimeType.length; index++) {
                        const element = tempFileFormate.changeMimeType[index];
                        if (element.old == tempMimetype) {
                            tempMimetype = element.new;
                            break;
                        }
                    }
                }
            } catch (error) { }


            sampleFile = req.files[inputFieldName];
            // let newFileName = Date.now() + '-' + sampleFile.name;
            let newFileName = Date.now() + '-' + await commonObject.randomStringGenerate(10) + "." + tempMimetype;
            uploadPath = directory[0] + '/backend/' + tempFileFormate.fileSavePath + newFileName;




            // check folder is exits or not, if not create new folder
            let tempFolderArray = ("backend/" + tempFileFormate.fileSavePath).split("/");
            let tempDirectoryPath = directory[0] + "/";

            for (let index = 0; index < tempFolderArray.length; index++) {
                tempDirectoryPath += tempFolderArray[index] + "/";

                if (!fs.existsSync(tempDirectoryPath)) {
                    fs.mkdirSync(tempDirectoryPath);
                }
            }

            // move file to upload folder
            sampleFile.mv(uploadPath, async function (err) {
                if (err) {
                    return resolve({
                        success: false,
                        message: err
                    });

                } else {

                    if (tempFileFormate.willEncrypt == true) {

                        let f = new encrypt.FileEncrypt(uploadPath);
                        f.openSourceFile();
                        f.encrypt('111111');


                        encryptPath = f.encryptFilePath;


                        // encryptPath = encryptPath.split("\\");
                        // encryptPath = encryptPath[encryptPath.length - 1];

                        encryptPath = path.basename(encryptPath);



                        // remove uploaded original file
                        await fileRemove(newFileName, fileTypeObjectName);

                        return resolve({
                            success: true,
                            message: "file uploaded successfully",
                            fileName: encryptPath,
                            fileOriginalName: sampleFile.name
                        });

                    } else {
                        return resolve({
                            success: true,
                            message: "file uploaded successfully",
                            fileName: newFileName,
                            fileOriginalName: sampleFile.name,
                            locationPath: tempDirectoryPath
                        });
                    }
                }
            });

        } catch (error) {
            console.log(error)
            return resolve({
                success: false,
                message: "Catch Error",
                error: error
            });
        }
    });
}



let fileRemove = async (fileName = "", fileTypeObjectName = "image") => {


    return new Promise((resolve, reject) => {

        try {

            // get file condition check and get
            let tempFileFormate;

            for (let index = 0; index < uploadFileFormate.length; index++) {

                if (uploadFileFormate[index].fileType == fileTypeObjectName) {
                    tempFileFormate = uploadFileFormate[index];
                    break;
                }
            }

            if (tempFileFormate === undefined) {
                return resolve({
                    success: false,
                    message: "Unknown file type"
                });
            }


            // upload file location check, mime type and size
            let directory = __dirname.split("backend");
            let uploadPath = directory[0] + '/backend/' + tempFileFormate.fileSavePath + fileName;

            // console.log(uploadPath)
            // console.log(fileName)

            fs.chmodSync(directory[0] + '/backend/' + tempFileFormate.fileSavePath, '0444');
            fs.unlinkSync(uploadPath);

            return resolve({
                success: true,
                message: "file remove successfully done",
                fileName: fileName
            });

        } catch (error) {
            return resolve({
                success: false,
                message: "Catch file not remove.",
                error: error
            });
        }

    });
}



let fileDecrypt = async (fileName = "", fileTypeObjectName = "image") => {

    return new Promise((resolve, reject) => {

        try {

            // get file condition check and get
            let tempFileFormate;

            for (let index = 0; index < uploadFileFormate.length; index++) {

                if (uploadFileFormate[index].fileType == fileTypeObjectName) {
                    tempFileFormate = uploadFileFormate[index];
                    break;
                }
            }

            if (tempFileFormate === undefined) {
                return resolve({
                    success: false,
                    message: "Unknown file type"
                });
            }


            // upload file location check, mime type and size
            let directory = __dirname.split("backend");
            let encryptPath = directory[0] + '/backend/' + tempFileFormate.fileSavePath + fileName;

            let filePath = directory[0] + '/backend/' + tempFileFormate.fileSavePath;

            fs.unlink(filePath, function () { });
            f = new encrypt.FileEncrypt(encryptPath);
            f.openSourceFile();
            f.decrypt('111111');

            let decryptFilePath = f.decryptFilePath;
            // let decryptFileName = decryptFilePath.split("\\");
            // decryptFileName = decryptFileName[decryptFileName.length - 1];

            decryptFileName = path.basename(decryptFilePath);

            // console.log(f.decryptFilePath);
            // console.log(f);
            // console.log(decryptFileName);

            // res.download(file)

            return resolve({
                success: true,
                message: "Decrypt successfully done",
                data: {
                    "encrypt_file_name": fileName,
                    "decrypt_file_name": decryptFileName,
                    "decrypt_file_with_image_path": decryptFilePath,
                }
            });

        } catch (error) {
            console.log(error)
            return resolve({
                success: false,
                message: "Catch file not uploaded",
                error: error
            });
        }

    });
}

let fileRename = async (existingFileName = "", newFileName = "xcs", fileTypeObjectName = "image") => {


    return new Promise((resolve, reject) => {

        try {

            // get file condition check and get
            let tempFileFormate;

            for (let index = 0; index < uploadFileFormate.length; index++) {

                if (uploadFileFormate[index].fileType == fileTypeObjectName) {
                    tempFileFormate = uploadFileFormate[index];
                    break;
                }
            }

            if (tempFileFormate === undefined) {
                return resolve({
                    success: false,
                    message: "Unknown file type"
                });
            }


            // upload file location check, mime type and size
            let directory = __dirname.split("backend");
            let uploadPath = directory[0] + '/backend/' + tempFileFormate.fileSavePath;



            fs.chmodSync(directory[0] + '/backend/' + tempFileFormate.fileSavePath, '0444');
            fs.renameSync(uploadPath + existingFileName, uploadPath + newFileName);

            // console.log(uploadPath+existingFileName);

            return resolve({
                success: true,
                message: "file remove successfully done",
                fileName: newFileName
            });

        } catch (error) {
            return resolve({
                success: false,
                message: "Catch file not remove.",
                error: error
            });
        }

    });
}

let fileExitCheck = async (fileName = "", fileTypeObjectName = "image") => {


    return new Promise((resolve, reject) => {

        try {

            // get file condition check and get
            let tempFileFormate;

            for (let index = 0; index < uploadFileFormate.length; index++) {

                if (uploadFileFormate[index].fileType == fileTypeObjectName) {
                    tempFileFormate = uploadFileFormate[index];
                    break;
                }
            }

            if (tempFileFormate === undefined) {
                return resolve({
                    success: false,
                    message: "Unknown file type"
                });
            }

            let directory = __dirname.split("backend");
            let uploadPath = directory[0] + '/backend/' + tempFileFormate.fileSavePath;

            if (fs.existsSync(uploadPath + fileName)) {
                return resolve({
                    success: true,
                    message: "File exists"
                });
            } else {
                return resolve({
                    success: false,
                    message: "File not found"
                });
            }

        } catch (error) {
            return resolve({
                success: false,
                message: "Catch file not remove.",
                error: error
            });
        }

    });
}


module.exports = {
    uploadFile,
    fileRemove,
    fileDecrypt,
    fileRename,
    fileExitCheck
}