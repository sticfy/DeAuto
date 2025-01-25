
// MySQL database configuration
// const dbConfig = {
//     host: 'localhost',    // Your MySQL server host
//     user: 'root',         // Your MySQL username
//     password: '123456', // Your MySQL password
//     database: 'mtl_drchashi' // Your database name
// };

const dbConfig = {
    host: "51.20.247.13",
    user: "root",
    password: "Root#321@",
    database: "de_auto"
};

const mysql = require('mysql');
const fs = require('fs'); // Import the File System module


// Create a MySQL connection pool
const pool = mysql.createPool(dbConfig);

async function getTablesAndColumns() {
    const executeQuery = (query, params) => {
        return new Promise((resolve, reject) => {
            pool.query(query, params, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    };

    try {
        // Query to get all tables in the database
        const tables = await executeQuery(
            `SELECT TABLE_NAME 
             FROM INFORMATION_SCHEMA.TABLES 
             WHERE TABLE_SCHEMA = ?`,
            [dbConfig.database]
        );

        const response = [];

        // Fetch column details for each table
        for (const table of tables) {
            const tableName = table.TABLE_NAME;

            const columns = await executeQuery(
                `SELECT COLUMN_NAME, DATA_TYPE 
                 FROM INFORMATION_SCHEMA.COLUMNS 
                 WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
                [dbConfig.database, tableName]
            );

            // Prepare the "property" array
            const properties = columns.map(col => ({
                name: col.COLUMN_NAME, type: col.DATA_TYPE === 'json' ? 'JSON' : col.DATA_TYPE // Check if the type is JSON
            }));

            // Add the table and its properties to the response
            response.push({ name: tableName, property: properties });
        }

        // Write the response to a JSON file
        const filePath = './tables_and_columns.json';
        fs.writeFileSync(filePath, JSON.stringify(response, null, 2), 'utf8');
        console.log(`Response saved to ${filePath}`);

        return response;
    } catch (err) {
        console.error('Error fetching table data:', err);
    } finally {
        // End the pool gracefully
        pool.end();
    }
}

// Run the function
getTablesAndColumns();
