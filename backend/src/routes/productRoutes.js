// src/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { body, validationResult } = require('express-validator');

// 1. Validation Rules Array
const validateProduct = [
  body('name').trim().notEmpty().withMessage('Product name is required.').escape(),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number.'),
  body('stockQuantity').isInt({ min: 0 }).withMessage('Stock must be a positive integer.')
];

// 2. Main Validator Check Middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next(); 
};

// 3. Map Endpoints cleanly
router.get('/', productController.getAllProducts);
router.post('/', validateProduct, handleValidationErrors, productController.createProduct);
router.put('/:id', validateProduct, handleValidationErrors, productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
