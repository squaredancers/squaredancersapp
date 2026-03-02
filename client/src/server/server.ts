import axios, { AxiosRequestConfig, Method } from "axios";
import useUserStore from "../stores/useUserStore.js";

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
}

export default Server;
