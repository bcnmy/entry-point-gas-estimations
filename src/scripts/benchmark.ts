import { table } from "console";
import { EntryPointVersion } from "../entrypoint/shared/types";
import { BenchmarkResults } from "../gas-estimator/refactored/utils";

const benchmarkResults: BenchmarkResults = {
  v060: {
    "Ethereum Mainnet": {
      smartAccountDeployment: "0.00321422881459185 ETH (12.4326 USD)",
      nativeTransfer: "0.0010344416534865 ETH ($4.0012)",
    },
    "Optimism Mainnet": {
      smartAccountDeployment: "0.000000527416057392 ETH (0.0020 USD)",
      nativeTransfer: "0.000000283199727336 ETH ($0.0011)",
    },
    "Binance Smart Chain": {
      smartAccountDeployment: "0.000340347 BNB (0.2437 USD)",
      nativeTransfer: "0.000138575 BNB ($0.0992)",
    },
    "Binance Smart Chain Testnet": {
      smartAccountDeployment: "0.000340347 tBNB (0.2437 USD)",
      nativeTransfer: "0.000138563 tBNB ($0.0992)",
    },
    "Gnosis Mainnet": {
      smartAccountDeployment: "0.000408445202042226 XDAI (0.0004 USD)",
      nativeTransfer: "0.00014379000071895 XDAI ($0.0001)",
    },
    "Polygon Mainnet": {
      smartAccountDeployment: "0.015630613159045005 POL (0.0094 USD)",
      nativeTransfer: "0.006367088793960021 POL ($0.0038)",
    },
    "Manta Pacific Testnet": {
      smartAccountDeployment: "0.000001021161823185 ETH (0.0039 USD)",
      nativeTransfer: "",
    },
    "X Layer Mainnet": {
      smartAccountDeployment: "0.002261778585 OKB (0.1218 USD)",
      nativeTransfer: "",
    },
    "opBNB Mainnet": {
      smartAccountDeployment: "0.000000652707 BNB (0.0005 USD)",
      nativeTransfer: "0.000000347485 BNB ($0.0002)",
    },
    "Boba Mainnet": {
      smartAccountDeployment: "0.000018501529502511 ETH (0.0716 USD)",
      nativeTransfer: "",
    },
    "Polygon ZK-EVM Mainnet": {
      smartAccountDeployment: "0.000038459437 ETH (0.1488 USD)",
      nativeTransfer: "",
    },
    "Lisk Mainnet": {
      smartAccountDeployment: "0.000001201840646748 ETH (0.0046 USD)",
      nativeTransfer: "",
    },
    "Sei Atlantic 2 Testnet": {
      smartAccountDeployment: "0.000409998504342411 SEI (0.0002 USD)",
      nativeTransfer: "",
    },
    "Sei Mainnet": {
      smartAccountDeployment: "0.000477857492620821 SEI (0.0003 USD)",
      nativeTransfer: "",
    },
    "Combo Testnet": {
      smartAccountDeployment: "0.00000323170908512 undefined (0 USD)",
      nativeTransfer: "",
    },
    "Metal L2 Testnet": {
      smartAccountDeployment: "0.000109881770275992 undefined (0 USD)",
      nativeTransfer: "0.00008500913000643 undefined ($0)",
    },
    "Metal L2 Mainnet": {
      smartAccountDeployment: "0.00002496407187357 ETH (0.0966 USD)",
      nativeTransfer: "0.000019201968243642 ETH ($0.0743)",
    },
    "Morph Holesky Testnet": {
      smartAccountDeployment: "0.0000684826452 ETH (0.2649 USD)",
      nativeTransfer: "0.0000278909476 ETH ($0.1079)",
    },
    "Morph Mainnet": {
      smartAccountDeployment: "0.000003017146544811 ETH (0.0117 USD)",
      nativeTransfer: "0.000001228774455843 ETH ($0.0048)",
    },
    "Lisk Sepolia Testnet": {
      smartAccountDeployment: "0.000002109209897013 ETH (0.0082 USD)",
      nativeTransfer: "",
    },
    "Gold Chain Mainnet": {
      smartAccountDeployment: "0.000000345398933795 undefined (0 USD)",
      nativeTransfer: "",
    },
    "Mantle Mainnet": {
      smartAccountDeployment: "0.00218006592 MNT (0.0026 USD)",
      nativeTransfer: "0.001743232488 MNT ($0.0021)",
    },
    "Mantle Testnet": {
      smartAccountDeployment: "0.010088805648 MNT (0.0122 USD)",
      nativeTransfer: "",
    },
    "Mantle Sepolia Testnet": {
      smartAccountDeployment: "0.010624937616 MNT (0.0129 USD)",
      nativeTransfer: "",
    },
    "Base Mainnet": {
      smartAccountDeployment: "0.000006856642600822 ETH (0.0265 USD)",
      nativeTransfer: "0.000002457485114517 ETH ($0.0095)",
    },
    "Combo Mainnet": {
      smartAccountDeployment: "0.000000918621267517 undefined (0 USD)",
      nativeTransfer: "",
    },
    "ZeroOne Mainnet": {
      smartAccountDeployment: "0.010211850000340395 undefined (0 USD)",
      nativeTransfer: "",
    },
    "Boba Sepolia Testnet": {
      smartAccountDeployment: "0.000075692578332852 ETH (0.2928 USD)",
      nativeTransfer: "",
    },
    "Arbitrum Mainnet": {
      smartAccountDeployment: "0.00000608298 ETH (0.0235 USD)",
      nativeTransfer: "0.000003375696 ETH ($0.0131)",
    },
    "Avalanche Fuji Testnet": {
      smartAccountDeployment: "0.000408445200340371 AVAX (0.0203 USD)",
      nativeTransfer: "",
    },
    "Avalanche Mainnet": {
      smartAccountDeployment: "0.000412064718148098 AVAX (0.0205 USD)",
      nativeTransfer: "0.000167792667032762 AVAX ($0.0083)",
    },
    "ZeroOne Testnet": {
      smartAccountDeployment: "0.010211850000340395 undefined (0 USD)",
      nativeTransfer: "",
    },
    "Linea Mainnet": {
      smartAccountDeployment: "0.000036563209093722 ETH (0.1414 USD)",
      nativeTransfer: "",
    },
    "Polygon Amoy": {
      smartAccountDeployment: "0.012254220001021185 POL (0.0073 USD)",
      nativeTransfer: "0.004991724000415977 POL ($0.0030)",
    },
    "Berachain bArtio Testnet": {
      smartAccountDeployment: "0.004187288402205645 BERA (0.0000 USD)",
      nativeTransfer: "0.001705533204367297 BERA ($0.0000)",
    },
    "Blast Mainnet": {
      smartAccountDeployment: "0.000000544199877732 ETH (0.0021 USD)",
      nativeTransfer: "",
    },
    "Base Sepolia Testnet": {
      smartAccountDeployment: "0.000000530941558992 ETH (0.0021 USD)",
      nativeTransfer: "",
    },
    "Chiliz Spicy Testnet": {
      smartAccountDeployment: "0.994435115 CHZ (0.1098 USD)",
      nativeTransfer: "0.27398455 CHZ ($0.0302)",
    },
    "Chiliz Mainnet": {
      smartAccountDeployment: "0.994435115 CHZ (0.1098 USD)",
      nativeTransfer: "0.273954538 CHZ ($0.0302)",
    },
    "Arbitrum Sepolia Testnet": {
      smartAccountDeployment: "0.0000444582 ETH (0.1720 USD)",
      nativeTransfer: "",
    },
    "Scroll Sepolia Testnet": {
      smartAccountDeployment: "0.000018880645540122 ETH (0.0730 USD)",
      nativeTransfer: "0.000007688194914418 ETH ($0.0297)",
    },
    "Scroll Mainnet": {
      smartAccountDeployment: "0.000020687825623104 ETH (0.0800 USD)",
      nativeTransfer: "0.000008425536991552 ETH ($0.0326)",
    },
    "Ethereum Sepolia": {
      smartAccountDeployment: "0.018733963697988 ETH (72.4630 USD)",
      nativeTransfer: "",
    },
    "Optimism Testnet": {
      smartAccountDeployment: "0.000001693544298465 ETH (0.0066 USD)",
      nativeTransfer: "0.000001168969109315 ETH ($0.0045)",
    },
    "Blast Sepolia Testnet": {
      smartAccountDeployment: "0.000000340449784794 ETH (0.0013 USD)",
      nativeTransfer: "",
    },
    "Degen Mainnet": {
      smartAccountDeployment: "0.04084452 DEGEN (0.0006 USD)",
      nativeTransfer: "",
    },
  },
  v070: {},
};

