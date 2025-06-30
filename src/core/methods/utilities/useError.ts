import { ClientTypes } from "../../../types/index.type";
import Client from "../../client";

async function useError(this: Client, mw: ClientTypes.ErrorMiddleware): Promise<void> {
    this.errorMiddlewares.push(mw);
}

export default useError;
