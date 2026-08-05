import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    // Frontend is served separately (e.g. Hostinger shared hosting).
    // Just return 404 for non-API routes instead of crashing the server.
    console.warn(`[static] dist/public not found at ${distPath} — skipping static file serving`);
    app.use("*", (_req, res) => {
      res.status(404).json({ message: "Not found" });
    });
    return;
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
