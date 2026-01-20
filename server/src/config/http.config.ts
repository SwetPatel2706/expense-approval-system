// server/src/config/http.config.ts

export const httpConfig = {
  apiPrefix: "/api",
  bodyLimit: "1mb",
  requestTimeoutMs: 10_000,
  cors: {
    origin: "*",  // later restrict per env
    credentials: true,
  },
};
