const express = require('express');
const mongoose = require('mongoose');
const { startConsumer } = require('./services/kafkaConsumer');
const invoiceController = require('./controllers/invoiceController');

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.get('/invoices/:id', invoiceController.getInvoice);
app.get('/invoices/:id/download', invoiceController.downloadInvoice);

startConsumer();

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Invoice service running on port ${PORT}`);
});