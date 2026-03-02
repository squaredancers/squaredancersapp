import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  Property,
} from "@mikro-orm/core";
import { ClassInfo } from "../classInfo/classInfo.entity.js";
import { BaseEntity } from "../common/base.entity.js";
import { Payments } from "../payments/payments.entity.js";

@Entity()
export class Class extends BaseEntity {
  @ManyToOne(() => ClassInfo)
  classInfo!: ClassInfo;

  @Property()
  name!: string;

  @Property()
  active!: boolean;

  // Note: this is a class list of students.  When the student
  // initially enrolls for a class the payment record paid field is set
  // to false.  Once, they have paid the paid field is set to true.
  @OneToMany({ mappedBy: "class" })
  payments = new Collection<Payments>(this);
}
