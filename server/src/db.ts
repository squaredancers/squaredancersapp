import {
  EntityManager,
  EntityRepository,
  MikroORM,
  Options,
} from "@mikro-orm/sqlite";
import { User } from "./modules/user/user.entity.js";
import { Location } from "./modules/location/location.entity.js";
import { Caller } from "./modules/caller/caller.entity.js";
import { ClassInfo } from "./modules/classInfo/classInfo.entity.js";
import { Class } from "./modules/class/class.entity.js";
import { Event } from "./modules/event/event.entity.js";
import { Payments } from "./modules/payments/payments.entity.js";

export interface Services {
  orm: MikroORM;
  em: EntityManager;
  user: EntityRepository<User>;
  location: EntityRepository<Location>;
  caller: EntityRepository<Caller>;
  classInfo: EntityRepository<ClassInfo>;
  class: EntityRepository<Class>;
  event: EntityRepository<Event>;
  payments: EntityRepository<Payments>;
}

let cache: Services;

export const initORM = async (options?: Options): Promise<Services> => {
  if (cache) {
    return cache;
  }

  const orm = await MikroORM.init(options);

  // save to cache before returning
  return (cache = {
    orm,
    em: orm.em,
    user: orm.em.getRepository(User),
    location: orm.em.getRepository(Location),
    caller: orm.em.getRepository(Caller),
    classInfo: orm.em.getRepository(ClassInfo),
    class: orm.em.getRepository(Class),
    event: orm.em.getRepository(Event),
    payments: orm.em.getRepository(Payments),
  });
};
