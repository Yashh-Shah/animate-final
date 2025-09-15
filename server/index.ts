import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  analyze,
  batchAnalyze,
  getSamples,
  getIncidents,
  reportScam,
} from "./routes/fraud";
import multer from "multer";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Fraud detection mock APIs
  app.get("/api/fraud/samples", getSamples);
  app.get("/api/fraud/incidents", getIncidents);
  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });
  app.post("/api/fraud/analyze", upload.single("file"), analyze);
  app.post("/api/fraud/analyze-batch", batchAnalyze);

  app.post("/api/fraud/report-scam", reportScam);

  return app;
}
