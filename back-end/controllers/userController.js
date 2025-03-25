const User = require("../model/userModel");
const bcrypt = require("bcrypt");

module.exports.register = async (req, res, next) => {
   try {
      const { username, email, password } = req.body;
      const usernameCheck = await User.findOne({ username });
      if (usernameCheck) return res.json({ msg: "Username already used", status: false });

      const emailCheck = await User.findOne({ email });
      if (emailCheck) return res.json({ msg: "Email already used", status: false });

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
         email,
         username,
         password: hashedPassword,
      });
      delete user.password;
      return res.json({ status: true, user });
   } catch (ex) {
      next(ex);
   }
};

module.exports.registerOrFindUser = async (req, res, next) => {
   try {
      const { address, username, email, theWalletAddress } = req.body;

      let user = await User.findOne({ address, username });

      if (!user) {
         user = await User.create({
            address,
            username,
            email,  // Optional: Only if available from MatchID
            theWalletAddress,
            isAvatarImageSet: false,
            avatarImage: "",
         });
         console.log("✅ New user registered in MongoDB:", user);
      } else {
         console.log("🔹 User already exists in MongoDB:", user);
      }

      return res.status(200).json(user);
   } catch (error) {
      console.error("❌ Error checking/registering user:", error);
      res.status(500).json({ message: "Something went wrong" });
      next(error);
   }
};

module.exports.login = async (req, res, next) => {
   try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      if (!user) return res.json({ msg: "Incorrect username or password", status: false });

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) return res.json({ msg: "Incorrect username or password", status: false });

      delete user.password; // Remove password from the user object before sending it
      return res.json({ status: true, user });
   } catch (ex) {
      next(ex);
   }
};

module.exports.setAvatar = async (req, res, next) => {
   try {
      console.log("Incoming setAvatar request...");
      console.log("Params ID:", req.params.id);
      console.log("Body:", req.body);

      const { avatarImage } = req.body;

      if (!avatarImage) {
         return res.status(400).json({ msg: "Avatar image is required." });
      }

      const { id } = req.params; // id = "address_username_email"
      const [address, username, email] = id.split("_");

      console.log("Parsed address:", address);
      console.log("Parsed username:", username);
      console.log("Parsed email:", email);

      let user = await User.findOne({ address, username });

      if (!user) {
         // ✅ If user exists by email but not by address+username, find by email
         user = await User.findOne({ email });
         if (user) {
            // ✅ If found by email, update the missing address+username
            user.theWalletAddress = address;
            user.username = username;
         } else {
            // ✅ Otherwise, create a new user
            user = new User({
               address,
               username,
               email,
               theWalletAddress: address, // ✅ Fix added
               isAvatarImageSet: true,
               avatarImage: req.body.avatarImage, // Set the avatar immediately
            });
         }
      }
      // ✅ Always update avatar image & isAvatarImageSet
      user.avatarImage = avatarImage;
      user.isAvatarImageSet = true;
      await user.save(); // Save changes

      // const userData = await User.findByIdAndUpdate(
      //    id,
      //    {
      //       isAvatarImageSet: true,
      //       avatarImage,
      //    },
      //    { new: true }
      // );

      // if (!userData) {
      //    return res.status(404).json({ msg: "User not found." });
      // }

      // return res.status(200).json({
      //    isSet: userData.isAvatarImageSet,
      //    image: userData.avatarImage,
      // });

      return res.status(200).json({
         isSet: user.isAvatarImageSet,
         image: user.avatarImage,
      });
   } catch (ex) {
      next(ex);
   }
};

module.exports.getAllUsers = async (req, res, next) => {
   try {
      const users = await User.find({ address: { $ne: req.params.address } }).select([
         "email",
         "username",
         "avatarImage",
         "_id",
      ]);
      return res.json(users);
   } catch (ex) {
      next(ex);
   }
};
