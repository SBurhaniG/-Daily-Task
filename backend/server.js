const express = require("express");
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
app.use(express.json());

const cors = require('cors');
app.use(cors()); // This allows React app to safely talk to your API


const PORT = process.env.PORT || 3000;

// create new user
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
        res.status(500).json({ error: "failed to create user :("});
    }
});

// user with post
app.post('/users/with-post', async ( req, res ) => {
  const { name, email, passwordHash, postTitle} = req.body;

  try {
    const UserWithPost = await prisma.user.create({
          data: {
      name: name,
      email: email,
      passwordHash, passwordHash,
      post: {
        create: [
          { title: postTitle}
        ]
      }
    },
    include: {
      post: true
    }
  });

  res.status(201).json(UserWithPost);
  
  }catch( error ) {
    console.log(error);
    res.status(500).json({ error: "failed to create user with nested post :("});
  }
})

//updating a suser 

app.put('/users/:id', async (req,res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: id},
      data: {
        name: name,
        email: email
      }
    });
    res.json(updatedUser);
  }catch(error) {
    res.status(500).json({ error: "failed to update the user :("});
  }
});

// delete user 

app.delete('/users/:id', async ( req, res) => {
  const { id } = req.params;

  try {
    await prisma.user.delete({
      where: { id: id}
    });
    res.status(201).json({ message: "user was successfully deleted :)"});
  }catch(error) {
    res.status(500).json({ error: "failed to delete user :("});
  }
});


// Fetch all users from the database
app.get('/users', async (req, res) => {
  try {
    // Tell Prisma to pull every record out of the User table
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,

        post: {
          select: {
            id: true,
            title: true
          }
        }
      }
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
