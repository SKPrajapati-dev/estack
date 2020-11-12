const jwt = require('jsonwebtoken');

const User = {
  async teams(_parent, _args, { userId, isAuth, models }){
    if(!isAuth){
      return "Not Authorized"
    }
    const memberTeams = await models.TeamMember.findAll({
      where: {
        memberId: userId
      },
      include: {
        model: models.Team,
        as: 'team'
      }
    });
    let response = [];
    for(var i = 0; i < memberTeams.length; ++i) {
      let newObj = {
        id: memberTeams[i].team.id,
        teamName: memberTeams[i].team.teamName,
        ownerId: memberTeams[i].team.ownerId
      }
      response.push(newObj);
    }
    return response;
  }
}

const Query = {
  getAllUsers(_parent, _args, { models }){
    return models.User.findAll();
  },

  async me(_parent, _args, { userId, isAuth, models }){
    if(!isAuth){
      return {
        ok: false,
        errors: [{ path: 'authentication', message: 'Not Authorized'}]
      }
    }
    const user = await models.User.findOne({ where: { id: userId }});
    return {
      ok: true,
      user,
    }
  }
  
}

const Mutation = {
  async register(_parent, args, { models }){
    try{
      const user = await models.User.create(args);
      return {
        ok: true,
        user,
      };
    }catch(err) {
      return {
        ok: false,
        errors: [{ path: 'register failed', message: 'Something went wrong!'}]
      }
    }
  },

  async login(_parent, { user : { email, password }}, { models }){
    const mUser = await models.User.findOne({ where: { email }});
    if(!mUser){
      return {
        ok: false,
        errors: [{ path: 'email', message: 'Wrong Email' }],
      };
    }
    if(mUser.password !== password){
      return {
        ok: false,
        errors: [{ path: 'password', message: 'Wrong Password' }],
      };
    }
    await mUser.update({
      isOnline: true
    });

    const token = jwt.sign({ uid: mUser.id }, process.env.JWT_SECRET_KEY, { expiresIn: '7d'});
    return {
      ok: true,
      token
    };
  },

  async logout(_parent, _args, { userId, models }){
    const user = await models.User.findOne({ where: { id: userId }});
    await user.update({ isOnline: false });
    return "User Logged out successfully"
  }
}

module.exports = { Query, Mutation, User };