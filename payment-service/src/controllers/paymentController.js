const Payment = require('../models/Payment');
const { produceMessage } = require('../services/kafkaProducer');

const paymentController = {
  processPayment: async (req, res) => {
    try {
      const { orderId, userId, amount, paymentMethod, paymentDetails } = req.body;

      // Create payment record
      const payment = new Payment({
        orderId,
        userId,
        amount,
        paymentMethod,
        paymentDetails
      });

      // Simulate payment processing
      const isPaymentSuccessful = await simulatePaymentProcess(paymentDetails);

      if (isPaymentSuccessful) {
        payment.status = 'completed';
        await payment.save();

        // Produce Kafka message for successful payment
        await produceMessage('payment_completed', {
          paymentId: payment._id,
          orderId,
          userId,
          amount,
          timestamp: new Date()
        });

        res.json({
          success: true,
          payment
        });
      } else {
        payment.status = 'failed';
        await payment.save();
        res.status(400).json({
          success: false,
          error: 'Payment processing failed'
        });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getPaymentStatus: async (req, res) => {
    try {
      const payment = await Payment.findOne({ orderId: req.params.orderId });
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }
      res.json(payment);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

// Simulate payment processing
const simulatePaymentProcess = async (paymentDetails) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate 90% success rate
      resolve(Math.random() < 0.9);
    }, 1000);
  });
};

module.exports = paymentController;