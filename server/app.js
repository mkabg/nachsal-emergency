
import express from "express";
import cors from "cors";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import logger from "./middleware/logger.js";
import errorHandler from "./middleware/errorHandler.js";
import { configRoutes } from "./routes/configRoutes.js";

import { decodeUserFromToken } from "./middleware/auth.js";
config();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use((req, res, next) => {
  console.log("Incoming request origin:", req.headers.origin);
  next();
});
app.use(logger);
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:5173", "http://localhost:5174", "https://n-achsal-emergency-test.netlify.app", "https://nachsal-emergency.netlify.app", "https://nachsal-1.netlify.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(cookieParser());

// Decode user from token on every request
app.use(decodeUserFromToken);

// Quick health check
app.get("/healthz", (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// Mount all routers
configRoutes(app);

// ✅ Route map debug (temporary)
app.get("/__routes", (req, res) => {
  try {
    // Minimal route dumper (Express 5 friendly)
    const routes = [];
    const stack = app._router?.stack ?? [];
    for (const layer of stack) {
      if (layer?.route) {
        const methods = Object.keys(layer.route.methods || {}).map(m => m.toUpperCase());
        routes.push({ path: layer.route.path, methods });
      } else if (layer?.name === "router" && layer?.handle?.stack) {
        const prefix = layer.regexp?.fast_star || layer.regexp?.fast_slash ? "" :
          (layer.regexp?.toString().replace(/^\/\\\^\\\//, "/").replace(/\\\/\?\(\?=\\\/\|\$\)\/i$/, "") || "");
        for (const rl of layer.handle.stack) {
          if (rl?.route) {
            const methods = Object.keys(rl.route.methods || {}).map(m => m.toUpperCase());
            routes.push({ path: `${prefix}${rl.route.path}`, methods });
          }
        }
      }
    }
    return res.json({ ok: true, routes });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

// 404 handler
app.use((req, res) => res.status(404).json({ ok: false, error: { code: "NOT_FOUND", path: req.originalUrl }}));

// Error handler (last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});
