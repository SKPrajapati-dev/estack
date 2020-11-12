require('dotenv').config();
const express = require('express');
const http = require('http');
const models = require('./models');
const bodyParser = require('body-parser');
const { fileLoader, mergeTypes, mergeResolvers } = require('merge-graphql-schemas');
const { ApolloServer, gql } = require('apollo-server-express');
const path = require('path');
const cors = require('cors');
const authMiddleware = require('./middlewares/authMiddleware');
const pubsub = require('./pubsub');
const { verify } = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// Graphql Schemas
const typeDefs = mergeTypes(fileLoader(path.join(__dirname, './schemas')));
const resolvers = mergeResolvers(fileLoader(path.join(__dirname, './resolvers')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(authMiddleware);

//  ApolloServer
const apolloServer = new ApolloServer({
  typeDefs: gql`
    ${typeDefs}
  `,
  resolvers,
  context: ({ req, connection }) => {
    if(connection){
      if(connection.context.token){
        const user = verify(connection.context.token, process.env.JWT_SECRET_KEY);
        if(user){
          return {
            userId: user.uid,
            isAuth: true,
            pubsub,
            models
          }
        }
      }else{
        return {
          isAuth: false,
        }
      }
    }
    const userId = req.userId || null;
    const isAuth = req.isAuth;
    return { userId, isAuth, pubsub, models };
  },
  subscriptions: {
    onConnect: (connectionParams) => {
      if(connectionParams.token){
        console.log(`New Websocket connection with ${connectionParams.token} token`);
        return {
          token: connectionParams.token
        }
      }
    }
  }
});
apolloServer.applyMiddleware({ app });

// http Server
const httpServer = http.createServer(app);

// websocket
apolloServer.installSubscriptionHandlers(httpServer);

models.sequelize.sync().then(() => {
  console.log('Connected to Database Successfully');
  httpServer.listen(PORT, () => {
    console.log(`Server Started at port at http://localhost:${PORT}${apolloServer.graphqlPath}`);
    console.log(`Subscriptions ready at at ws://localhost:${PORT}${apolloServer.subscriptionsPath}`)
  });
})