module.exports = (sequelize, DataTypes) => {
  const TeamMember = sequelize.define('teamMembers', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    }
  });

  TeamMember.associate = (models) => {
    TeamMember.belongsTo(models.User, {
      as: 'member'
    }),
    TeamMember.belongsTo(models.Team, {
      as: 'team'
    })
  }
  return TeamMember;
}