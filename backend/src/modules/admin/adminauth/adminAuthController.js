import jwt from "jsonwebtoken";

/**
 * ADMIN LOGIN
 *
 * Admin credentials are stored in .env.
 * No admin record is created in the database.
 */
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Compare credentials with .env
    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials",
      });
    }

    // Create admin JWT
    const token = jwt.sign(
      {
        role: "ADMIN",
        email: process.env.ADMIN_EMAIL,
        admin: true,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // Store JWT in cookie
    // authMiddleware reads req.cookies.token
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
    });
  } catch (error) {
    console.error("Admin login error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/**
 * ADMIN LOGOUT
 */
export const adminLogout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Admin logout successful",
    });
  } catch (error) {
    console.error("Admin logout error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/**
 * CURRENT ADMIN
 */
export const getAdminMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      admin: {
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error) {
    console.error("Get admin profile error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};