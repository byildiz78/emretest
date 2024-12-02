import sql, { config as SQLConfig, ConnectionPool } from 'mssql';

export const sqlConfig: SQLConfig = {
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    server: process.env.DB_SERVER || '',
    port: parseInt(process.env.DB_PORT || '1433'),
    database: process.env.DB_NAME || '',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
    },
};

class DatabaseConnection {
    private static instance: DatabaseConnection;
    private pool: ConnectionPool | null = null;
    private connecting: Promise<ConnectionPool> | null = null;

    private constructor() {}

    public static getInstance(): DatabaseConnection {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }

    public async getConnection(): Promise<ConnectionPool> {
        try {
            if (this.pool?.connected) {
                return this.pool;
            }

            if (this.connecting) {
                return await this.connecting;
            }
            this.connecting = sql.connect(sqlConfig);
            this.pool = await this.connecting;
            this.connecting = null;

            this.pool.on('error', (err) => {
                console.error('SQL Pool Error:', err);
                this.pool = null;
            });

            return this.pool;
        } catch (error) {
            console.error('Database connection error:', error);
            this.pool = null;
            this.connecting = null;
            throw error;
        }
    }

    public async closeConnection(): Promise<void> {
        try {
            if (this.pool) {
                await this.pool.close();
                this.pool = null;
            }
        } catch (error) {
            console.error('Error closing connection:', error);
            throw error;
        }
    }
}

export const dbConnection = DatabaseConnection.getInstance();

export async function executeQuery<T>(query: string, params?: Record<string, any>): Promise<T[]> {
    try {
        const pool = await dbConnection.getConnection();
        const request = pool.request();

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    if (value instanceof Date) {
                        request.input(key, sql.DateTime, value);
                    } else if (typeof value === 'number') {
                        request.input(key, sql.Int, value);
                    } else {
                        request.input(key, value);
                    }
                }
            });
        }

        const result = await request.query(query);
        return result.recordset;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

export async function executeSingleQuery<T>(query: string, params?: Record<string, any>): Promise<T | null> {
    const results = await executeQuery<T>(query, params);
    return results.length > 0 ? results[0] : null;
}

export async function cleanup(): Promise<void> {
    await dbConnection.closeConnection();
}
