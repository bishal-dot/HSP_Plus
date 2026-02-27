'use server';

import sql from 'mssql';

// ======================
// Interfaces
// ======================

export interface DbParameter {
  name: string;
  type: sql.ISqlType;
  value: any;
}

// ======================
// Connection Configuration
// ======================

const defaultConfig: sql.config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433', 10),
  database: process.env.DB_NAME,
  options: {
    encrypt: (process.env.DB_ENCRYPT || 'false').toLowerCase() === 'true',
    trustServerCertificate: (process.env.DB_TRUST_CERT || 'false').toLowerCase() === 'true',
  },
};


// ======================
// Connection Pool Management
// ======================

let defaultPool: Promise<sql.ConnectionPool> | null = null;

function getDefaultPool(): Promise<sql.ConnectionPool> {
  if (!defaultPool) {
    defaultPool = new sql.ConnectionPool(defaultConfig)
      .connect()
      .catch(err => {
        defaultPool = null;
        console.error('Database connection failed', err);
        throw new Error('Database connection failed');
      });
  }
  return defaultPool;
}

const dynamicPools = new Map<string, Promise<sql.ConnectionPool>>();


function getDynamicPool(connectionString: string): Promise<sql.ConnectionPool> {
  if (!dynamicPools.has(connectionString)) {
    const config = parseConnectionString(connectionString);
    const pool = new sql.ConnectionPool(config)
      .connect()
      .catch(err => {
        dynamicPools.delete(connectionString);
        console.error('Dynamic database connection failed', err);
        throw new Error('Dynamic database connection failed');
      });
    dynamicPools.set(connectionString, pool);
  }
  return dynamicPools.get(connectionString)!;
}

// ======================
// Core Execution Function
// ======================
async function callStoredProcedure(
  storedProcedure: string,
  parameters: DbParameter[] | undefined,
  poolPromise: Promise<sql.ConnectionPool>,
  returnType: 'recordset' | 'recordsets' | 'rowsaffected' | 'value' | 'raw' = 'recordset'
) {
  try {
    const pool = await poolPromise;
    const request = pool.request();

    parameters?.forEach(param => request.input(param.name, param.type, param.value));

    const result = await request.execute(storedProcedure);

    switch (returnType) {
      case 'recordset': return result.recordset;
      case 'recordsets': return result.recordsets;
      case 'rowsaffected': return result.rowsAffected.reduce((sum, count) => sum + count, 0);
      case 'value': return result.returnValue;
      case 'raw': return result;
      default: return result.recordset;
    }
  } catch (err) {
    console.error(`Stored procedure execution failed: ${storedProcedure}`, err);
    throw err;
  }
}


// ======================
// Public Helper Functions (Default DB)
// ======================

export async function GetAsync<T>(
  storedProcedure: string,
  parameters?: DbParameter[]
): Promise<T[]> {
  return (await callStoredProcedure(storedProcedure, parameters, getDefaultPool(), 'recordset')) as T[];
}

export async function GetSingleAsync<T>(
  storedProcedure: string,
  parameters?: DbParameter[]
): Promise<T | null> {
  const result = await callStoredProcedure(storedProcedure, parameters, getDefaultPool(), 'recordset');
  return (Array.isArray(result) && result.length > 0) ? result[0] : null;
}

export async function ExecuteAsync(
  storedProcedure: string,
  parameters?: DbParameter[]
): Promise<number> {
  return await callStoredProcedure(storedProcedure, parameters, getDefaultPool(), 'rowsaffected');
}

export async function ExecuteScalarAsync<T>(
  storedProcedure: string,
  parameters?: DbParameter[]
): Promise<T | null> {
  const result = await callStoredProcedure(storedProcedure, parameters, getDefaultPool(), 'recordset');
  if (!Array.isArray(result) || result.length === 0) return null;
  const firstRow = result[0];
  const firstValue = firstRow ? Object.values(firstRow)[0] : null;
  return firstValue as T | null;
}

export async function GetAsDataTableAsync(
  storedProcedure: string,
  parameters?: DbParameter[]
): Promise<any[]> {
  return await callStoredProcedure(storedProcedure, parameters, getDefaultPool(), 'recordset');
}

export async function GetAsJsonAsync(
  storedProcedure: string,
  parameters?: DbParameter[]
): Promise<string> {
  const data = await callStoredProcedure(storedProcedure, parameters, getDefaultPool(), 'recordset');
  return JSON.stringify(data);
}

export async function GetAsObjectAsync(
  storedProcedure: string,
  parameters?: DbParameter[]
): Promise<any> {
  const data = await callStoredProcedure(storedProcedure, parameters, getDefaultPool(), 'recordset');
  return Array.isArray(data) ? data : { data };
}

// ======================
// Dynamic Connection Helper
// ======================

