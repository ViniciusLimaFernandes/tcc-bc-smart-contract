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

  it("Creates a hub", async () => {
    const totalPorts = 3;
    const kwhPrice = 471; // cents

    await program.rpc.create(kwhPrice, totalPorts, {
      accounts: {
        hub: baseAccount.publicKey,
        user: pubKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [baseAccount],
    });

    /* Fetch the account and check the value of count */
    const account = await program.account.hub.fetch(baseAccount.publicKey);

    console.log("Created Hub: ");
    console.log(account);

    assert.equal(totalPorts, account.totalPorts);
    assert.equal(kwhPrice, account.kwhPrice);
    assert.equal(pubKey.toString(), account.authority.toString());
    assert.ok(account.usages.toString() == 0);
  });

  it("Use hub", async () => {
    await program.rpc.incrementUsages({
      accounts: {
        hub: baseAccount.publicKey,
      },
    });

    const account = await program.account.hub.fetch(baseAccount.publicKey);

    console.log("Usages 1: ", account.usages.toString());
    console.log("Owner: ", account.authority.toString());
    assert.ok(account.usages.toString() == 1);
    assert.ok(account.authority.toString() == pubKey.toString());
  });
});
