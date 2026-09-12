import { Loaded, wrap } from "@mikro-orm/core";
import { FastifyInstance } from "fastify";
import z from "zod";
import { initORM } from "../../db.js";
import { Class } from "../class/class.entity.js";
import { verifyRole } from "../common/roleUtils.js";
import { RolesType } from "../role/roleType.js";
import { Settings } from "../settings/settings.entity.js";
import { User } from "../user/user.entity.js";
import csvParser from "../utils/csvparser.js";
import parseCsvTimestamp from "../utils/dateUtils.js";
import { ClassRegistrant } from "./classRegistrant.entity.js";

const classSchema = z.object({
  class: z.number().nonoptional(),
  user: z.number().nonoptional(),
  paymentType: z.enum(["session", "perClass"]).nonoptional(),
  howWillPaymentBeMade: z
    .enum(["cash", "etransfer", "creditcard"])
    .nonoptional(),
  paidSession: z.boolean().nonoptional(),
  confirmationSent: z.boolean().nonoptional(),
  dateRegistered: z.coerce.date(),
});

const MAPPING_SETTINGS: string = "mapping_settings";

const bulkAddSchema = z.array(z.string());
const bulkUpdateConfSchema = z.array(z.number());

const getActiveClass = (
  googleFormsName: string,
  classMap: { [name: string]: Class },
): Class | null => {
  const classKeys = Object.keys(classMap);

  for (let index = 0; index < classKeys.length; index++) {
    const classKey = classKeys[index];

    if (googleFormsName.startsWith(classKey)) {
      return classMap[classKey];
    }
  }

  return null;
};

