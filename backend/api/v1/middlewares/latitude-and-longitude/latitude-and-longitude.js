var express = require('express');
var router = express.Router();
const isEmpty = require("is-empty");


const locationOpencagedataObject = require('../../common/location/locationFromOpencagedata');
const locationMatchInDBObject = require('../../common/location/locationMatchInDB');


router.use(async function (req, res, next) {
    let latitude = req.headers['latitude'];
    let longitude = req.headers['longitude'];

    if (isEmpty(req.decoded)) req.decoded = { "language": (!isEmpty(req.headers['language']) && ['en', 'bn'].includes(req.headers['language'])) ? req.headers['language'] : 'en' };
    else if (isEmpty(req.decoded.language)) req.decoded.language = (!isEmpty(req.headers['language']) && ['en', 'bn'].includes(req.headers['language'])) ? req.headers['language'] : 'en'


    req.decoded.language = (!isEmpty(req.headers['language']) && ['en', 'bn'].includes(req.headers['language'])) ? req.headers['language'] : 'en';

    if (!(isEmpty(latitude) || isEmpty(longitude))) {
        let locationData = await locationOpencagedataObject.getLocationInfoByLatLng(latitude, longitude);
        req.decoded.location_details = await locationMatchInDBObject.getDivisionUpzillaDetails(locationData.data, req.decoded.language);
    }

    next();

});

module.exports = router;






// req.decoded.location_details = await locationMatchInDBObject.getDivisionUpzillaDetails(
//     {
//         location_string: 'Kachua, Bagerhat, Bangladesh, Asia',
//         latitude: '22.652',
//         longitude: '89.885',
//         city: 'Kachua',
//         town: 'Kachua',
//         county: 'Kachua Upazila (Bagerhat)',
//         state_district: 'Bagerhat',
//         state: 'Khulna Division',
//         country: 'Bangladesh',
//         upazilla: 'Kachua',
//         district: 'Bagerhat',
//         division: 'Khulna Division',
//         language: 'en',
//         formatted: 'unnamed road, Bagerhat District, Kachua -, Bangladesh',
//     }, req.decoded.language);
