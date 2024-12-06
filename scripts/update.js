const fs = require('fs').promises;
const path = require('path');
const sql = require('mssql');

// SQL Server configuration
const config = {
    server: '213.159.0.179',
    port: 1281,
    database: 'pfTavukDunyasi',
    user: 'burhan',    // Kullanıcı adını buraya girin
    password: 'kereviz1!', // Şifreyi buraya girin
    options: {
        trustServerCertificate: true
    }
};


async function processReportFile(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        const fileName = path.basename(filePath);
        const reportId = fileName.replace('Report', '').replace('.txt', '');
        
        // Connect to database
        const pool = await sql.connect(config);
        
        // Prepare and execute the update query
        const request = pool.request();
        request.input('reportQuery', sql.NVarChar, content);
        request.input('ReportID', sql.Int, parseInt(reportId));
        
        const result = await request.query('UPDATE dm_infiniaWebReports SET ReportQuery=@reportQuery WHERE ReportID=@ReportID');
        
        console.log(`Updated report ${reportId} successfully`);
        return result;
    } catch (err) {
        console.error(`Error processing file ${filePath}:`, err);
        throw err;
    }
}

async function main() {
    try {
        const testFolder = path.join(__dirname, 'test');
        const files = await fs.readdir(testFolder);
        
        const reportFiles = files.filter(file => file.match(/^Report.*\.txt$/));
        
        for (const file of reportFiles) {
            const filePath = path.join(testFolder, file);
            await processReportFile(filePath);
        }
        
        console.log('All reports processed successfully');
        process.exit(0);
    } catch (err) {
        console.error('Error in main process:', err);
        process.exit(1);
    }
}

main();