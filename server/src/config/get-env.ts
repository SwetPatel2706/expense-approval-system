//server\src\config\get-env.ts

export function getEnv(key: string): string {
    const value = process.env[key];
  
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  
    return value;
}

// later might move to server\src\util\get-env.ts