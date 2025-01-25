const input = []

const getJsonFields = (fields) => {
    return fields
        .filter(field => field.type === 'json' || field.type == 'JSON' || field.type === 'longtext') // Filter fields with type "json"
        .map(field => field.name); // Extract the "name" of the filtered fields
};

const jsonFields = getJsonFields(input);

console.log(jsonFields);


console.log("Done generate");

// https://www.text-utils.com/json-formatter/    ->  JSON formatter