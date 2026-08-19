import { Entity, Property } from "@mikro-orm/core";
import { BaseEntity } from "../common/base.entity.js";

@Entity()
export class Settings extends BaseEntity {
  @Property()
  name!: string;

  @Property()
  value!: string;
}
