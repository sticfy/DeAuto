const isEmpty = require("is-empty");
const opencage = require('opencage-api-client');

require('dotenv').config();


let getLocationInfoByLatLng = async (latitude = null, longitude = null, language = 'en') => {
    return new Promise(async (resolve, reject) => {
        // 22.6855, 90.6439

        if (latitude > 90 || latitude < -90) return resolve({ "success": false, 'message': "invalid latitude" });
        if (longitude > 180 || latitude < -180) return resolve({ "success": false, 'message': "invalid longitude" });

        let finalData = {
            latitude, longitude,
            city: null,
            town: null,
            county: null,
            state_district: null,
            state: null,
            country: null,
            upazilla: null,
            district: null,
            division: null,
            language,
            formatted: ""
        }


        opencage.geocode({ q: `${latitude}, ${longitude}`, language: language })
            .then((data) => {

                if (data.status.code === 200 && data.results.length > 0) {
                    const place = data.results[0];

                    // console.log(place.formatted);
                    // console.log(place.components.road);
                    // console.log(place.annotations.timezone.name);

                    // console.log("Town : " + place.components.town);
                    // console.log("City : " + place.components.city);
                    // console.log("County : " + place.components.county);
                    // console.log("State : " + place.components.state);
                    // console.log("Country : " + place.components.country);

                    if (!isEmpty(place.components.town) || !isEmpty(place.components.city))
                        finalData.city = finalData.town = finalData.upazilla = place.components.town ?? place.components.city;

                    if (!isEmpty(place.components.county)) finalData.county = place.components.county;
                    if (!isEmpty(place.components.state_district)) {
                        try { place.components.state_district = ((place.components.state_district.split("District"))[0].split("district"))[0].trim(); } catch (error) { }
                        finalData.state_district = finalData.district = place.components.state_district;
                    }

                    if (!isEmpty(place.components.state)) finalData.state = finalData.division = place.components.state;
                    if (!isEmpty(place.components.country)) finalData.country = place.components.country;
                    if (!isEmpty(place.formatted)) finalData.formatted = place.formatted;

                    if (finalData.city == null && finalData.town == null && finalData.county != null) {
                        let tempCity = finalData.county.split(" Upazila");
                        tempCity = tempCity[0].split(" upazila");
                        finalData.city = finalData.town = tempCity[0];
                    }

                    finalData.components = place.components;

                    return resolve({ "success": true, "message": "", data: finalData });

                } else {

                    return resolve({ "success": false, "message": error.message });

                    // console.log('status', data.status.message);
                    // console.log('total_results', data.total_results);
                }
            })
            .catch((error) => {
                console.log('error', error.message);
                if (error.status.code === 402) {
                    console.log('hit free trial daily limit');
                    console.log('become a customer: https://opencagedata.com/pricing');
                }

                return resolve({ "success": false, "message": error.message });

            });

    })
};


module.exports = {
    getLocationInfoByLatLng
};