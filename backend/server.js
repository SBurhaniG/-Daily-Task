require('dotenv').config();
const express = require("express");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient, Role } = require('@prisma/client');
const authenticateToken = require("./middleware/authenticateToken");

const app = express();
const prisma = new PrismaClient();
app.use(express.json());

const cors = require('cors');
app.use(cors()); // This allows React app to safely talk to your API


const PORT = process.env.PORT || 3000;

// creating product
app.post('/products', async (req, res) => {
  const {name , description, price, stockQuantity} = req.body;

  try {
    const product = await prisma.product.create({

      data: {
      name: name,
      description: description,
      price: parseFloat(price),
      stockQuantity: parseInt(stockQuantity),
    }
    })

    res.status(201).json(product);
  } catch (error) {
    console.log(" failed to register product" + error);
    res.status(500).json({ error: "internal server: failed to add product", error})
  }
});

// getting products  info
app.get('/products', async (req, res) => {
  try {
    const allProducts = await prisma.product.findMany()

    res.status(200).json(allProducts);
  }catch(error) {
    console.log(" 404 error: couldn't load the products")
    res.status(404).json({ error: "internal server: failed to load products", error});
  }
});

// update products
app.put('/products/:id', async (req, res) => {
  const {id}  = req.params;
  const {name , description, price, stockQuantity} = req.body;
  try {
    const updateProduct = await prisma.product.update({
      where: {
        id: parseInt(id)
      }, data: {
        name: name,
        description: description,
        price: price?  parseFloat(price): undefined,
        stockQuantity: stockQuantity? parseInt(stockQuantity, 10): undefined
      }
    });
    res.status(200).json(updateProduct);
  }catch(error) {
    console.error("Database update failed:", error);
    res.status(500).json({ error: "Failed to update product records." });
  }
});

// deleting products
app.delete('/products/:id', async (req, res) => {
  const {id} = req.params;

  try {
    const deleteProduct = await prisma.product.delete({
      where: {id: parseInt(id)}
    })
    res.status(200).json({deleteProduct});
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Product not found in the database." });
    }

    console.log("Database delete failed ", error);
    res.status(500).json({ error: "failed to delete the product ."})
  }
});

// the transaction part 
app.post('/transactions',authenticateToken, async (req, res) => {
  const { productId, quantity, type } = req.body;
  const userId = req.user.id; 

  try {

    const targetedProduct = await prisma.product.findUnique({
      where: { id: parseInt(productId) }});

    if (!targetedProduct) {
      return res.status(404).json({ error: "Product not found inside warehouse database." });
    }

    let newStockLevel = targetedProduct.stockQuantity;

    if (type === "BUY") {
      newStockLevel = targetedProduct.stockQuantity + parseInt(quantity);
    } else if (type === "SELL") {
      if(parseInt(quantity) > targetedProduct.stockQuantity) {
        console.log("we can't afford that .");
        return res.status(400).json({ error: "Insufficient stock available!" });
      }
      newStockLevel = targetedProduct.stockQuantity - parseInt(quantity);
    }
    await prisma.product.update({
      where: { id: parseInt(productId) },
      data: { stockQuantity: newStockLevel }
    });

    await prisma.transaction.create({
      data: {
        quantity: parseInt(quantity),
        type: type, 
        userId: userId,
        productId: parseInt(productId)
      }
  });


    res.status(200).json({ message: "the process was successfully done."})

  } catch (error) {
    console.error("Transaction operational failure:", error);
    res.status(500).json({ error: "Internal transaction failure." });
  }
});

// JWT TOKEN
app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "user with this email already exist. please try another email.",
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
    return res.status(500).json({
      error: "failed server to create new User",
      details: error.message,
    });
  }
});

// LOGIN ROUTE
app.post('/login', async (req, res) => {
  const {email, password} = req.body;

  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email
      }
    })
    if (!existingUser) {
      return res.status(400).json({ error: "Invalid email or password." });
    };

    if (!await bcrypt.compare(password, existingUser.passwordHash)) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign(
      {id: existingUser.id, email: existingUser.email, role: existingUser.role},
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    )

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
    res.status(500).json({
      error: "failed to log in server problem: ",
      details: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
