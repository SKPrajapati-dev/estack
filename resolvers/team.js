const { requiresTeamOwnerAccess } = require("../middlewares/permissions");

const Query = {
  async getTeam(_parent, { teamId }, { isAuth, models  }){
    if(!isAuth){
      return {
        ok: false,
        errors: [{ path: 'authentication', message: 'Not authorized'}]
      }
    }
    const team = await models.Team.findOne({ where: { id: teamId }});
    return {
      ok: true,
      team
    }
  },

  async getTeamMembers(_parent, { teamId }, { isAuth, models }){
    if(!isAuth){
      throw new Error("Not Authorized");
    }
    const teamMembers = await models.TeamMember.findAll({
      where: {
        teamId
      },
      include: {
        model: models.User,
        as: 'member'
      }
    });
    let response = [];
    for(var i = 0;i < teamMembers.length; ++i){
      let newObj = {
        id: teamMembers[i].member.id,
        username: teamMembers[i].member.username,
        email: teamMembers[i].member.email,
        isOnline: teamMembers[i].member.isOnline
      }
      response.push(newObj);
    }

    return response;
  }
}

const Mutation = {
  async createTeam(_parent, { name }, { isAuth, userId, models }){
    if(!isAuth){
      return {
        ok: false,
        errors: [{ path: 'auth', message: 'Not Authorized'}]
      }
    }
    try{
      const newTeam = await models.Team.create({
        teamName: name,
        ownerId: userId
      });

      await models.Channel.create({
        channelName: 'general',
        public: true,
        teamId: newTeam.id
      });
      
      await models.TeamMember.create({
        memberId: userId,
        teamId: newTeam.id
      });

      return {
        ok: true,
        team: newTeam
      }
    }catch(err) {
      console.log(err);
      return {
        ok: false,
        errors: [{ path: 'insertion_error', message: 'Error while adding Team'}]
      }
    } 
  },

  //Adding Multiple members to the team
  async addTeamMembers(_parent, { emails, teamId }, { isAuth, userId, models }){
    if(!isAuth){
      return {
        ok: false,
        errors: [{ path: 'auth', message: 'Not Authorized'}]
      }
    }
    try{
      const checkTeamOwner = await models.Team.findOne({
        attributes: ['ownerId'],
        where: {
          id: teamId,
          ownerId: userId
        }
      });

      if(checkTeamOwner ==  null){
        return {
          ok: false,
          errors: [{ path: 'authorization', message: 'you are not owner of this team'}]
        }
      }
      const usersByEmail = await models.User.findAll({
        where: {
          email: emails
        }
      });

      let teamMembersArray = usersByEmail.map(item => {
        return {
          memberId: item.id,
          teamId
        }
      });

      await models.TeamMember.bulkCreate(teamMembersArray);
      return {
        ok: true
      }
    }catch(err){
      console.log(err);
      return {
        ok: false,
        errors: [{ path: 'database_error', message: 'Cannot add memebers to team'}]
      }
    }
  },

  //Adding single member to the team
  async addTeamMember(_parent, { email, teamId }, { isAuth, userId, models }){
    if(!isAuth){
      return {
        ok: false,
        errors: [{ path: 'auth', message: 'Not Authorized'}]
      }
    }
    try {
      const checkTeamOwnerPromise = models.Team.findOne({
        attributes: ['ownerId'],
        where: {
          id: teamId,
          ownerId: userId
        }
      });
      const checkUserExistsPromise = models.User.findOne({ where: { email }});
      const [checkTeamOwner, checkUserExists] = await Promise.all([checkTeamOwnerPromise, checkUserExistsPromise]);

      if(checkTeamOwner ==  null){
        return {
          ok: false,
          errors: [{ path: 'authorization', message: 'you are not owner of this team'}]
        }
      }
      if(!checkUserExists){
        return {
          ok: false,
          errors: [{ path: 'email', message: 'Could not find user with this email'}]
        }
      }
      await models.TeamMember.create({
        memberId: checkUserExists.id,
        teamId
      });
      return {
        ok: true,
      }
    }catch(err) {
      console.log(err);
      return {
        ok: false,
        errors: [{ path: 'database_error', message: 'Cannot add memeber to team'}]
      }
    }
  },

  //Deleting a team
  deleteTeam: requiresTeamOwnerAccess.createResolver(async (_parent, { teamId }, { models }) => {
    try{
      const team = await models.Team.findOne({ where: { id: teamId }});
      const channels = await models.Channel.findAll({ where: { teamId }});
      const channelIds = channels.map(channel => channel.id);
      await models.Message.destroy({
        where: {
          channelId: channelIds
        }
      });
      await models.Channel.destroy({
        where: {
          id: channelIds
        }
      });
      await models.TeamMember.destroy({
        where: {
          teamId
        }
      });
      await team.destroy();
      return true;
    }catch(err) {
      console.log(err);
      return false;
    }
  })
}

const Team = {
  async channels(parent, _args, { models }){
    const channels = await models.Channel.findAll({
      where: {
        teamId: parent.id
      }
    });
    return channels;
  }
}

module.exports = { Query, Mutation, Team }