function benchmarkResultsToMarkdownTable(benchmarkResults: BenchmarkResults) {
  const entryPoints = Object.keys(benchmarkResults).map(
    (k) => k as EntryPointVersion
  );

  const header = ["Chain", "Smart Account Deployment", "Native Transfer"];

  const chains = Object.keys(benchmarkResults[entryPoints[0]]);
  chains.sort();

  let maxColumnLength = 0;
  const rows = chains.map((chain) => {
    const row = [chain];
    const { smartAccountDeployment, nativeTransfer } =
      benchmarkResults[entryPoints[0]][chain];

    row.push(smartAccountDeployment);
    row.push(nativeTransfer);
    maxColumnLength = Math.max(
      maxColumnLength,
      smartAccountDeployment.length,
      nativeTransfer.length
    );

    // console.log(row);
    // const { smartAccountDeployment, nativeTransfer } =
    //   benchmarkResults[entryPoint][chain];
    // row.push(`${smartAccountDeployment} | ${nativeTransfer}`);
    return row;
  });

  // console.log(rows);

  const tableHeader = `| ${header.join(" | ")} |`;
  const delimiter = `| ---- | ---- | ---- |`;

  const resultRows = rows.map((row) => "| " + row.join(" | ") + " | ");
  console.log(resultRows);

  const tableRows = [tableHeader, delimiter, ...resultRows];

  // console.log(tableRows);
  const markdownTable = tableRows.join("\n");
  console.log(markdownTable);
}

benchmarkResultsToMarkdownTable(benchmarkResults);
