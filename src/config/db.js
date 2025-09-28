import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB CONNECTED SUCCESSFULLY");
  } catch (error) {
    console.error("error connecting to mongodb", error);
    process.exit(1) //exit with failure
  }
};
