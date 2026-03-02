import axios, { AxiosRequestConfig, Method } from "axios";
import useUserStore from "../../../../stores/useUserStore.js";
import IDField from "./types.js";

abstract class BaseServer<
  RowTableType extends IDField,
  RowServerType extends IDField,
> {
  path: string;

  public constructor(path: string) {
    this.path = path;
  }

  public getRowPath(id: number) {
    return `/api/${this.path}/${id}`;
  }

  public getPath() {
    return `/api/${this.path}`;
  }
  public createPath() {
    return `/api/${this.path}`;
  }
  public updatePath(id: number) {
    return `/api/${this.path}/${id}`;
  }
  public deletePath(id: number) {
    return `/api/${this.path}/${id}`;
  }

  public abstract mapTableToServer(row: RowTableType): RowServerType;
  public abstract mapServerToTable(row: RowServerType): RowTableType;

  private getConfig(method: Method, url: string, data: string) {
    const token = useUserStore.getState().token;
    const config: AxiosRequestConfig = {
      url,
      method,
      data,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    return config;
  }

  async getRow(id: number): Promise<RowTableType | null> {
    const requestConfig = this.getConfig("GET", this.getRowPath(id), "");
    let result: RowTableType | null = null;

    try {
      const response: { data: RowServerType } = await axios(requestConfig);

      if (response.data) {
        result = this.mapServerToTable(response.data);
      }
    } catch (exc) {}

    return result;
  }

  async getRows(): Promise<RowTableType[]> {
    const requestConfig = this.getConfig("GET", this.getPath(), "");
    let result: RowTableType[] = [];

    try {
      const response: { data: RowServerType[] } = await axios(requestConfig);

      if (response.data) {
        result = response.data.map((row) => this.mapServerToTable(row));
      }
    } catch (exc) {}

    return result;
  }

  async createRow(row: RowTableType): Promise<void> {
    const rowServer: RowServerType = this.mapTableToServer(row);
    const requestConfig = this.getConfig(
      "POST",
      this.createPath(),
      JSON.stringify(rowServer),
    );

    try {
      await axios(requestConfig);
    } catch (exc) {}

    return;
  }

  async updateRow(row: RowTableType): Promise<void> {
    const rowServer: RowServerType = this.mapTableToServer(row);
    const requestConfig = this.getConfig(
      "PATCH",
      this.updatePath(rowServer.id),
      JSON.stringify(rowServer),
    );

    try {
      await axios(requestConfig);
    } catch (exc) {}

    return;
  }

  async deleteRow(row: RowTableType): Promise<void> {
    const requestConfig = this.getConfig("DELETE", this.deletePath(row.id), "");

    try {
      await axios(requestConfig);
    } catch (exc) {}

    return;
  }
}

export default BaseServer;
