const express = require("express");
const router = express.Router();
const isEmpty = require("is-empty");
let fs = require('fs');
let path = require('path');
const commonObject = require('./common/common');

const { connectionDeAutoMYSQL } = require('./connections/connection');
global.config = require('./jwt/config/config');

const roleRouter = require('./routers/role');
const adminRouter = require('./routers/admin');
const authenticationRouter = require('./routers/authentication');
const userRouter = require('./routers/user');
const configurationRouter = require('./routers/configuration');
const emailConfigurationRouter = require('./routers/email-configuration');
const permissionRouter = require('./routers/permission');
const moduleRouter = require('./routers/module');
const genderRouter = require('./routers/gender');
const categoryRouter = require('./routers/category');
const serviceRouter = require('./routers/service');
const faqRouter = require('./routers/faq');
const bannerRouter = require('./routers/banner');
const packageRouter = require('./routers/package');
const companyRouter = require('./routers/company');
const billingCardRouter = require('./routers/company-billing-card');
const companyServiceRouter = require('./routers/company-service');
const favouriteRouter = require('./routers/favourite');
const companyReviewRouter = require('./routers/company-review');


router.use('/role', roleRouter);
router.use('/admin', adminRouter);
router.use('/authentication', authenticationRouter);
router.use('/user', userRouter);
router.use('/configuration', configurationRouter);
router.use('/email-configuration', emailConfigurationRouter);
router.use('/permission', permissionRouter);
router.use('/module', moduleRouter);
router.use('/gender', genderRouter);
router.use('/category', categoryRouter);
router.use('/service', serviceRouter);
router.use('/faq', faqRouter);
router.use('/banner', bannerRouter);
router.use('/package', packageRouter);
router.use('/company', companyRouter);
router.use('/billing-card', billingCardRouter);
router.use('/company-service', companyServiceRouter);
router.use('/favourite', favouriteRouter);
router.use('/company-review', companyReviewRouter);


router.get('/connection_check', (req, res) => {

    try {

        // This is for Pool connect
        connectionDeAutoMYSQL.getConnection(function (err, connection) {
            if (err) {
                // connection.release();
                return res.send({
                    "message": "Connection create fail",
                    "error": err,
                    "api v": 1
                });
            }

            connection.release();
            return res.send({
                "message": "Connection create success ",
                "api v": 1,
                "precess": connectionDeAutoMYSQL._acquiringConnections.length,
                "length": connectionDeAutoMYSQL._allConnections.length
            });
        });

        // This is for  connect
        // connectionDeAutoMYSQL.connect(function (err) {
        //     if (err) {
        //         return res.send({
        //             "message": "Connection create fail",
        //             "error": err,
        //             "api v": 1
        //         });
        //     }

        //     // console.log(connectionDeAutoMYSQL.destroy())

        //     return res.send({
        //         "message": "Connection create success",
        //         "api v": 1
        //     });
        // });


    } catch (error) {
        return res.status(400)
            .send({
                "status": 404,
                "message": "Connection create fail try",
                "api v": 1,
                "error": error
            });
    }
});


module.exports = router;