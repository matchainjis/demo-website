# matchid-sandbox-demo

A demo chat Dapp showing how to integrate MatchID into your web application.

## Requirements

- Node.js v20 or higher
- Docker (for MongoDB)
- Git

## Setup

1. **Clone the Repository**

   ```bash
   git clone git@github.com:matchainjis/demo-website.git
   cd demo-website
   ```

2. **Setup Front-End**

   ```bash
   cd front-end
   yarn install
   ```

3. **Configure Front-End Environment**

   Modify the `.env` file in the `front-end` directory and add your MatchID AppID:
   ```bash
   REACT_APP_MATCHID_APP_ID=your_app_id_here
   ```

4. **Start Front-End**
   
   ```bash
   npm run start
   ```

5. **Start MongoDB using Docker**

   In a new terminal, run:
   ```bash
   docker run -d -p 27017:27017 --name matchid-mongo mongo:latest
   ```

6. **Setup Back-End**

   In a new terminal:
   ```bash
   cd back-end
   yarn install
   ```

7. **Configure Back-End Environment**

   Modify the `.env` file in the `back-end` directory and add:
   ```bash
   MONGO_URL=mongodb://localhost:27017/matchid-demo
   ```

8. **Start Back-End**
   
   ```bash
   npm run start
   ```

9. **Explore and enjoy your Dapp!**

## Demo Screenshots

![Home Page](./111.png)
![Sign Up / Sign In](./222.png)
![OTP](./333.png)
![Set Avatar](./444.png)
![Chat Box](./555.png)
![Chat](./666.png)