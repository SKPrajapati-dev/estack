const { withFilter } = require('apollo-server-express');
const NEW_CHANNEL_MESSAGE = 'NEW_CHANNEL_MESSAGE';
const { requiresTeamAccess } = require('../middlewares/permissions');

const Query = {
  async getChannelMessages(_parent, { channelId }, { isAuth, models }){
    if(isAuth){
      return models.Message.findAll({
        where: {
          channelId,
        },
        order: [['createdAt', 'ASC']]
      }, { raw: true });
    }
  }
}

const Mutation = {
  async createMessage(_parent, { channelId, text, file }, { isAuth, userId, pubsub, models }){
    if(!isAuth){
      return false;
    }
    try {
      const newMsg = await models.Message.create({
        text,
        userId,
        channelId
      });
      if(file){
        console.log(file);
      }
      pubsub.publish(NEW_CHANNEL_MESSAGE, {
        channelId: channelId,
        newChannelMessage: {
          id: newMsg.id,
          text: newMsg.text,
          createdAt: newMsg.createdAt,
          userId: newMsg.userId
        }
      })

      return true;
    }catch(err){
      console.error(err);
      return false;
    }
  }
}

const Subscription = {
  newChannelMessage: {
    subscribe: requiresTeamAccess.createResolver(withFilter(
        (parent, args , { pubsub }) => pubsub.asyncIterator(NEW_CHANNEL_MESSAGE),
        (payload, variables) => payload.channelId === variables.channelId
      ))
  }
}

const Message = {
  sender(parent, _args, { models }){
    return models.User.findOne({ where: { id: parent.userId }})
  }
}

module.exports = { Query, Mutation, Subscription, Message };