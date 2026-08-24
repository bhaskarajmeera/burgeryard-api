require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { conMongoDb } = require('./config/mongodbConfig');
const userRouter = require('./routers/userRouter');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Burger Yard API is running',
    endpoints: ['/api/v1/signup', '/api/v1/login', '/api/v1/me', '/api/v1/checkout'],
  });
});

app.use('/api/v1', userRouter);

conMongoDb();

app.listen(PORT, (error) => {
  if (error) {
    console.log(error);
    return;
  }

  console.log(`Server running at http://localhost:${PORT}`);
});