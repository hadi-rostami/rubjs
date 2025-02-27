import axios, { AxiosRequestConfig } from "axios";
import Client from "../..";

async function post(
  this: Client,
  url: string,
  data: any,
  config: AxiosRequestConfig<any>
) {
  return await axios.post(url, data, config);
}

export default post;
