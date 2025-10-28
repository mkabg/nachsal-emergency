import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { createReport, getDirectSoldiersWithReports, getSoldierDetails, isAlertOn, SendNachsal } from "../ctrl/reportCtrl.js";

const report = express.Router();

// All routes in this file require a valid token
report.use(requireAuth);

report.get("/send_nachsal", SendNachsal);
report.get("/:personalNumber", getDirectSoldiersWithReports);
report.get("/alert_on/:personalNumber", isAlertOn);
report.get("/soldierDetails/:personalNumber", getSoldierDetails);
report.post("/add_report/:personalNumber", createReport)

export default report;
