import type { ZodType } from 'zod';
import { z } from 'zod';

/* --- Logto OIDC configs --- */
export enum LogtoOidcConfigKey {
  PrivateKeys = 'oidc.privateKeys',
  CookieKeys = 'oidc.cookieKeys',
}

export type LogtoOidcConfigType = {
  [LogtoOidcConfigKey.PrivateKeys]: string[];
  [LogtoOidcConfigKey.CookieKeys]: string[];
};

export const logtoOidcConfigGuard: Readonly<{
  [key in LogtoOidcConfigKey]: ZodType<LogtoOidcConfigType[key]>;
}> = Object.freeze({
  [LogtoOidcConfigKey.PrivateKeys]: z.string().array(),
  [LogtoOidcConfigKey.CookieKeys]: z.string().array(),
});

/* --- Logto tenant configs --- */
export const adminConsoleDataGuard = z.object({
  signInExperienceCustomized: z.boolean(),
});

export type AdminConsoleData = z.infer<typeof adminConsoleDataGuard>;

/* --- Logto tenant cloud connection config --- */
export const cloudConnectionDataGuard = z.object({
  appId: z.string(),
  appSecret: z.string(),
  resource: z.string(),
});

export type CloudConnectionData = z.infer<typeof cloudConnectionDataGuard>;

export enum LogtoTenantConfigKey {
  AdminConsole = 'adminConsole',
  CloudConnection = 'cloudConnection',
  /** The URL to redirect when session not found in Sign-in Experience. */
  SessionNotFoundRedirectUrl = 'sessionNotFoundRedirectUrl',
}
export type LogtoTenantConfigType = {
  [LogtoTenantConfigKey.AdminConsole]: AdminConsoleData;
  [LogtoTenantConfigKey.CloudConnection]: CloudConnectionData;
  [LogtoTenantConfigKey.SessionNotFoundRedirectUrl]: { url: string };
};

export const logtoTenantConfigGuard: Readonly<{
  [key in LogtoTenantConfigKey]: ZodType<LogtoTenantConfigType[key]>;
}> = Object.freeze({
  [LogtoTenantConfigKey.AdminConsole]: adminConsoleDataGuard,
  [LogtoTenantConfigKey.CloudConnection]: cloudConnectionDataGuard,
  [LogtoTenantConfigKey.SessionNotFoundRedirectUrl]: z.object({ url: z.string() }),
});

/* --- Summary --- */
export type LogtoConfigKey = LogtoOidcConfigKey | LogtoTenantConfigKey;
export type LogtoConfigType = LogtoOidcConfigType | LogtoTenantConfigType;
export type LogtoConfigGuard = typeof logtoOidcConfigGuard & typeof logtoTenantConfigGuard;

export const logtoConfigKeys: readonly LogtoConfigKey[] = Object.freeze([
  ...Object.values(LogtoOidcConfigKey),
  ...Object.values(LogtoTenantConfigKey),
]);

export const logtoConfigGuards: LogtoConfigGuard = Object.freeze({
  ...logtoOidcConfigGuard,
  ...logtoTenantConfigGuard,
});