export const registerClassRegistrantRoutes = async (app: FastifyInstance) => {
  const db = await initORM();

  // Get Class registrant from id
  app.get("/:id?", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, [RolesType.AdminViewer]);
    let result:
      | ClassRegistrant
      | Loaded<
          ClassRegistrant,
          "class" | "user",
          | "paymentType"
          | "howWillPaymentBeMade"
          | "paidSession"
          | "dateRegistered"
          | "id"
          | "class.name"
          | "class.id"
          | "class.active"
          | "user.id"
          | "user.firstName"
          | "user.lastName",
          never
        >[]
      | null = null;
    const params = request.params as { id: string };

    if (params.id) {
      result = await db.classRegistrant.findOneOrFail(+params.id);
    } else {
      result = await db.em.find(
        ClassRegistrant,
        {},
        {
          populate: ["class", "user"],
          fields: [
            "id",
            "paymentType",
            "howWillPaymentBeMade",
            "paidSession",
            "dateRegistered",
            "confirmationSent",
            "class.id",
            "class.name",
            "class.active",
            "class.mailChimpName",
            "class.mailChimpClassType",
            "user.id",
            "user.firstName",
            "user.lastName",
            "user.email",
          ],
        },
      );
    }

    return result;
  });

  // The input data for this call is an array of registrant ids.
  // This method will set the confirmationSent field to true for
  // all registrants specified.
  app.post("/bulkUpdateConf", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, []);
    let result = true;

    try {
      const regIdsToUpdate = bulkUpdateConfSchema.parse(request.body);

      for (let index = 0; index < regIdsToUpdate.length; index++) {
        const registrantId = regIdsToUpdate[index];
        const registrant = await db.classRegistrant.findOneOrFail(registrantId);

        registrant.confirmationSent = true;
      }

      await db.em.flush();
    } catch (exc) {
      result = false;
    }

    return result;
  });

  app.post(
    "/bulkadd",
    async (
      request,
    ): Promise<{
      error: string;
      newUsersAdded: string[];
      existingAdded: string[];
      skippedEntries: string[];
    }> => {
      verifyRole(request?.userInfo?.roles ?? null, []);

      const csvRegistrants = bulkAddSchema.parse(request.body);
      const parsedRegistrants = csvParser(csvRegistrants);
      const responseMessage: {
        error: string;
        newUsersAdded: string[];
        existingAdded: string[];
        skippedEntries: string[];
      } = {
        error: "",
        newUsersAdded: [],
        existingAdded: [],
        skippedEntries: [],
      };

      const mappings = await db.em.findOneOrFail(Settings, {
        name: MAPPING_SETTINGS,
      });
      const activeClasses = await db.em.findAll(Class, {
        where: { active: true },
      });
      const activeClassesMap: { [googleName: string]: Class } = {};
      const currentRegistrants = await db.em.find(
        ClassRegistrant,
        {},
        {
          populate: ["user"],
          fields: ["id", "dateRegistered", "user.email"],
        },
      );

      if (!mappings?.name) {
        responseMessage.error = "No bulk add mappings.";
        return responseMessage;
      }

      let parsedMappings: string[] = [];
      try {
        parsedMappings = JSON.parse(mappings.value);
      } catch {}

      let allColumnsMatch = true;
      let registrantsColumns = 0;

      parsedRegistrants.forEach((registrant, index) => {
        if (registrant.length !== parsedMappings.length) {
          registrantsColumns = registrant.length;
          allColumnsMatch = false;
        }
      });

      if (!allColumnsMatch) {
        responseMessage.error = `Registrant columns=${registrantsColumns}, Mapping columns=${parsedMappings.length}.  They must match.`;
        return responseMessage;
      }

      // Create classes map
      activeClasses.forEach((aClass) => {
        activeClassesMap[aClass.googleFormsName] = aClass;
      });

      const newMemberClass = activeClassesMap["mainstream"];
      const memberOnlyClass = activeClassesMap["memberonly"];

      if (!newMemberClass) {
        responseMessage.error = "No mainstream class defined.";
        return responseMessage;
      }

      if (!memberOnlyClass) {
        responseMessage.error = "No memmber only class defined";
        return responseMessage;
      }

      // Note.  The first line in the csv registrants file is a header so it must be skipped.
      //        As well, if there are duplicate emails in the registrants file we only want to
      //        use the one with the oldest date.
      const registrantsMap: {
        [email: string]: {
          timestampDate: Date;
          firstName: string;
          lastName: string;
          email: string;
          phone: string;
          howWillPaymentBeMade: string;
          classChosen: Class;
        };
      } = {};

      let earliestDate: Date = new Date();

      parsedRegistrants.forEach((registrant, regIndex) => {
        if (regIndex > 0) {
          let timestamp: string = "";
          let firstName: string = "";
          let lastName: string = "";
          let email: string = "";
          let phone: string = "";
          let howWillPaymentBeMade: string = "";
          let classChosen: Class | null = null;
          let classGoogleName: string = "";

          parsedMappings.forEach((mapping, mapIndex) => {
            switch (mapping) {
              case "Firstname": {
                firstName = registrant[mapIndex];
                break;
              }
              case "Lastname": {
                lastName = registrant[mapIndex];
                break;
              }
              case "Email": {
                email = registrant[mapIndex];
                break;
              }
              case "Phone": {
                phone = registrant[mapIndex];
                break;
              }
              case "Timestamp": {
                timestamp = registrant[mapIndex];
                break;
              }
              case "RegistrationType": {
                const registrationType = registrant[mapIndex].toLowerCase();

                if (registrationType.startsWith("new members")) {
                  classChosen = newMemberClass;
                } else if (registrationType.startsWith("returning members")) {
                  // Do nothing class is defined in the class field.
                } else if (registrationType.startsWith("pay $30")) {
                  classChosen = memberOnlyClass;
                }

                break;
              }
              case "Class": {
                classGoogleName = registrant[mapIndex]?.toLowerCase();

                if (classGoogleName !== "") {
                  classChosen = getActiveClass(
                    classGoogleName,
                    activeClassesMap,
                  );
                }
                break;
              }
              case "PaymentType": {
                const howPaying = registrant[mapIndex].toLowerCase();

                if (howPaying.startsWith("e-transfer")) {
                  howWillPaymentBeMade = "etransfer";
                } else if (howPaying.startsWith("cash")) {
                  howWillPaymentBeMade = "cash";
                } else if (howPaying.startsWith("credit card")) {
                  howWillPaymentBeMade = "creditcard";
                }
                break;
              }
            }
          });

          const timestampDate = parseCsvTimestamp(timestamp);

          if (timestampDate.getTime() < earliestDate.getTime()) {
            earliestDate = timestampDate;
          }

          if (!classChosen) {
            return [
              `Class not chosen for ${firstName} ${lastName}: ${classGoogleName} ${timestamp}.`,
            ];
          }

          const existingEntry = registrantsMap[email];
          let registrantEntry = {
            timestampDate,
            firstName,
            lastName,
            phone,
            email,
            howWillPaymentBeMade,
            classChosen,
          };

          if (existingEntry) {
            // There is already an entry for this member so we need to see which one
            // is the newest.
            const existingTimeStamp = existingEntry.timestampDate;
            const newTimeStamp = parseCsvTimestamp(timestamp);

            if (newTimeStamp.getTime() > existingTimeStamp.getTime()) {
              // We have a new entry that should be replace the existing one
              responseMessage.skippedEntries.push(
                JSON.stringify(registrantsMap[email]),
              );
              registrantsMap[email] = registrantEntry;
            } else {
              responseMessage.skippedEntries.push(
                JSON.stringify(registrantEntry),
              );
            }
          } else {
            registrantsMap[email] = registrantEntry;
          }
        }
      });

      // We now have a registrant map that contains all the duplicate entries removed.
      // These entries may have beem added into the database already so we meed to add
      // any new enties or any that replace existing ones.
      const newUsersAdded: string[] = responseMessage.newUsersAdded;
      const existingAdded: string[] = responseMessage.existingAdded;
      const existingReplaced: string[] = [];
      const currentRegistrantsMap: {
        [email: string]: { id: number; dateRegistered: Date };
      } = {};

      currentRegistrants.forEach((currentRegistrant) => {
        if (
          currentRegistrant.dateRegistered.getTime() >= earliestDate.getTime()
        ) {
          // We found an existing current registrant after the start date
          // Note: there could be registrants from previous classes that we want to ignore.
          // There shouldn't already be an entry om tje registrants map for this user since
          // a user can only take one class.
          const email = currentRegistrant.user.email;

          if (currentRegistrantsMap[email]) {
            return {
              errors: [
                `Duplicate current registrants found for email ${email}`,
              ],
            };
          }

          currentRegistrantsMap[email] = {
            id: currentRegistrant.id,
            dateRegistered: currentRegistrant.dateRegistered,
          };
        }
      });

      const registrantKeys = Object.keys(registrantsMap);

      for (let regIndex = 0; regIndex < registrantKeys.length; regIndex++) {
        const email = registrantKeys[regIndex];
        const entry = registrantsMap[email];
        const existingEntry = currentRegistrantsMap[email];
        const entryTime = entry.timestampDate.getTime();
        const existingEntryTime: number | null =
          existingEntry?.dateRegistered.getTime() ?? null;
        let addEntry = false;

        if (existingEntryTime !== null && entryTime > existingEntryTime) {
          // A new entry was found found for this user.  We need to delete the old one
          // and add this new one.
          await db.classRegistrant.nativeDelete({ id: existingEntry.id });
          existingReplaced.push(
            `${entry.firstName} ${entry.lastName}, ${entry.email}`,
          );
          addEntry = true;
        } else if (existingEntryTime === null) {
          // We have a new entry that needs to be added
          existingAdded.push(
            `${entry.firstName} ${entry.lastName}, ${entry.email}`,
          );
          addEntry = true;
        }

        if (addEntry) {
          const users = await db.user.find({ email: entry.email });
          let user: User | null = users.length === 0 ? null : users[0];

          if (user === null) {
            // This user does not exist so we need to create it.
            const fork = db.em.fork();

            user = new User(
              entry.firstName,
              entry.lastName,
              entry.email,
              entry.phone,
              "",
              "",
            );
            await fork.persist(user).flush();
            newUsersAdded.push(
              `${entry.firstName} ${entry.lastName}, ${entry.email}`,
            );
          }

          // At this point the id for the user should be set.
          const newRegistrant = db.classRegistrant.create({
            user: user.id,
            class: entry.classChosen.id,
            paymentType: "session",
            howWillPaymentBeMade: entry.howWillPaymentBeMade,
            paidSession: false,
            dateRegistered: entry.timestampDate,
            confirmationSent: false,
          });
        }
      }

      await db.em.flush();
      return responseMessage;
    },
  );

  app.post("/", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, []);

    const classObject = classSchema.parse(request.body);
    const newClassRegistrant: ClassRegistrant =
      db.classRegistrant.create(classObject);

    await db.em.flush();
    return { success: true, newClassRegistrant };
  });

  app.patch("/:id", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, []);

    const params = request.params as { id: string };
    const classObject = classSchema.parse(request.body);
    const classRegistrantRecord = await db.classRegistrant.findOneOrFail(
      +params.id,
    );

    wrap(classRegistrantRecord).assign(classObject);

    await db.em.flush();
    return { success: true, newClassRegistrant: classRegistrantRecord };
  });

  app.delete("/:id", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, []);

    const params = request.params as { id: string };
    const classRegistrantRecord = await db.classRegistrant.findOneOrFail(
      +params.id,
    );

    await db.em.remove(classRegistrantRecord).flush();
    return { success: true };
  });
};
