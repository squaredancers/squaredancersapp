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

    if (classKey !== "" && googleFormsName.startsWith(classKey)) {
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

      let colMappings: {
        [colNum: number]: {
          field: string;
          startsWith: string;
          useColValue: boolean;
          value: string;
        }[];
      } = {};
      let maxCol: number = 0;

      try {
        const parsedMappings: {
          name: string;
          jsonString: string;
        }[] = JSON.parse(mappings.value);

        parsedMappings.forEach((mapping) => {
          const mappingEntry: {
            columnNum: number;
            field: string;
            startsWith: string;
            useColValue: boolean;
            value: string;
          } = JSON.parse(mapping.jsonString);

          let colMappingsArray = colMappings[mappingEntry.columnNum];

          if (!colMappingsArray) {
            colMappingsArray = [];
            colMappings[mappingEntry.columnNum] = colMappingsArray;
          }

          colMappingsArray.push({
            field: mappingEntry.field,
            startsWith: mappingEntry.startsWith,
            useColValue: mappingEntry.useColValue,
            value: mappingEntry.value,
          });

          if (mappingEntry.columnNum > maxCol) {
            maxCol = mappingEntry.columnNum;
          }
        });
      } catch (exc) {
        console.log(exc);
      }

      let allColumnsMatch = true;
      let registrantsColumns = 0;

      parsedRegistrants.forEach((registrant, index) => {
        if (registrant.length !== maxCol) {
          registrantsColumns = registrant.length;
          allColumnsMatch = false;
        }
      });

      if (!allColumnsMatch) {
        responseMessage.error = `Registrant columns=${registrantsColumns}, Mapping columns=${maxCol}.  They must match.`;
        return responseMessage;
      }

      // Create classes map
      activeClasses.forEach((aClass) => {
        activeClassesMap[aClass.googleFormsName] = aClass;
      });

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
          paymentType: string;
          classChosen: Class | null;
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
          let classGoogleName: string = "";
          let paymentType: string = "";
          let classChosen: Class | null = null;
          const colKeys = Object.keys(colMappings);

          colKeys.forEach((mappingId) => {
            const colEntryIndex = parseInt(mappingId);
            const colEntries = colMappings[colEntryIndex];

            colEntries.forEach((colEntry) => {
              const field = colEntry.field;
              const startsWith = colEntry.startsWith.toLowerCase();
              const value = colEntry.value;

              switch (field) {
                case "Firstname": {
                  firstName = registrant[colEntryIndex - 1];
                  break;
                }
                case "Lastname": {
                  lastName = registrant[colEntryIndex - 1];
                  break;
                }
                case "Email": {
                  email = registrant[colEntryIndex - 1];
                  break;
                }
                case "Phone": {
                  phone = registrant[colEntryIndex - 1];
                  break;
                }
                case "Timestamp": {
                  timestamp = registrant[colEntryIndex - 1];
                  break;
                }
                case "Class": {
                  classGoogleName =
                    registrant[colEntryIndex - 1]?.toLowerCase();

                  if (classGoogleName !== "") {
                    classChosen = getActiveClass(
                      classGoogleName,
                      activeClassesMap,
                    );
                  }

                  break;
                }
                case "HowWillPay": {
                  const howPaying = registrant[colEntryIndex - 1].toLowerCase();

                  if (howPaying.startsWith(startsWith)) {
                    howWillPaymentBeMade = value;
                  }

                  break;
                }
                case "PaymentType": {
                  const payType = registrant[colEntryIndex - 1].toLowerCase();

                  if (payType.startsWith(startsWith)) {
                    paymentType = value;
                  }

                  break;
                }
              }
            });
          });

          const timestampDate = parseCsvTimestamp(timestamp);

          if (timestampDate.getTime() < earliestDate.getTime()) {
            earliestDate = timestampDate;
          }

          if (!classChosen) {
            responseMessage.error = `Class not chosen for ${firstName} ${lastName}: ${classGoogleName} ${timestamp}.`;
          }

          if (howWillPaymentBeMade === "") {
            responseMessage.error = `Invalid how to pay string for ${firstName} ${lastName}: ${classGoogleName} ${timestamp}.`;
          }

          if (paymentType === "") {
            responseMessage.error = `Invalid payment type string for ${firstName} ${lastName}: ${classGoogleName} ${timestamp}.`;
          }

          const existingEntry = registrantsMap[email];
          let registrantEntry = {
            timestampDate,
            firstName,
            lastName,
            phone,
            email,
            howWillPaymentBeMade,
            paymentType,
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

      if (responseMessage.error !== "") {
        return responseMessage;
      }

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
          if (entry.classChosen !== null) {
            db.classRegistrant.create({
              user: user.id,
              class: entry.classChosen.id,
              paymentType: entry.paymentType,
              howWillPaymentBeMade: entry.howWillPaymentBeMade,
              paidSession: false,
              dateRegistered: entry.timestampDate,
              confirmationSent: false,
            });
          }
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
