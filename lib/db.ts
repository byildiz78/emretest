import sql from 'mssql';

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER || '',
    database: process.env.DB_NAME,
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
};

export async function executeQuery<T>(query: string, params?: any): Promise<T[]> {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('date1', sql.DateTime, params?.date1)
            .input('date2', sql.DateTime, params?.date2)
            .input('branches', sql.VarChar, params?.branches)
            .query(query);
        await pool.close();
        return result.recordset;
    } catch (error) {
        console.error('Database error:', error);
        throw error;
    }
}