export async function QueryDefault<T>(sqlQuery:string,
  parameters?: DbParameter[]
): Promise<T[]> {
  const pool = await getDefaultPool();
  const request = pool.request();

  parameters?.forEach(param => {
    request.input(param.name, param.type, param.value);
  });

  const result = await request.query(sqlQuery);
  return result.recordset as T[];
}

export async function Con_QueryAsync<T>(
  connectionString: string,
  sqlQuery: string,
  parameters?: DbParameter[]
): Promise<T[]> {
  const pool = getDynamicPool(connectionString);
  const conn = await pool;
  const request = conn.request();

  if (parameters) {
    parameters.forEach(param => {
      request.input(param.name, param.type, param.value);
    });
  }

  const result = await request.query(sqlQuery);
  return result.recordset as T[];
}

export async function Con_GetAsync<T>(
  connectionString: string,
  storedProcedure: string,
  parameters?: DbParameter[]
): Promise<T[]> {
  const pool = getDynamicPool(connectionString);
  return (await callStoredProcedure(storedProcedure, parameters, pool, 'recordset')) as T[];
}

export async function Con_GetSingleAsync<T>(
  connectionString: string,
  storedProcedure: string,
  parameters?: DbParameter[]
): Promise<T | null> {
  const pool = getDynamicPool(connectionString);
  const result = await callStoredProcedure(storedProcedure, parameters, pool, 'recordset');
  return (Array.isArray(result) && result.length > 0) ? result[0] : null;
}

export async function Con_ExecuteAsync(
  connectionString: string,
  storedProcedure: string,
  parameters?: DbParameter[]
): Promise<number> {
  const pool = getDynamicPool(connectionString);
  return await callStoredProcedure(storedProcedure, parameters, pool, 'rowsaffected');
}

export async function Con_ExecuteScalarAsync<T>(
  connectionString: string,
  storedProcedure: string,
  parameters?: DbParameter[]
): Promise<T | null> {
  const pool = getDynamicPool(connectionString);
  const result = await callStoredProcedure(storedProcedure, parameters, pool, 'recordset');
  if (!Array.isArray(result) || result.length === 0) return null;
  const firstRow = result[0];
  const firstValue = firstRow ? Object.values(firstRow)[0] : null;
  return firstValue as T | null;
}

export async function Con_GetAsDataTableAsync(
  connectionString: string,
  storedProcedure: string,
  parameters?: DbParameter[]
): Promise<any[]> {
  const pool = getDynamicPool(connectionString);
  return await callStoredProcedure(storedProcedure, parameters, pool, 'recordset');
}

export async function Con_GetAsJsonAsync(
  connectionString: string,
  storedProcedure: string,
  parameters?: DbParameter[]
): Promise<string> {
  const pool = getDynamicPool(connectionString);
  const data = await callStoredProcedure(storedProcedure, parameters, pool, 'recordset');
  return JSON.stringify(data);
}

export async function Con_GetAsObjectAsync(
  connectionString: string,
  storedProcedure: string,
  parameters?: DbParameter[]
): Promise<any> {
  const pool = getDynamicPool(connectionString);
  const data = await callStoredProcedure(storedProcedure, parameters, pool, 'recordset');
  return Array.isArray(data) ? data : { data };
}

// ======================
// Connection String Parser
// ======================
function parseConnectionString(connectionString: string): sql.config {
  const parts: Record<string, string> = {};
  
  // Parse key-value pairs
  connectionString
    .split(';')
    .map(part => part.trim())
    .filter(part => part.length > 0)
    .forEach(part => {
      const eqIndex = part.indexOf('=');
      if (eqIndex > 0) {
        const key = part.substring(0, eqIndex).trim().toLowerCase();
        const value = part.substring(eqIndex + 1).trim();
        parts[key] = value;
      }
    });

  let server = 'localhost';
  let port: number | undefined = 1433;
  let instanceName: string | undefined;

  if (parts.server) {
    const serverVal = parts.server.replace(/\\\\/g, '\\');

    if (serverVal.includes('\\')) {
      const [host, instance] = serverVal.split('\\', 2);
      server = host;
      instanceName = instance || undefined;
      port = undefined;
    }
    else if (serverVal.includes(',')) {
      const [host, portStr] = serverVal.split(',', 2);
      server = host;
      port = portStr ? parseInt(portStr.trim(), 10) : 1433;
    }
    else {
      server = serverVal;
    }
  }

  if (parts.port) {
    port = parseInt(parts.port, 10);
    instanceName = undefined;
  }

  return {
    user: parts['user id'] || parts.userid || parts.user || '',
    password: parts.password || '',
    server,
    ...(port !== undefined ? { port } : {}),
    ...(instanceName ? { instanceName } : {}),
    database: parts.database || '',
    options: {
      encrypt: (parts.encrypt || 'false').toLowerCase() === 'true',
      trustServerCertificate: (parts.trustservercertificate || 'false').toLowerCase() === 'true',
    },
  };
}