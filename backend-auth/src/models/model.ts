import {Model, DataTypes} from "sequelize";
import sequelize from "../config/database";

class AI_Model extends Model{
    public id!: number;
    public model!: string;
    public default_api_key!: string;
}

AI_Model.init(
    {
        id: {type: DataTypes.NUMBER, autoIncrement: true, primaryKey: true,},
        model: {type: DataTypes.STRING, allowNull: false,},
        default_api_key: {type: DataTypes.STRING, allowNull: false,},
    },
    {
        sequelize,
        timestamps: false,
        tableName: "models",
    }
);
export default AI_Model;