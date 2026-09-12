import { Entity, ManyToOne, Property } from "@mikro-orm/core";
import { Class } from "../class/class.entity.js";
import { BaseEntity } from "../common/base.entity.js";

@Entity()
export class ClassLists extends BaseEntity {
  @Property()
  title!: string;

  @ManyToOne(() => Class)
  class!: Class;

  // This contains the registrant columns to be used in the list.
  @Property()
  columns!: string;
}
