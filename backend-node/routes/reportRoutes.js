const express = require("express");
const reportController = require("../controllers/reportController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/", authenticate, authorize("admin"), asyncHandler(reportController.getReports));

router.get("/by-type/:type", authenticate, authorize("admin"), asyncHandler(reportController.getReportsByType));
router.patch("/:id/status", authenticate, authorize("admin"), asyncHandler(reportController.updateReportStatus));

router.post("/", authenticate, asyncHandler(reportController.createReport)); // Users can create reports
module.exports = router;