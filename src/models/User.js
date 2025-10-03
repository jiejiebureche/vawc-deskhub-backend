import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    dob: { type: Date, required: true },
    city: { type: String, required: true },
    barangayComplainant: { type: String, required: true },
    contact_num: { type: String, required: true },
    password: { type: String, required: true, minlength: 8 },
    role: {type:String, required: true, enum: ["user", "agent"], default: "user"},
    valid_id: {
      type: [
        {
          fileType: { type: String, enum: ["image"], default: "image" },
          url: { type: String, required: true },
        },
      ],
      validate: {
        validator: function (arr) {
          return arr.length > 0; // must have at least one item
        },
        message: "At least one valid ID is required.",
      },
      required: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
