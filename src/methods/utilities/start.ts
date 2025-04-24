import Client from "../..";
import Crypto from "../../crypto";
import input from "input";

async function start(this: Client): Promise<void> {
  const DBInformation = this.sessionDb.getSession();

  if (DBInformation) {
    this.auth = DBInformation.auth;
    this.userGuid = DBInformation.guid;
    this.privateKey = DBInformation.private_key;

    if (typeof DBInformation.agent === "string")
      this.userAgent = DBInformation.agent || this.userAgent;
  }

  try {
    this.key = Buffer.from(Crypto.passphrase(this.auth), "utf8");
    this.decode_auth = Crypto.decode_auth(this.auth);
    const result = await this.getMe();
    this.userGuid = result.user.user_guid;
    this.initialize = true;
  } catch (error) {
    let phone_number: string = await input.text("Phone Number: ");
    let is_phone_number_true = true;
    const phoneRegex = /^[0-9]{11}$/;

    while (is_phone_number_true) {
      const answer = await input.text(
        `Is the ${phone_number} correct [y or n]: `
      );
      if (answer.toLowerCase() === "y" && phoneRegex.test(phone_number)) {
        is_phone_number_true = false;
      } else {
        phone_number = await input.text("Phone Number ex -> (09123456789) : ");
      }
    }

    phone_number = `98${phone_number.slice(1)}`;

    let result = await this.sendCode(phone_number);

    if (result.status == "SendPassKey") {
      while (true) {
        let pass_key = await input.text(
          `Password [${result.hint_pass_key}] > `
        );
        result = await this.sendCode(
          (phone_number = phone_number),
          (pass_key = pass_key)
        );

        if (result.status == "OK") break;
      }
    }

    let [publicKey, privateKey] = Crypto.createKeys();

    this.privateKey = privateKey;

    while (true) {
      let phone_code = await input.text("Code: ");

      let response = await this.signIn(
        phone_code,
        phone_number,
        result.phone_code_hash,
        publicKey
      );

      if (response.status === "OK") {
        response.auth = Crypto.decrypt_RSA_OAEP(this.privateKey, response.auth);
        this.key = Buffer.from(Crypto.passphrase(response.auth), "utf8");
        this.auth = response.auth;
        this.decode_auth = Crypto.decode_auth(this.auth);

        this.sessionDb.saveSession({
          phone: response.user.phone,
          auth: this.auth,
          guid: response.user.user_guid,
          agent: this.userAgent,
          private_key: this.privateKey,
        });

        await this.registerDevice();
        break;
      }
    }

    this.initialize = true;
  }
}

export default start;
