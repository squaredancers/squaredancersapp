import { Entity, Property } from "@mikro-orm/core";
import { BaseEntity } from "../common/base.entity.js";

@Entity()
export class Location extends BaseEntity {
  @Property()
  name!: string;

  @Property()
  address!: string;

  @Property()
  phone!: string;

  @Property()
  rent!: number;
}
