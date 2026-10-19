// src/controllers/transactionController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createTransaction = async (req, res) => {
  const { productId, quantity, type } = req.body;
  const userId = req.user.id; 

  try {
    const targetedProduct = await prisma.product.findUnique({
      where: { id: parseInt(productId, 10) }
    });

    if (!targetedProduct) {
      return res.status(404).json({ error: "Product not found inside warehouse database." });
    }

    let newStockLevel = targetedProduct.stockQuantity;

    if (type === "BUY") {
      newStockLevel = targetedProduct.stockQuantity + parseInt(quantity, 10);
    } else if (type === "SELL") {
      if (parseInt(quantity, 10) > targetedProduct.stockQuantity) {
        return res.status(400).json({ error: "Insufficient stock available!" });
      }
      newStockLevel = targetedProduct.stockQuantity - parseInt(quantity, 10);
    }

    // Run database adjustments
    await prisma.product.update({
      where: { id: parseInt(productId, 10) },
      data: { stockQuantity: newStockLevel }
    });

    const newTransaction = await prisma.transaction.create({
      data: {
        quantity: parseInt(quantity, 10),
        type: type, 
        userId: userId,
        productId: parseInt(productId, 10)
      }
    });

    res.status(200).json({ message: "The process was successfully done.", newTransaction });

  } catch (error) {
    console.error("Transaction operational failure:", error);
    res.status(500).json({ error: "Internal transaction failure." });
  }
};
