import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  Property,
} from "@mikro-orm/core";
import { ClassInfo } from "../classInfo/classInfo.entity.js";
import { ClassRegistrant } from "../classRegistrant/classRegistrant.entity.js";
import { BaseEntity } from "../common/base.entity.js";

@Entity()
export class Class extends BaseEntity {
  @ManyToOne(() => ClassInfo)
  classInfo!: ClassInfo;

  @Property()
  name!: string;

  @Property()
  active!: boolean;

  @Property({ default: "" })
  googleFormsName!: string;

  @Property({ default: "" })
  mailChimpName!: string;

  @Property({ default: "" })
  mailChimpClassType!: string;

  // Note: this is a class list of students.
  @OneToMany({ mappedBy: "class" })
  registrants = new Collection<ClassRegistrant>(this);
}
