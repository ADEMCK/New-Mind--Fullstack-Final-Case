const Product = require('../models/Product');
const redis = require('../config/redis');

const productController = {
  // Create new product
  createProduct: async (req, res) => {
    try {
      const product = new Product({
        ...req.body,
        createdBy: req.user._id
      });
      await product.save();
      
      // Clear category cache when new product is added
      await redis.del(`products:category:${product.category}`);
      
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get all products with pagination and filtering
  getProducts: async (req, res) => {
    try {
      const { category, page = 1, limit = 10 } = req.query;
      let query = {};

      if (category) {
        // Try to get from cache first
        const cachedProducts = await redis.get(`products:category:${category}`);
        if (cachedProducts) {
          return res.json(JSON.parse(cachedProducts));
        }
        query.category = category;
      }

      const products = await Product.find(query)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      const count = await Product.countDocuments(query);

      // Cache category results
      if (category) {
        await redis.set(
          `products:category:${category}`,
          JSON.stringify({
            products,
            totalPages: Math.ceil(count / limit),
            currentPage: page
          }),
          'EX',
          3600
        );
      }

      res.json({
        products,
        totalPages: Math.ceil(count / limit),
        currentPage: page
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get single product
  getProduct: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Try to get from cache first
      const cachedProduct = await redis.get(`product:${id}`);
      if (cachedProduct) {
        return res.json(JSON.parse(cachedProduct));
      }

      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Cache product
      await redis.set(`product:${id}`, JSON.stringify(product), 'EX', 3600);

      res.json(product);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update product
  updateProduct: async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'description', 'price', 'stock', 'category', 'images'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates' });
    }

    try {
      const product = await Product.findOne({
        _id: req.params.id,
        createdBy: req.user._id
      });

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      updates.forEach(update => product[update] = req.body[update]);
      await product.save();

      // Update cache
      await redis.set(`product:${product._id}`, JSON.stringify(product), 'EX', 3600);
      await redis.del(`products:category:${product.category}`);

      res.json(product);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Delete product
  deleteProduct: async (req, res) => {
    try {
      const product = await Product.findOneAndDelete({
        _id: req.params.id,
        createdBy: req.user._id
      });

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Clear cache
      await redis.del(`product:${req.params.id}`);
      await redis.del(`products:category:${product.category}`);

      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = productController;