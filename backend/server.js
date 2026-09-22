const express = require("express");
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
app.use(express.json());

const cors = require('cors');
app.use(cors()); // This allows React app to safely talk to your API


const PORT = process.env.PORT || 3000;


app.post( '/users', async (req, res) => {
    const { name, email, passwordHash} = req.body;

    try {
        const newUser = await prisma.user.create({
            data: {
                name: name,
                email: email,
                passwordHash: passwordHash
            }
        });
        res.status(201).json(newUser);
    }catch (error) {
        res.status(500).json({ error: "failed to creat user :("});
    }
});


// Fetch all users from the database
app.get('/users', async (req, res) => {
  try {
    // Tell Prisma to pull every record out of the User table
    const users = await prisma.user.findMany({
      include: {
        posts: true, // This automatically pulls in any posts written by each user!
      },
    });

    // Send the list of users back to the client as JSON
    res.json(users);
  } catch (error) {
    // If the database fails, let the client know
    res.status(500).json({ error: "Could not retrieve users." });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
