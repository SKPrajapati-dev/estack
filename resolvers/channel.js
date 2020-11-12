const Mutation = {
  async createChannel(_parent, { teamId, name, public }, { isAuth, userId, models }){
    if(!isAuth){
      return {
        ok: false,
        errors: [{ path: 'auth', message: 'Not Authenticated, Please Login First'}]
      }
    }
    const isAdmin = await models.Team.findOne({
      attributes: ['ownerId'],
      where: {
        id: teamId
      }
    });
    if(isAdmin.ownerId != userId){
      return {
        ok: false,
        errors: [{ path: 'admin_privileges', message: 'You have to be the Owner of this Team to create new Channels'}]
      }
    }
    const newChannel = await models.Channel.create({
      channelName: name,
      public,
      teamId
    });

    return {
      ok: true,
      channel: newChannel
    }
  }
}

module.exports = { Mutation }