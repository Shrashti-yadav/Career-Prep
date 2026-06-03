import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";

// const protect = asyncHandler(async (req, res, next) => {
//   let token;

//   const authHeader = req.headers.authorization;

//   // 1. CHECK HEADER FIRST
//   if (authHeader && authHeader.startsWith("Bearer ")) {
//     try {
//       token = authHeader.split(" ")[1];

//       // 2. VERIFY TOKEN
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       // 3. GET USER
//       req.user = await User.findById(decoded.id).select("-password");

//       if (!req.user) {
//         res.status(401);
//         throw new Error("User not found");
//       }

//       next();
//     } catch (error) {
//       console.error("JWT Error:", error.message);
//       res.status(401);
//       throw new Error("Not authorized, token failed");
//     }
//   } else {
//     res.status(401);
//     throw new Error("Not authorized, no token");
//   }
// });

const protect = asyncHandler(async (req, res, next) => {
    let token;

    // 1. Check if header exists first
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select("-password");

            if (!req.user) {
                return res.status(401).json({ message: "User not found" });
            }

            next();
        } catch (error) {
            console.error("JWT Error:", error);
            return res.status(401).json({ message: "Not authorized, token failed" });
        }
    } else {
        return res.status(401).json({ message: "No token provided" });
    }
});

export { protect };