import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  email: {
    type: String,
    unique: [true, 'Email already exists!'],
    required: [true, 'Email is required!'],
  },
  username: {
    type: String,
    required: [true, 'Username is required!'],
      // Ensure the username is unique
    // Simplified regex: It should only contain alphanumeric characters and be between 8 to 20 characters long
    match: [/^[a-zA-Z0-9]{8,20}$/, "Username invalid, it should contain 8-20 alphanumeric letters and be unique!"],
  },
  image: {
    type: String,
  }
});

// Avoid recompiling the model if it already exists
const User = models.User || model("User", UserSchema);

export default User;
