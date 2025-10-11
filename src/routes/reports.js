import express from "express";
import Report from "../models/Report.js";
import User from "../models/User.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

//users need to be logged in in order to make requests
router.use(requireAuth);

//get report based on reporterId
router.get("/reporterId/:reporterId", async (req, res) => {
  try {
    const reportByReporter = await Report.find({ reporterId: req.params.reporterId });

    if (!reportByReporter || reportByReporter.length === 0) {
      return res.status(404).json({ message: "No reports found for this reporter." });
    }

    res.status(200).json(reportByReporter);
  } catch (error) {
    console.error("Error in getting report by reporter:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

//get report based on agent barangay
router.get("/agent/:agentId", async (req, res) => {
  try {
    const agent = await User.findById(req.params.agentId);
    if (!agent || agent.role !== "agent") {
      return res
        .status(403)
        .json({ message: "You're not authorized to access this" });
    }
    const report = await Report.find({
      barangayComplainant: agent.barangayComplainant,
    });
    res.status(200).json(report);
  } catch (error) {
    console.error("Error in getting a report", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

//get all report
router.get("/", async (req, res) => {
  try {
    const reports = await Report.find();
    res.status(200).json(reports);
  } catch (error) {
    console.error("Error in getting all reports", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

//get a report by id
router.get("/:id", async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report)
      return res.status(404).json({ message: "Report does not exist" });
    res.status(200).json(report);
  } catch (error) {
    console.error("Error in getting a reports", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

//create a report
router.post("/", async (req, res) => {
  try {
    const {
      name,
      reporterId,
      city,
      barangayComplainant,
      barangayIncident,
      location,
      reporterType,
      incidentType,
      evidence,
    } = req.body;
    const newReport = new Report({
      name,
      reporterId,
      city,
      barangayComplainant,
      barangayIncident,
      location,
      reporterType,
      incidentType,
      evidence,
    });
    const savedReport = await newReport.save();
    res.status(201).json(savedReport);
  } catch (error) {
    console.error("Error in posting new report", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

//update a report by id
router.put("/:id", async (req, res) => {
  try {
    const {
      name,
      reporterId,
      city,
      barangayComplainant,
      barangayIncident,
      location,
      reporterType,
      incidentType,
      evidence,
    } = req.body;
    const updatedReport = await Report.findByIdAndUpdate(
      req.params.id,
      {
        name,
        reporterId,
        city,
        barangayComplainant,
        barangayIncident,
        location,
        reporterType,
        incidentType,
        evidence,
      },
      {
        new: true,
      }
    );
    if (!updatedReport)
      return res
        .status(404)
        .json({ message: "Report not found, updating failed" });
    res.status(201).json(updatedReport);
  } catch (error) {
    console.error("Error in updating a report", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

//delete report by id
router.delete("/:id", async (req, res) => {
  try {
    const deleteReport = await Report.findByIdAndDelete(req.params.id);
    if (!deleteReport)
      return res
        .status(404)
        .json({ message: "Report not found, deletion failed" });
    res.status(200).json({ message: "successfully deleted" });
  } catch (error) {
    console.error("Error in deleting  a report", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

export default router;
