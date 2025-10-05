import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    dob: { type: Date, required: true },
    city: { type: String, required: true },
    barangayComplainant: { type: String, required: true },
    contact_num: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 8 },
    role: {
      type: String,
      required: true,
      enum: ["user", "agent"],
      default: "user",
    },
    valid_id: {
      type: [
        {
          fileType: { type: String, default: "image" },
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

userSchema.statics.signup = async function (
  name,
  dob,
  city,
  barangayComplainant,
  role,
  valid_id,
  contact_num,
  password
) {
  if (!contact_num || !password) {
    throw Error("All fields must be filled!");
  }

  if (
    !validator.isMobilePhone(contact_num, "en-PH") ||
    contact_num.length > 13
  ) {
    throw Error("Contact number is not valid!");
  }

  if (!validator.isStrongPassword(password)) {
    throw Error("Password is not strong enough!");
  }

  const exists = await this.findOne({ contact_num });

  if (exists) {
    throw Error("Contact number already registered");
  }

  //salt = random str added to the password before hashing, adding extra layer of protection
  const salt = await bcrypt.genSalt(10); //default value
  const hash = await bcrypt.hash(password, salt); //hashing the password

  const user = await this.create({
    name,
    dob,
    city,
    barangayComplainant,
    role,
    valid_id,
    contact_num,
    password: hash,
  }); //creating the doc

  return user;
};

const User = mongoose.model("User", userSchema);

export default User;
