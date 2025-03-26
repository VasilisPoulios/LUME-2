# Node.js Express API with MongoDB

A RESTful API built with Node.js, Express, and MongoDB.

## Features

- Express & MongoDB setup
- Environment variables with dotenv
- JWT Authentication
- File uploads with Multer
- Error handling middleware
- Async/await
- Stripe integration

## Usage

### Environment Variables

Create a `.env` file in the root and add the following:

```
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
```

### Install Dependencies

```
npm install
```

### Run

```
# Run in development mode
npm run dev

# Run in production mode
npm start
``` 