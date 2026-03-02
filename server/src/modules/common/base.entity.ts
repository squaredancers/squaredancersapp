import { PrimaryKey, Property, OptionalProps } from "@mikro-orm/core";

export abstract class BaseEntity {
  [OptionalProps]?: "createdAt" | "updatedAt" | "isDeleted";

  @PrimaryKey()
  id!: number;

  @Property()
  isDeleted: boolean = false;

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();
}
