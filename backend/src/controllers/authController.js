// src/controllers/authController.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// 1. User Registration Handler
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists. Please try another email.",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashPassword,
      },
    });

    return res.status(201).json({
      message: "User registered successfully.",
      user: newUser,
    });
  } catch (error) {
    next(error);
  }
};

// 2. User Login Handler
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!existingUser) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const isPasswordValid = await bcrypt.compare(password, existingUser.passwordHash);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign(
      { id: existingUser.id, email: existingUser.email, role: existingUser.role },
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      message: "Logged in successfully",
      token: token,
      user: {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        role: existingUser.role
      }
    });
  } catch (error) {
    next(error);
  }
};
