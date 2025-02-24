import Database from "better-sqlite3";

interface SessionData {
  phone: string;
  auth: string;
  guid: string;
  agent: string;
  private_key: string;
}

class SQLiteSession {
  private dbFile: string;
  private db: Database.Database;

  constructor(sessionName: string) {
    this.dbFile = sessionName.endsWith(".rp") ? sessionName : `${sessionName}.rp`;
    this.db = new Database(this.dbFile);
    this.initializeDB();
  }


  private handleError<T>(operation: string, callback: () => T): T {
    try {
      return callback();
    } catch (error) {
      console.error(`Error in ${operation}:`, error);
      throw new Error(`Failed to execute ${operation}`);
    }
  }

  private initializeDB(): void {
    this.handleError("initializeDB", () => {
      this.db.pragma("journal_mode = DELETE");

      const sessionTable = this.db
        .prepare("SELECT name FROM sqlite_master WHERE type=? AND name=?")
        .get("table", "session");

      if (!sessionTable) {
        this.db.prepare(
          `CREATE TABLE session (
            phone TEXT PRIMARY KEY, 
            auth TEXT, 
            guid TEXT, 
            agent TEXT, 
            private_key TEXT
          )`
        ).run();
      }
    });
  }

  getSession(): SessionData | null {
    return this.handleError("getSession", () => {
      const result = this.db.prepare("SELECT * FROM session").get();
      return result ? (result as SessionData) : null;
    });
  }

  saveSession(
    phone: string,
    auth: string,
    guid: string,
    agent: string,
    privateKey: string
  ): void {
    this.handleError("saveSession", () => {
      this.db.prepare(
        `INSERT OR REPLACE INTO session (phone, auth, guid, agent, private_key) 
         VALUES (?, ?, ?, ?, ?)`
      ).run(phone, auth, guid, agent, privateKey);
    });
  }

  closeDB(): void {
    this.handleError("closeDB", () => {
      this.db.close();
    });
  }
}

export default SQLiteSession;
