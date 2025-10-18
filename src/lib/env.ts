/**
 * Environment variable validation
 * Ensures all required environment variables are present at startup
 */

const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
] as const;

const optionalEnvVars = [
  'VITE_GOOGLE_CLIENT_ID',
  'VITE_GOOGLE_CLIENT_SECRET',
  'VITE_GOOGLE_REDIRECT_URI',
  'VITE_ANTHROPIC_API_KEY',
] as const;

export function validateEnv(): void {
  const missing = requiredEnvVars.filter(
    (key) => !import.meta.env[key]
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.join('\n')}\n\n` +
      'Please create a .env.local file based on .env.example'
    );
  }

  // Log optional missing vars as warnings
  const missingOptional = optionalEnvVars.filter(
    (key) => !import.meta.env[key]
  );

  if (missingOptional.length > 0) {
    console.warn(
      'Optional environment variables not set:',
      missingOptional.join(', ')
    );
  }
}

export function getEnv(key: string): string {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}
