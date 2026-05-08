// models/message.ts
import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface IFile {
    id: string;
    messageId: string;
    originalName: string;
    uniqueName: string;
    createdAt?: Date;
}

interface FileCreation extends Optional<IFile, 'id'> { }

class File
    extends Model<IFile, FileCreation>
    implements IFile {
    public get id(): string { return this.getDataValue('id'); }
    public get messageId(): string { return this.getDataValue('messageId'); }
    public get originalName(): string { return this.getDataValue('originalName'); }
    public get uniqueName(): string { return this.getDataValue('uniqueName'); }
    public get createdAt(): Date { return this.getDataValue('createdAt') as Date; }
}

File.init(
    {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        messageId: { type: DataTypes.UUID, allowNull: false },
        originalName: { type: DataTypes.STRING, allowNull: false },
        uniqueName: { type: DataTypes.STRING, allowNull: false },
    },
    {
        underscored: true,
        sequelize,
        modelName: 'File',
        tableName: 'files',
        updatedAt: false,
    }
);

export default File;