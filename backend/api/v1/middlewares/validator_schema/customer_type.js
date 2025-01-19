const Joi = require('joi');


const schema = Joi.object({
    title: Joi.string()
    .min(1)
    .max(50)
    .pattern(/^[^0-9]/, 'not starting with a number') // Ensure the title doesn't start with a number
    .pattern(/^[^!@#$%^&*(),.?":{}|<>]/, 'not starting with a special character') // Ensure the title doesn't start with a special character
    .pattern(/^(\S)(?!.*\s).*$/, 'cannot start or contain spaces') // Ensure the title does not start with a space and does not contain any spaces
});

module.exports = {
    schema
}