import {
  Table, Column, Model, CreatedAt, UpdatedAt, DataType, AutoIncrement, PrimaryKey, Unique, AllowNull, Index, HasMany, ForeignKey, BelongsTo
} from 'sequelize-typescript';
import Grid from './Grid';
import User from './User';

@Table
export default class Space extends Model<Space> {
  @Index
  @AutoIncrement
  @PrimaryKey
  @Unique
  @Column(DataType.INTEGER)
  spaceId: number;

  @AllowNull(false)
  @Column(DataType.TEXT)
  name: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  imgPath: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  location: string;

  // relationship with other tables
  @HasMany(() => Grid)
  grids: Grid[];

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  userId: number;

  @BelongsTo(() => User)
  User: User;

  @CreatedAt
  creationDate: Date;

  @UpdatedAt
  updatedOn: Date;
}
