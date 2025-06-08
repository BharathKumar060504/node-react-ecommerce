import express from 'express';
import Product from '../models/productModel.js';
import { isAuth, isAdmin } from '../util.js';

const router = express.Router();

// Get all products with optional filters (category, searchKeyword, sortOrder)
router.get('/', async (req, res) => {
  try {
    const category = req.query.category ? { category: req.query.category } : {};
    const searchKeyword = req.query.searchKeyword
      ? { name: { $regex: req.query.searchKeyword, $options: 'i' } }
      : {};
    const sortOrder =
      req.query.sortOrder === 'lowest'
        ? { price: 1 }
        : req.query.sortOrder === 'highest'
        ? { price: -1 }
        : { _id: -1 };

    const products = await Product.find({ ...category, ...searchKeyword }).sort(sortOrder);
    res.send(products);
  } catch (error) {
    res.status(500).send({ message: 'Error fetching products' });
  }
});

// Get a product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.send(product);
    } else {
      res.status(404).send({ message: 'Product Not Found.' });
    }
  } catch (error) {
    res.status(500).send({ message: 'Error retrieving product.' });
  }
});

// Create a new product (Admin only)
router.post('/', isAuth, isAdmin, async (req, res) => {
  try {
    const product = new Product({
      name: req.body.name,
      price: req.body.price,
      image: req.body.image,
      brand: req.body.brand,
      category: req.body.category,
      countInStock: req.body.countInStock,
      description: req.body.description,
      rating: req.body.rating || 0,
      numReviews: req.body.numReviews || 0,
    });
    const newProduct = await product.save();
    res.status(201).send({ message: 'New Product Created', data: newProduct });
  } catch (error) {
    res.status(500).send({ message: 'Error in Creating Product.' });
  }
});

// Update a product by ID (Admin only)
router.put('/:id', isAuth, isAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      product.name = req.body.name;
      product.price = req.body.price;
      product.image = req.body.image;
      product.brand = req.body.brand;
      product.category = req.body.category;
      product.countInStock = req.body.countInStock;
      product.description = req.body.description;

      const updatedProduct = await product.save();
      res.status(200).send({ message: 'Product Updated', data: updatedProduct });
    } else {
      res.status(404).send({ message: 'Product Not Found.' });
    }
  } catch (error) {
    res.status(500).send({ message: 'Error in Updating Product.' });
  }
});

// Delete a product by ID (Admin only)
router.delete('/:id', isAuth, isAdmin, async (req, res) => {
  try {
    const deletedProduct = await Product.findById(req.params.id);
    if (deletedProduct) {
      await deletedProduct.remove();
      res.send({ message: 'Product Deleted' });
    } else {
      res.status(404).send({ message: 'Product Not Found.' });
    }
  } catch (error) {
    res.status(500).send({ message: 'Error in Deleting Product.' });
  }
});

// Add a review to a product
router.post('/:id/reviews', isAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      const review = {
        name: req.body.name,
        rating: Number(req.body.rating),
        comment: req.body.comment,
      };
      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((a, c) => c.rating + a, 0) / product.numReviews;

      const updatedProduct = await product.save();
      res.status(201).send({
        data: updatedProduct.reviews[updatedProduct.reviews.length - 1],
        message: 'Review saved successfully.',
      });
    } else {
      res.status(404).send({ message: 'Product Not Found.' });
    }
  } catch (error) {
    res.status(500).send({ message: 'Error saving review.' });
  }
});

export default router;
