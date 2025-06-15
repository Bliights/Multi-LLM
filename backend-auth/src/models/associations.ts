import User from "./user";
import AI_Model from "./model";
import UserApiKeys from "./userApiKeys";

const initializeModels = () => {
    // User - UserApiKeys Association
    User.hasOne(UserApiKeys, { foreignKey: 'user_id', onDelete: 'CASCADE' });
    UserApiKeys.belongsTo(User, { foreignKey: 'user_id' });

    // Model - UserApiKeys Association
    AI_Model.hasMany(UserApiKeys, { foreignKey: 'model_id', onDelete: 'CASCADE' });
    UserApiKeys.belongsTo(AI_Model, { foreignKey: 'model_id' });
}
export default initializeModels;