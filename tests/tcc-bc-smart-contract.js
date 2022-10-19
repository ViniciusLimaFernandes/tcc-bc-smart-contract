import * as anchor from '@project-serum/anchor';
import { Program, utils } from '@project-serum/anchor';
import assert from 'assert';
const { SystemProgram } = anchor.web3;

describe("mysolanaapp", () => {
  /* create and set a Provider */
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.TccBcSmartContract;

  /* Call the create function via RPC */
  const baseAccount = anchor.web3.Keypair.generate();

  const pubKey = provider.wallet.publicKey;

  const kwhPrice = 40; // cents

  const hubName = "A01-Test";

  const [hubAccount] = utils.publicKey.findProgramAddressSync([utils.bytes.utf8.encode("tcc_bc_smart_contract"), provider.wallet.publicKey.toBuffer()], program.programId);

  it("Creates a hub", async () => {
    const totalPorts = 3;

    await program.methods
      .create(kwhPrice, totalPorts, hubName)
      .accounts({
        hub: hubAccount,
        user: pubKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    // await program.rpc.create(kwhPrice, totalPorts, hubName, {
    //   accounts: {
    //     hub: baseAccount.publicKey,
    //     user: pubKey,
    //     systemProgram: SystemProgram.programId,
    //   },
    //   signers: [baseAccount],
    // });

    /* Fetch the account and check the value of count */
    const account = await program.account.hub.fetch(hubAccount);

    console.log("Created Hub: ");
    console.log(account);

    console.log(`KWH PRICE: ${account.kwhPrice.toString()} cents`);
    console.log(`HUB NAME: ${account.name.toString()}`);
    assert.equal(totalPorts, account.totalPorts);
    assert.equal(kwhPrice.toString(), account.kwhPrice.toString());
    assert.equal(pubKey.toString(), account.owner.toString());
    assert.ok(account.usages.toString() == 0);
    assert.ok(account.balance.toString() == 0);
    assert.ok(account.name.toString() == hubName)
  });

  // it("Use hub", async () => {
  //   await program.rpc.useHub(
  //     new anchor.BN(0.75 * anchor.web3.LAMPORTS_PER_SOL),
  //     {
  //       accounts: {
  //         hub: baseAccount.publicKey,
  //         user: pubKey,
  //         systemProgram: SystemProgram.programId,
  //       },
  //     }
  //   );

  //   const account = await program.account.hub.fetch(baseAccount.publicKey);

  //   console.log("Usages 1: ", account.usages.toString());
  //   console.log("Owner: ", account.owner.toString());
  //   assert.ok(account.usages.toString() == 1);
  //   assert.ok(account.owner.toString() == pubKey.toString());
  //   assert.ok(account.balance > 0);
  //   console.log(`Total balance: ${account.balance.toString()}`);
  // });

  // it("Withdraw from hub", async () => {
  //   await program.rpc.withdraw({
  //     accounts: {
  //       hub: baseAccount.publicKey,
  //       user: pubKey,
  //     },
  //   });

  //   const account = await program.account.hub.fetch(baseAccount.publicKey);

  //   console.log("Balance after withdraw: ", account.balance.toString());
  // });
});
