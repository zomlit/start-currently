import { validateBackendEnv } from "@currently/shared";

export const env = validateBackendEnv(process.env);
