import axios, { AxiosRequestConfig, Method } from "axios";
import useUserStore from "../stores/useUserStore.js";

export interface CallerWithHours {
  id: number;
  hourlyRate: number;
  user: {
    firstName: string;
    lastName: string;
  };
  hours: number;
}
class Server {
  private static getConfig(
    method: Method,
    url: string,
    data: string,
    needToken: boolean,
  ) {
    const token = useUserStore.getState().token;
    const config: AxiosRequestConfig = {
      url,
      method,
      data,
      headers: {
        "Content-Type": "application/json",
        Authorization: needToken ? `Bearer ${token}` : undefined,
      },
    };

    return config;
  }

  static async login(email: string, password: string) {
    interface LoginResponse {
      success: boolean;
      email: string;
      firstname: string;
      lastname: string;
      token: string;
      roles: string[];
    }

    const dataObject = { email, password };
    let success = false;
    const requestConfig = this.getConfig(
      "POST",
      "/api/user/login",
      JSON.stringify(dataObject),
      false,
    );

    try {
      const response: { data: LoginResponse } = await axios(requestConfig);

      if (response.data.success && response.data.token.length > 0) {
        useUserStore
          .getState()
          .login(
            response.data.firstname,
            response.data.lastname,
            response.data.email,
            response.data.token,
            response.data.roles,
          );

        success = true;
      }
    } catch (exc) {}

    return success;
  }

  static async getRoles(): Promise<string[]> {
    const requestConfig = this.getConfig("GET", "/api/roles/all", "", true);
    let result: string[] = [];

    try {
      const response: { data: string[] } = await axios(requestConfig);

      result = response?.data ?? [];
    } catch (exc) {}

    return result;
  }

  static async getCallerHours(
    startDate: Date,
    endDate: Date,
  ): Promise<CallerWithHours[]> {
    let result: CallerWithHours[] = [];
    const data = { startDate, endDate };
    const requestConfig = this.getConfig(
      "POST",
      "/api/report/callers",
      JSON.stringify(data),
      true,
    );

    try {
      const response: { data: { callerHours: CallerWithHours[] } } =
        await axios(requestConfig);

      result = response?.data.callerHours ?? [];
    } catch (exc) {}

    return result;
  }

  static async getSettings(): Promise<{ [key: string]: string }> {
    let result: { [key: string]: string } = {};
    const requestConfig = this.getConfig("GET", "/api/settings", "", true);

    try {
      const response: { data: { name: string; value: string }[] } =
        await axios(requestConfig);

      response.data.forEach((entry) => {
        result[entry.name] = entry.value;
      });
    } catch (exc) {}

    return result;
  }

  static async updateSetting(
    settingKey: string,
    value: string,
    isCreate: boolean,
  ): Promise<void> {
    const data = { name: settingKey, value };
    const requestConfig = this.getConfig(
      isCreate ? "POST" : "PATCH",
      "/api/settings",
      JSON.stringify(data),
      true,
    );

    try {
      await axios(requestConfig);
    } catch (exc) {}
  }
}

export default Server;
