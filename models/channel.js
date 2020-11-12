module.exports = (sequelize, DataTypes) => {
  const Channel = sequelize.define('channels', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    channelName: {
      type: DataTypes.STRING
    },
    public: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  });

  Channel.associate = (models) => {
    Channel.belongsTo(models.Team)
  }

  return Channel;
}