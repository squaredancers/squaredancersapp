import { Entity, ManyToOne, Opt, Property } from "@mikro-orm/core";
import { Class } from "../class/class.entity.js";
import { BaseEntity } from "../common/base.entity.js";
import { User } from "../user/user.entity.js";

@Entity()
export class ClassRegistrant extends BaseEntity {
  @ManyToOne(() => Class)
  class!: Class;

  @ManyToOne(() => User)
  user!: User;

  @Property()
  paymentType!: string;

  @Property({ default: false })
  paidSession: boolean = false;

  @Property({ defaultRaw: "'2026-01-01 00:00:00'" })
  dateRegistered: Date & Opt = new Date();
}
