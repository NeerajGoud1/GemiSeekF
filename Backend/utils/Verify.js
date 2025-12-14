import admin from "firebase-admin";

//this is used to save the user data locally, so that we can access the current user stuff from db and send it to client
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided!" });
    }

    const idToken = authHeader.split(" ")[1];

    const decodedToken = await admin.auth().verifyIdToken(idToken);

    req.userId = decodedToken.uid;

    req.user = decodedToken;

    next();
  } catch (error) {
    console.error("Firebase Auth Error:", error.message);
    return res
      .status(401)
      .json({ message: "Unauthorized: Invalid or expired token!" });
  }
};

// //this is used for protect the routes this is no need 

// const verify = async (req, res) => {
//   console.log("verofy called");
//   const authHeader = req.headers["authorization"];

//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).json({ message: "No token provided!" });
//   }

//   const idToken = authHeader.split(" ")[1];

//   try {
//     const decodedToken = await admin.auth().verifyIdToken(idToken);

//     return res.status(200).json({
//       message: "Token is valid",
//       user: {
//         uid: decodedToken.uid,
//         email: decodedToken.email,
//         emailVerified: decodedToken.email_verified,
//         signInProvider: decodedToken.firebase?.sign_in_provider,
//       },
//     });
//   } catch (error) {
//     console.error("Token verification error:", error.message);
//     return res.status(401).json({ message: "Invalid or expired token!" });
//   }
// };

export {authenticate };
