import { Entity, ManyToOne, Property } from "@mikro-orm/core";
import { Caller } from "../caller/caller.entity.js";
import { Class } from "../class/class.entity.js";
import { BaseEntity } from "../common/base.entity.js";
import { Location } from "../location/location.entity.js";

@Entity()
export class Event extends BaseEntity {
  @ManyToOne(() => Class, { nullable: true })
  class!: Class | null;

  @Property()
  name!: string;

  @Property({
    serializer: (value) =>
      value instanceof Date ? value.toISOString() : value,
  })
  date!: Date;

  @ManyToOne(() => Location)
  location!: Location;

  @ManyToOne(() => Caller)
  caller!: Caller;

  @Property()
  draft!: boolean;

  @Property()
  roomCharge!: number;

  @Property()
  callerCharge!: number;
}
