import { Entity, ManyToOne, Property, Cascade } from "@mikro-orm/core";
import { BaseEntity } from "../common/base.entity.js";
import { User } from "../user/user.entity.js";

export enum RolesType {
  "AdminModifier" = "AdminModifier",
  "AdminViewer" = "AdminViewer",
  "ClassModifier" = "ClassModifier",
  "ClassViewer" = "ClassViewer",
  "EventModifier" = "EventModifier",
  "EventViewer" = "EventViewer",
}
