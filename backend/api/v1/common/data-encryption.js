var fs = require("fs");
const isEmpty = require("is-empty");
const moment = require("moment");
const jwt = require("jsonwebtoken");

const crypto = require("crypto");

require("dotenv").config();

const commonObject = require('../common/common');


// Load the secret key from environment variables
let secretKey = process.env.SECRET_KEY;
const ivLength = 16; // For AES, this is always 16 bytes


// Generate a random initialization vector
const generateIV = () => crypto.randomBytes(ivLength);

const algorithm = "aes-256-cbc";

// Encrypt function
let encryptData = async (text) => {
    const iv = generateIV();
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
};

// Decrypt function
let decryptData = async (encryptedText) => {
    const textParts = encryptedText.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedTextBuffer = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey), iv);
    let decrypted = decipher.update(encryptedTextBuffer);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};


// const encryptedData = {
//     name: encryptData("2342 4234 3233 2424")
// };

// console.log('Encrypted Data:', encryptedData);

// const decryptedData = {
//     name: decryptData( '8f542daff3e71ea1ca31e8d58d38d26e:13567a1e8cdf59c08210776e963904a8e35ecd315e08d85aceae91f0aa0a7ac7')
// };

// console.log('Decrypted Data:', decryptedData);

// Example usage
// const userData = {
//     name: "John Doe",
//     phone: "1234567890",
//     email: "john.doe@example.com"
// };

// // Encrypt user data
// const encryptedData = {
//     name: encryptData("2342423432332424"),
//     phone: encryptData(userData.phone),
//     email: encryptData(userData.email)
// };

// console.log('Encrypted Data:', encryptedData);

// // Decrypt user data
// const decryptedData = {
//     name: decryptData(encryptedData.name),
//     phone: decryptData(encryptedData.phone),
//     email: decryptData(encryptedData.email)
// };

// console.log('Decrypted Data:', decryptedData);




module.exports = {
    encryptData,
    decryptData,
}
