import { Entity, ManyToOne, Property } from "@mikro-orm/core";
import { Class } from "../class/class.entity.js";
import { BaseEntity } from "../common/base.entity.js";
import { User } from "../user/user.entity.js";

@Entity()
export class Payments extends BaseEntity {
  @ManyToOne(() => User)
  user!: User;

  @ManyToOne()
  class!: Class;

  @Property()
  paid!: boolean;

  @Property()
  comment!: string;
}
