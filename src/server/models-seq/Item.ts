import {Table, Column, Model, CreatedAt, UpdatedAt, DataType, AutoIncrement, PrimaryKey, Unique, AllowNull, Index, ForeignKey, BelongsTo} from 'sequelize-typescript';
import { Space } from './Space';
 
@Table
export class Item extends Model<Item> {
 
    @Index
    @AutoIncrement
    @PrimaryKey
    @Unique
    @Column(DataType.INTEGER)
    itemId: number;

    @AllowNull(false)
    @Column(DataType.TEXT)
    name: string;

    @AllowNull(false)
    @Column(DataType.TEXT)
    colorCode: string;

    @AllowNull(true)
    @Column(DataType.TEXT)
    imgPath: string;

    @AllowNull(true)
    @Column(DataType.TEXT)
    tags: string;

    @AllowNull(true)
    @Column(DataType.TEXT)
    description: string;

    @AllowNull(true)
    @Column(DataType.TEXT)
    category: string;

    @AllowNull(true)
    @Column(DataType.DATE)
    reminderDtm: Date;

    @AllowNull(true)
    @Column(DataType.BOOLEAN)
    reminderComplete: boolean;
    

    //default timestamp
    @CreatedAt
    creationDate: Date;

    @UpdatedAt
    updatedOn: Date;

    //relationship with other tables
    @ForeignKey(() => Space)
    @AllowNull(false)
    @Column
    spaceId: number;
    
    @BelongsTo(() => Space)
    space: Space;
    
}