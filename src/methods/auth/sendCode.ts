import Client from "../..";

async function sendCode(
  this: Client,
  phone_number: string,
  pass_key: string = null,
  send_type: string = "SMS"
) {
  if (!["SMS", "Internal"].includes(send_type))
    throw new Error("send_type can only be `SMS` or `Internal`.");

  const data = {
    phone_number,
    pass_key,
    send_type,
  };

  const result = await this.builder("sendCode", data, true);

  return result;
}

export default sendCode;
