export class Model {
    public id!: number;
    public model!: string;
    public default_api_key!: string;
}

export class User {
    public id!: string;
    public name!: string;
    public email!: string;
    public password!: string;
    public role!: string;
    public created_at!: Date;
}

export class UserApiKeys {
    public id!: number;
    public user_id!: string;
    public model_id!: number;
    public api_key!: string;
}

export class Message {
    public id!: number;
    public conversation_id!: string;
    public sender!: string;
    public message!: string;
    public date!: Date;
}

export class Conversation {
    public id!: string;
    public user_id!: string;
    public model_id!: number;
    public title!: string;
    public created_at!: Date;
    public updated_at!: Date;
}
