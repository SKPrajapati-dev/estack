module.exports = (sequelize, DataTypes) => {
  const PrivateChannelMember = sequelize.define('privateChannelMembers', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    }
  });

  PrivateChannelMember.associate = (models) => {
    PrivateChannelMember.belongsTo(models.Channel),
    PrivateChannelMember.belongsTo(models.User, {
      as: 'member'
    })
  }

  return PrivateChannelMember;
}