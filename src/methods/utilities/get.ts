import axios, { AxiosRequestConfig } from "axios";
import Client from "../..";

async function get(this: Client, url: string, config: AxiosRequestConfig<any>) {
  return await axios.get(url, config);
}

export default get;
