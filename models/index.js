const { Sequelize, DataTypes} = require('sequelize');

const sequelize = new Sequelize('estack', 'postgres', 'postgres123', {
  host: 'localhost',
  dialect: 'postgres'
});

const models = {};

models.sequelize = sequelize;
models.Sequelize = Sequelize;

models.User = require('./user')(sequelize, Sequelize);
models.Team = require('./team')(sequelize, Sequelize);
models.TeamMember = require('./teamMember')(sequelize, Sequelize);
models.Channel = require('./channel')(sequelize, Sequelize);
models.Message = require('./message')(sequelize, Sequelize);
models.PrivateChannelMember = require('./privateChannelMember')(sequelize, Sequelize);

Object.keys(models).forEach((modelName) => {
  if('associate' in models[modelName]){
    models[modelName].associate(models);
  }
});

module.exports = models;