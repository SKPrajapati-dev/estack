const createResolver = (resolver) => {
	const baseResolver = resolver;
	baseResolver.createResolver = (childResolver) => {
		const newResolver = async (parent, args, context, info) => {
			await resolver(parent, args, context, info);
			return childResolver(parent, args, context, info);
		};
		return createResolver(newResolver);
	};
	return baseResolver;
}

// TeamAccess
const requiresTeamAccess = createResolver(async (_parent, { channelId }, { isAuth, userId, models }) => {
	if(!isAuth){
		throw new Error("Not Authenticated");
	}
	//check if member of the team
	const channel = await models.Channel.findOne({ where: { id: channelId }});
	const member = await models.TeamMember.findOne({
		where: {
			teamId: channel.teamId,
			memberId: userId
		}
	});
	if(!member){
		throw new Error("You have to be member of the team to subscribe its messages");
	}
});

const requiresTeamOwnerAccess = createResolver(async (_parent, { teamId }, { isAuth, userId, models }) => {
	if(!isAuth){
		throw new Error("Not Authenticated");
	}
	//check if user is owner of the team
	const team = await models.Team.findOne({ where: { id: teamId }});
	if(!team) throw new Error("No Such team exists");
	if(team.ownerId !== userId){
		throw new Error("You are not the owner of this team");
	}
})

module.exports = { requiresTeamAccess, requiresTeamOwnerAccess };