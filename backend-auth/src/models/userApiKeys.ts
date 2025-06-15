import {Model, DataTypes} from "sequelize";
import sequelize from "../config/database";

class UserApiKeys extends Model {
    public id!: number;
    public user_id!: string;
    public model_id!: number;
    public api_key!: string;
}

UserApiKeys.init(
    {
        id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true,},
        user_id: {type: DataTypes.UUID, onDelete: 'CASCADE', references: {model: 'users', key: 'id'}},
        model_id: {type: DataTypes.INTEGER, onDelete: 'CASCADE', references: {model: 'models', key: 'id'}},
        api_key: {type: DataTypes.STRING, allowNull: false,},
    },
    {
        sequelize,
        timestamps: false,
        tableName: "user_api_keys",
    }
);

export default UserApiKeys;