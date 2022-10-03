const assert = require("assert");
const anchor = require("@project-serum/anchor");
const { SystemProgram } = anchor.web3;

describe("mysolanaapp", () => {
  /* create and set a Provider */
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.TccBcSmartContract;

  /* Call the create function via RPC */
  const baseAccount = anchor.web3.Keypair.generate();

  const pubKey = provider.wallet.publicKey;

  it("Creates a counter", async () => {
    await program.rpc.create({
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: pubKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [baseAccount],
    });

    /* Fetch the account and check the value of count */
    const account = await program.account.baseAccount.fetch(
      baseAccount.publicKey
    );
    console.log("Count 0: ", account.count.toString());
    assert.ok(account.count.toString() == 0);
  });

  it("Increments the counter for the owner", async () => {
    await program.rpc.increment({
      accounts: {
        baseAccount: baseAccount.publicKey,
      },
    });

    const account = await program.account.baseAccount.fetch(
      baseAccount.publicKey
    );
    console.log("Count 1: ", account.count.toString());
    console.log("Owner: ", account.authority.toString());
    assert.ok(account.count.toString() == 1);
    assert.ok(account.authority.toString() == pubKey.toString());
  });
});
