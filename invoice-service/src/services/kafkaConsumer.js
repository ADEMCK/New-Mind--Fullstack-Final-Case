const { Kafka } = require('kafkajs');
const Invoice = require('../models/Invoice');
const { produceMessage } = require('./kafkaProducer');

const kafka = new Kafka({
  clientId: 'invoice-service',
  brokers: [process.env.KAFKA_BROKERS]
});

const consumer = kafka.consumer({ groupId: 'invoice-service-group' });

const startConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'payment_completed', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const paymentData = JSON.parse(message.value.toString());
      
      try {
        // Create invoice from payment data
        const invoice = new Invoice({
          paymentId: paymentData.paymentId,
          orderId: paymentData.orderId,
          userId: paymentData.userId,
          amount: paymentData.amount
        });

        await invoice.save();

        // Produce message for invoice created
        await produceMessage('invoice_created', {
          invoiceId: invoice._id,
          invoiceNumber: invoice.invoiceNumber,
          orderId: invoice.orderId,
          timestamp: new Date()
        });

      } catch (error) {
        console.error('Error processing payment message:', error);
      }
    }
  });
};

module.exports = { startConsumer };