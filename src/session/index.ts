import fs from "fs";
import crypto from "crypto";

interface SessionData {
  phone: string;
  auth: string;
  guid: string;
  agent: string;
  private_key: string;
}

class SessionManager {
  private secretKey: string;
  private filename: string;
  private iv: Buffer;

  constructor(filename: string) {
    this.secretKey = "12345678901234567890123456789012";
    this.iv = crypto.randomBytes(16);
    this.filename = filename + ".json";
  }

  private encrypt(sessionData: SessionData): string {
    const cipher = crypto.createCipheriv(
      "aes-256-cbc",
      Buffer.from(this.secretKey),
      this.iv
    );
    let encrypted = cipher.update(JSON.stringify(sessionData), "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
  }

  private decrypt(encryptedData: string, iv: Buffer): SessionData {
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(this.secretKey),
      iv
    );
    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return JSON.parse(decrypted) as SessionData;
  }

  public saveSession(sessionData: SessionData): void {
    const encryptedData = this.encrypt(sessionData);
    const dataToWrite = {
      iv: this.iv.toString("hex"),
      encryptedData: encryptedData,
    };

    fs.writeFileSync(this.filename, JSON.stringify(dataToWrite, null, 2));
  }

  public getSession(): SessionData | null {
    try {
      if (!fs.existsSync(this.filename)) {
        const defaultSessionData: SessionData = {
          phone: "",
          auth: "",
          guid: "",
          agent: "",
          private_key: "",
        };

        this.saveSession(defaultSessionData);
        return defaultSessionData;
      }

      const rawData = fs.readFileSync(this.filename, "utf8");
      const parsedData = JSON.parse(rawData);

      return this.decrypt(
        parsedData.encryptedData,
        Buffer.from(parsedData.iv, "hex")
      );
    } catch (error) {
      console.error("Error reading or decrypting session data:", error);
      return null;
    }
  }
}

export default SessionManager;