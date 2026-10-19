// src/controllers/productController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Get All Products
exports.getAllProducts = async (req, res) => {
  try {
    const allProducts = await prisma.product.findMany();
    res.status(200).json(allProducts);
  } catch (error) {
    console.error("Couldn't load products:", error);
    res.status(500).json({ error: "Failed to load products." });
  }
};

// 2. Create Product
exports.createProduct = async (req, res) => {
  const { name, description, price, stockQuantity } = req.body;
  try {
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stockQuantity: parseInt(stockQuantity),
      }
    });
    res.status(201).json(product);
  } catch (error) {
    console.error("Failed to register product:", error);
    res.status(500).json({ error: "Failed to add product." });
  }
};

// 3. Update Product
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, stockQuantity } = req.body;
  try {
    const updateProduct = await prisma.product.update({
      where: { id: parseInt(id, 10) },
      data: {
        name,
        description,
        price: price ? parseFloat(price) : undefined,
        stockQuantity: stockQuantity ? parseInt(stockQuantity, 10) : undefined
      }
    });
    res.status(200).json(updateProduct);
  } catch (error) {
    console.error("Database update failed:", error);
    res.status(500).json({ error: "Failed to update product records." });
  }
};

// 4. Delete Product
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  const productId = parseInt(id, 10);

  if (isNaN(productId)) {
    return res.status(400).json({ error: "Invalid product ID format." });
  }

  try {
    const deleted = await prisma.product.delete({
      where: { id: productId }
    });
    res.status(200).json({ message: "Product deleted", deleted });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Product not found." });
    }
    res.status(500).json({ error: "Failed to delete the product." });
  }
};
