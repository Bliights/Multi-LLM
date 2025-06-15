import {Model, DataTypes} from "sequelize";
import sequelize from "../config/database";

class User extends Model {
    public id!: string;
    public name!: string;
    public email!: string;
    public password!: string;
    public role!: string;
    public created_at!: Date;
}

User.init(
    {
        id: {type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4,},
        name: {type: DataTypes.STRING, allowNull: false,},
        email: {type: DataTypes.STRING, allowNull: false, unique: true, validate: {isEmail: true,},},
        password: {type: DataTypes.STRING, allowNull: false,},
        role: {type: DataTypes.STRING, validate: {isIn: [["admin","user"]],}},
        created_at:{type:DataTypes.DATE, defaultValue:DataTypes.NOW},
    },
    {
        sequelize,
        timestamps: false,
        tableName: "users",
    }
);

export default User;