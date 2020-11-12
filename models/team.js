module.exports = (sequelize, DataTypes) => {
  const Team = sequelize.define('teams', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    teamName: {
      type: DataTypes.STRING,
    }
  },
  {
    timestamps: true
  });

  Team.associate = (models) => {
    Team.belongsTo(models.User, {
      as: 'owner'
    });
  }
  return Team;
}