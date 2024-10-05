import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

import User from '@models/user';
import { connectToDB } from '@utils/database';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session }) {
      // Store the user id from MongoDB to session
      const sessionUser = await User.findOne({ email: session.user.email });
      session.user.id = sessionUser._id.toString();

      return session;
    },
    async signIn({ account, profile, user, credentials }) {
      try {
        await connectToDB();

        // Check if user already exists based on email
        const userExists = await User.findOne({ email: profile.email });

        // If the user doesn't exist, create a new one
        if (!userExists) {
          // Generate a valid username
          let generatedUsername = profile.name.replace(/\s+/g, '').toLowerCase();

          // Ensure username is at least 8 characters
          if (generatedUsername.length < 8) {
            generatedUsername += Math.random().toString(36).substring(2, 8); // Append random alphanumeric string
          }

          // Trim username if it exceeds 20 characters
          generatedUsername = generatedUsername.substring(0, 20);

          // Check if the generated username already exists
          let isUsernameTaken = await User.findOne({ username: generatedUsername });
          while (isUsernameTaken) {
            // If username exists, add a random number suffix to make it unique
            generatedUsername = generatedUsername.substring(0, 15) + Math.random().toString(36).substring(2, 5);
            isUsernameTaken = await User.findOne({ username: generatedUsername });
          }

          // Save the new user in the database
          await User.create({
            email: profile.email,
            username: generatedUsername,
            image: profile.picture,
          });
        }

        return true;
      } catch (error) {
        // Log the error for debugging
        console.error("Error during sign-in: ", error);
        return false;
      }
    },
  },
});

export { handler as GET, handler as POST };
