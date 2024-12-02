import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true, // Ensures username is unique
      lowercase: true, // Converts username to lowercase
      trim: true, 
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8, // Ensures password has at least 8 characters
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

const userModel = mongoose.model("User", userSchema);

export default userModel;
