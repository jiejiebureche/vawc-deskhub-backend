import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    reporterId: { type: String, required: true },
    city: { type: String, required: true },
    description: { type: String, required: true },
    barangayComplainant: { type: String, required: true },
    barangayIncident: { type: String, required: true },
    reporterType: {
      type: String,
      required: true,
      enum: ["victim", "witness"],
    },
    incidentType: {
      type: String,
      required: true,
      enum: [
        "Physical Abuse",
        "Verbal Abuse",
        "Sexual Harassment",
        "Child Abuse",
      ],
    },
    location: { type: String, required: false },
    status: {
      type: String,
      required: true,
      enum: ["unopened", "opened", "pending", "resolved"],
      default: "unopened",
    },
    evidence: [
      {
        fileType: { type: String, enum: ["image", "video"], required: true }, // classify type
        url: { type: String, required: true }, // where the file is stored
      },
    ],
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", reportSchema);

export default Report;
