import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { AppSettings } from "../core/appSettings";
import { FIKey, User } from "../core/models";
import PlaidService from "../core/plaidService";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest, user:User): Promise<void> {
    const plaidService = new PlaidService();
    await plaidService.loadSettingsFrom(new AppSettings());
    const {
        webhookCode: webhookCode,
        itemId: plaidItemId,
    } = req.body;


    // todo: validate caller as Plaid.
    // todo: validate the type of webhook call: switch (webhookCode) ... case "transactions" ...
    // todo: validate provided input matches itemId for the user.

    const fiKey:FIKey = user.fiKeys.find(key => key.itemId == plaidItemId);
    if (!fiKey)
        throw new Error("Invalid itemId provided for the given user.");
        
    const resp = await plaidService.transactionSync(fiKey);

    context.bindings.transactionsQueue = resp.added;
    context.res = {
        body: `${resp.added.length} transactions queued for user ${user.id}.`
    };

};

export default httpTrigger;