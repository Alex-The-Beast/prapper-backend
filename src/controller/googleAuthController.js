import User from "../schema/userSchema.js";
import { generateToken } from "../utils/generateToken.js";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";

const client = new OAuth2Client(process.env.CLIENT_ID);

export const googleAuth = (req, res) => {
  const url =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${process.env.CLIENT_ID}` +
    `&redirect_uri=${process.env.REDIRECT_URI}` +
    `&response_type=code` +
    `&scope=openid email profile`;

  console.log(url + "from url get req.....................");
  res.redirect(url);
};

export const googleCallback = async (req, res) => {
  try {
    const code = req.query.code;
    //exchange code
    const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
      code,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      redirect_uri: process.env.REDIRECT_URI,
      grant_type: "authorization_code",
    });
    console.log(
      tokenRes,
      "________________________________________________________________________",
    );

    const { id_token } = tokenRes.data;

    //verify id token
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.CLIENT_ID,
    });

    const googleUser = ticket.getPayload();
    console.log(googleUser, "From google callback");

    //creating user in db
    let user = await User.findOne({ providerID: googleUser.sub });

    if (!user) {
      user = await User.create({
        name: googleUser.name,
        email: googleUser.email,
        profile: googleUser.picture,
        providerID: googleUser.sub,
      });
    } else {
      user.lastLoggedIN = new Date();
      await user.save();
    }

    //jwt token
    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      // secure:false,
      secure: true,
      // sameSite:"lax",
      sameSite: "none",
      domain: ".kyzron.com",
    });

    //redirect now for developement only
    //  res.redirect("http://localhost:5173/dashboard");
    res.redirect("https://prappers.pages.dev/dashboard");
  } catch (error) {
    console.log(error + "Error from google callback controller");
    // res.redirect("http://localhost:5173/login");
    res.redirect("https://prappers.pages.dev/login");
  }
};

export const getMe = async (req, res) => {
  const user = await User.findById(req.user.userId);
  res.json(user);
};

// export const logOut=(req,res)=>{
//    res.clearCookie("token")
//    res.json({message:"Logged out successfully"})
// }

export const logOut = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    domain: ".kyzron.com",
    expires: new Date(0), // 🔥 ensures deletion
  });

  res.json({ message: "Logged out successfully" });
};