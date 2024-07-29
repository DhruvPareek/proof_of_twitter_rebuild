import { bytesToBigInt, fromHex } from "@zk-email/helpers";
import { generateEmailVerifierInputs } from "@zk-email/helpers/dist/input-generators";
import fs from "fs"
import path from "path"

export const STRING_PRESELECTOR = "email was meant for @";
export type IExampleCircuitInputs = {
  twitterUsernameIndex: string;
  address: string;
  emailHeader: string[];
  emailHeaderLength: string;
  pubkey: string[];
  signature: string[];
  emailBody?: string[] | undefined;
  emailBodyLength?: string | undefined;
  precomputedSHA?: string[] | undefined;
  bodyHashIndex?: string | undefined;
};

export async function generateTwitterVerifierCircuitInputs(
  email: string | Buffer,
  ethereumAddress: string
)/*: Promise<ITwitterCircuitInputs> */{
  const emailVerifierInputs = await generateEmailVerifierInputs(email, {
    shaPrecomputeSelector: STRING_PRESELECTOR,
  });

  const bodyRemaining = emailVerifierInputs.emailBody!.map((c) => Number(c)); // Char array to Uint8Array
  const selectorBuffer = Buffer.from(STRING_PRESELECTOR);
  const usernameIndex =
    Buffer.from(bodyRemaining).indexOf(selectorBuffer) + selectorBuffer.length;

  const address = bytesToBigInt(fromHex(ethereumAddress)).toString();

  const inputJson = {
    ...emailVerifierInputs,
    twitterUsernameIndex: usernameIndex.toString(),
    address,
  };
  fs.writeFileSync("./input.json", JSON.stringify(inputJson))
}

(async () => {
    await generateTwitterVerifierCircuitInputs(fs.readFileSync(path.join(__dirname, "./emls/xReset.eml")), "0x1234567890123456789012345678901234567890");
}) ();
