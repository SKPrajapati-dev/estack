module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('messages', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    text: DataTypes.STRING
  });

  Message.associate = (models) => {
    Message.belongsTo(models.Channel),
    Message.belongsTo(models.User)
  }

  return Message;
}