import axios from "axios";
import BaseServer from "../common/baseServer.js";
import {
  RegistrantServerType,
  RegistrantTableType,
} from "./registrantsTypes.js";

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
    };
  }

  public mapServerToTable(
    registrant: RegistrantServerType,
  ): RegistrantTableType {
    const user = registrant.user as {
      firstName: string;
      lastName: string;
      id: number;
    };

    const clazz = registrant.class as {
      name: string;
      active: boolean;
      id: number;
    };

    return {
      id: registrant.id,
      userName: `${user.firstName} ${user.lastName}`,
      userId: user.id,
      dateRegistered: registrant.dateRegistered,
      paymentType: registrant.paymentType,
      paidSession: registrant.paidSession,
      className: clazz.name,
      classActive: clazz.active,
      classId: clazz.id,
    };
  }

  async bulkAddRegistrants(registrants: string[]): Promise<string[] | null> {
    const requestConfig = this.getConfig(
      "POST",
      "/api/registrant/bulkadd",
      JSON.stringify(registrants),
    );
    let result: string[] | null = null;

    try {
      const response: { data: string[] } = await axios(requestConfig);

      if (response.data) {
        result = response.data;
      }
    } catch (exc) {}

    return result;
  }
}
