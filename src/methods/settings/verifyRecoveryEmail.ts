import Client from "../..";

async function verifyRecoveryEmail(
  this: Client,
  password: string,
  code: string
) {
  return await this.builder("verifyRecoveryEmail", { password, code });
}

export default verifyRecoveryEmail;
