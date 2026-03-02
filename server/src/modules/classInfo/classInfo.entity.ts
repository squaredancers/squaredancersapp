import { Entity, ManyToOne, Property } from "@mikro-orm/core";
import { Caller } from "../caller/caller.entity.js";
import { BaseEntity } from "../common/base.entity.js";
import { Location } from "../location/location.entity.js";

export enum DaysType {
  "Monday" = "Monday",
  "Tuesday" = "Tuesday",
  "Wednesday" = "Wednesday",
  "Thursday" = "Thursday",
  "Friday" = "Friday",
  "Saturday" = "Saturday",
  "Sunday" = "Sunday",
}

@Entity()
export class ClassInfo extends BaseEntity {
  @Property()
  name!: string;

  @ManyToOne(() => Location)
  location!: Location;

  @ManyToOne(() => Caller)
  caller!: Caller;

  @Property()
  day!: DaysType;

  @Property()
  hours!: number;
}
