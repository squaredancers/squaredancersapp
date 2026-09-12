import axios from "axios";
import BaseServer from "../common/baseServer.js";
import {
  RegistrantServerType,
  RegistrantTableType,
} from "./registrantsTypes.js";

interface BulkAddResponse {
  error: string;
  newUsersAdded: string[];
  existingAdded: string[];
  skippedEntries: string[];
}
export class RegistrantServerTypeClass extends BaseServer<
  RegistrantTableType,
  RegistrantServerType
> {
  public constructor() {
    super("registrant");
  }

  public mapTableToServer(
    registrant: RegistrantTableType,
  ): RegistrantServerType {
    return {
      id: registrant.id,
      class: registrant.classId,
      user: registrant.userId,
      paidSession: registrant.paidSession,
      paymentType: registrant.paymentType,
      dateRegistered: registrant.dateRegistered,
      howWillPaymentBeMade: registrant.howWillPaymentBeMade,
      confirmationSent: registrant.confirmationSent,
    };
  }

  public mapServerToTable(
    registrant: RegistrantServerType,
  ): RegistrantTableType {
    const user = registrant.user as {
      firstName: string;
      lastName: string;
      id: number;
      email: string;
    };

    const clazz = registrant.class as {
      name: string;
      active: boolean;
      id: number;
      mailChimpName: string;
      mailChimpClassType: string;
    };

    return {
      id: registrant.id,
      userFirstName: user.firstName,
      userLastName: user.lastName,
      userEmail: user.email,
      userName: `${user.firstName} ${user.lastName}`,
      userId: user.id,
      dateRegistered: registrant.dateRegistered,
      paymentType: registrant.paymentType,
      howWillPaymentBeMade: registrant.howWillPaymentBeMade,
      paidSession: registrant.paidSession,
      confirmationSent: registrant.confirmationSent,
      className: clazz.name,
      classActive: clazz.active,
      classId: clazz.id,
      classMailChimpName: clazz.mailChimpName,
      classMailChimpClassType: clazz.mailChimpClassType,
    };
  }

  async bulkAddRegistrants(
    registrants: string[],
  ): Promise<BulkAddResponse | null> {
    const requestConfig = this.getConfig(
      "POST",
      "/api/registrant/bulkadd",
      JSON.stringify(registrants),
    );
    let result: BulkAddResponse | null = null;

    try {
      const response: {
        data: BulkAddResponse;
      } = await axios(requestConfig);

      if (response.data) {
        result = response.data;
      }
    } catch (exc) {}

    return result;
  }

  async bulkUpdateConfSent(registrantIds: number[]): Promise<boolean> {
    const requestConfig = this.getConfig(
      "POST",
      "/api/registrant/bulkUpdateConf",
      JSON.stringify(registrantIds),
    );
    let result: boolean = false;

    try {
      const response: { data: boolean } = await axios(requestConfig);

      if (response.data) {
        result = response.data;
      }
    } catch (exc) {}

    return result;
  }
}
