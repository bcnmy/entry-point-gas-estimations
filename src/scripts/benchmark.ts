import { EntryPointVersion } from "../entrypoint/shared/types";
import { BenchmarkResults } from "../gas-estimator/utils";

const benchmarkResults: BenchmarkResults = {
  v060: {
    "Ethereum Mainnet": {
      smartAccountDeployment: "0.004995977998096635 ETH ($19.3244)",
      nativeTransfer: "0.00160786553765915 ETH ($6.2192)",
    },
    "Optimism Mainnet": {
      smartAccountDeployment: "0.00000063681287328 ETH ($0.0025)",
      nativeTransfer: "0.00000036551389824 ETH ($0.0014)",
    },
    "Binance Smart Chain": {
      smartAccountDeployment: "0.000340347 BNB ($0.2437)",
      nativeTransfer: "0.000138575 BNB ($0.0992)",
    },
    "Binance Smart Chain Testnet": {
      smartAccountDeployment: "0.000340347 tBNB ($0.2437)",
      nativeTransfer: "0.000138563 tBNB ($0.0992)",
    },
    "Gnosis Mainnet": {
      smartAccountDeployment: "0.000396191847063339 XDAI ($0.0004)",
      nativeTransfer: "0.000139476301078425 XDAI ($0.0001)",
    },
    "Polygon Mainnet": {
      smartAccountDeployment: "0.015730166097164475 POL ($0.0094)",
      nativeTransfer: "0.006407086881045735 POL ($0.0038)",
    },
    "Manta Pacific Testnet": {
      smartAccountDeployment: "0.00000102117033186 ETH ($0.0039)",
      nativeTransfer: "",
    },
    "X Layer Mainnet": {
      smartAccountDeployment: "0.00337990389 OKB ($0.1820)",
      nativeTransfer: "",
    },
    "opBNB Mainnet": {
      smartAccountDeployment: "0.000000652707 BNB ($0.0005)",
      nativeTransfer: "0.000000347485 BNB ($0.0002)",
    },
    "Boba Mainnet": {
      smartAccountDeployment: "0.000026379702582846 ETH ($0.1020)",
      nativeTransfer: "",
    },
    "Polygon ZK-EVM Mainnet": {
      smartAccountDeployment: "0.000066027706 ETH ($0.2554)",
      nativeTransfer: "",
    },
    "Lisk Mainnet": {
      smartAccountDeployment: "0.00000171960966522 ETH ($0.0067)",
      nativeTransfer: "",
    },
    "Sei Atlantic 2 Testnet": {
      smartAccountDeployment: "0.0341087814 SEI ($0.0199)",
      nativeTransfer: "",
    },
    "Sei Mainnet": {
      smartAccountDeployment: "0.000411820240400298 SEI ($0.0002)",
      nativeTransfer: "",
    },
    "Combo Testnet": {
      smartAccountDeployment: "0.000004037223334683 BNB ($0.0029)",
      nativeTransfer: "",
    },
    "Metal L2 Testnet": {
      smartAccountDeployment: "0.000163900326954888 ETH ($0.6340)",
      nativeTransfer: "0.000126870932453958 ETH ($0.4907)",
    },
    "Metal L2 Mainnet": {
      smartAccountDeployment: "0.000038629071457518 ETH ($0.1494)",
      nativeTransfer: "0.000030005269855722 ETH ($0.1161)",
    },
    "Morph Holesky Testnet": {
      smartAccountDeployment: "0.0000684826452 ETH ($0.2649)",
      nativeTransfer: "0.0000278909476 ETH ($0.1079)",
    },
    "Morph Mainnet": {
      smartAccountDeployment: "0.000002538794962557 ETH ($0.0098)",
      nativeTransfer: "0.000001033959190341 ETH ($0.0040)",
    },
    "Lisk Sepolia Testnet": {
      smartAccountDeployment: "0.000002931620011796 ETH ($0.0113)",
      nativeTransfer: "",
    },
    "Gold Chain Mainnet": {
      smartAccountDeployment: "0.000000345660012356 ETH ($0.0013)",
      nativeTransfer: "",
    },
    "Mantle Mainnet": {
      smartAccountDeployment: "0.003624621816 MNT ($0.0044)",
      nativeTransfer: "0.002896488312 MNT ($0.0035)",
    },
    "Mantle Testnet": {
      smartAccountDeployment: "0.015214216704 MNT ($0.0184)",
      nativeTransfer: "",
    },
    "Mantle Sepolia Testnet": {
      smartAccountDeployment: "0.015214216704 MNT ($0.0184)",
      nativeTransfer: "",
    },
    "Base Mainnet": {
      smartAccountDeployment: "0.000007279579431554 ETH ($0.0282)",
      nativeTransfer: "0.000002628016350701 ETH ($0.0102)",
    },
    "Combo Mainnet": {
      smartAccountDeployment: "0.000000918621267517 BNB ($0.0007)",
      nativeTransfer: "",
    },
    "ZeroOne Mainnet": {
      smartAccountDeployment: "0.010211850000340395 AVAX ($0.5081)",
      nativeTransfer: "",
    },
    "Boba Sepolia Testnet": {
      smartAccountDeployment: "0.000126391906874304 ETH ($0.4889)",
      nativeTransfer: "",
    },
    "Arbitrum Mainnet": {
      smartAccountDeployment: "0.000006246648 ETH ($0.0242)",
      nativeTransfer: "0.000003543204 ETH ($0.0137)",
    },
    "Avalanche Fuji Testnet": {
      smartAccountDeployment: "0.000408445200340371 AVAX ($0.0203)",
      nativeTransfer: "",
    },
    "Avalanche Mainnet": {
      smartAccountDeployment: "0.000417752310750678 AVAX ($0.0208)",
      nativeTransfer: "0.000170108653550782 AVAX ($0.0085)",
    },
    "ZeroOne Testnet": {
      smartAccountDeployment: "0.010211850000340395 AVAX ($0.5081)",
      nativeTransfer: "",
    },
    "Linea Mainnet": {
      smartAccountDeployment: "0.000039184300728334 ETH ($0.1516)",
      nativeTransfer: "",
    },
    "Polygon Amoy": {
      smartAccountDeployment: "0.010211850001021185 POL ($0.0061)",
      nativeTransfer: "0.004159770000415977 POL ($0.0025)",
    },
    "Berachain bArtio Testnet": {
      smartAccountDeployment: "0.00539353656014151 BERA ($0.0000)",
      nativeTransfer: "0.002196852666619486 BERA ($0.0000)",
    },
    "Blast Mainnet": {
      smartAccountDeployment: "0.000000712094073873 ETH ($0.0028)",
      nativeTransfer: "",
    },
    "Base Sepolia Testnet": {
      smartAccountDeployment: "0.0000006029519846 ETH ($0.0023)",
      nativeTransfer: "",
    },
    "Chiliz Spicy Testnet": {
      smartAccountDeployment: "0.994435115 CHZ ($0.1098)",
      nativeTransfer: "0.27398455 CHZ ($0.0302)",
    },
    "Chiliz Mainnet": {
      smartAccountDeployment: "0.994435115 CHZ ($0.1098)",
      nativeTransfer: "0.273954538 CHZ ($0.0302)",
    },
    "Arbitrum Sepolia Testnet": {
      smartAccountDeployment: "0.00004907724 ETH ($0.1898)",
      nativeTransfer: "",
    },
    "Scroll Sepolia Testnet": {
      smartAccountDeployment: "0.000019298448900396 ETH ($0.0746)",
      nativeTransfer: "0.000007858324355324 ETH ($0.0304)",
    },
    "Scroll Mainnet": {
      smartAccountDeployment: "0.000019869132618288 ETH ($0.0769)",
      nativeTransfer: "0.000008092107644144 ETH ($0.0313)",
    },
    "Ethereum Sepolia": {
      smartAccountDeployment: "0.01909431775064352 ETH ($73.8568)",
      nativeTransfer: "",
    },
    "Optimism Testnet": {
      smartAccountDeployment: "0.000002104153262436 ETH ($0.0081)",
      nativeTransfer: "0.000001484757261318 ETH ($0.0057)",
    },
    "Blast Sepolia Testnet": {
      smartAccountDeployment: "0.000000340449784794 ETH ($0.0013)",
      nativeTransfer: "",
    },
    "Degen Mainnet": {
      smartAccountDeployment: "0.04084452 DEGEN ($0.0006)",
      nativeTransfer: "",
    },
  },
  v070: {
    "Ethereum Mainnet": {
      smartAccountDeployment: "0.007378329105994693 ETH ($28.5394)",
      nativeTransfer: "",
    },
    "Optimism Mainnet": {
      smartAccountDeployment: "0.000001167752462937 ETH ($0.0045)",
      nativeTransfer: "",
    },
    "Binance Smart Chain": {
      smartAccountDeployment: "0.000461057 BNB ($0.3301)",
      nativeTransfer: "",
    },
    "Binance Smart Chain Testnet": {
      smartAccountDeployment: "0.000461057 tBNB ($0.3301)",
      nativeTransfer: "",
    },
    "Gnosis Mainnet": {
      smartAccountDeployment: "0.000536514375687384 XDAI ($0.0005)",
      nativeTransfer: "",
    },
    "Polygon Mainnet": {
      smartAccountDeployment: "0.022769048851373979 POL ($0.0136)",
      nativeTransfer: "",
    },
    "Base Mainnet": {
      smartAccountDeployment: "0.000009981299887713 ETH ($0.0386)",
      nativeTransfer: "",
    },
    "Arbitrum Mainnet": {
      smartAccountDeployment: "0.000012426276 ETH ($0.0481)",
      nativeTransfer: "",
    },
    "Polygon Amoy": {
      smartAccountDeployment: "0.013557192601383387 POL ($0.0081)",
      nativeTransfer: "",
    },
    "Arbitrum Sepolia Testnet": {
      smartAccountDeployment: "0.00007701648 ETH ($0.2979)",
      nativeTransfer: "",
    },
    "Ethereum Sepolia": {
      smartAccountDeployment: "0.028422518370393686 ETH ($109.9383)",
      nativeTransfer: "",
    },
  },
};

function benchmarkResultsToMarkdownTable(benchmarkResults: BenchmarkResults) {
  const header = ["Chain", "Smart Account Deployment", "Native Transfer"];

  const v6results = benchmarkResults[EntryPointVersion.v060];
  const v7results = benchmarkResults[EntryPointVersion.v070];

  const resultsToRows = (results: Record<string, any>) => {
    const chains = Object.keys(results);
    chains.sort();

    return chains.map((chain) => {
      const { smartAccountDeployment, nativeTransfer } = results[chain];

      return [chain, smartAccountDeployment, nativeTransfer];
    });
  };

  const tableHeader = `| ${header.join(" | ")} |`;
  const delimiter = `| ---- | ---- | ---- |`;

  const v6rows = resultsToRows(v6results);
  const v6ResultRows = v6rows.map((row) => "| " + row.join(" | ") + " | ");

  const v6TableRows = [tableHeader, delimiter, ...v6ResultRows];

  const v6MarkdownTable = v6TableRows.join("\n");

  console.log("# Gas Estimation Benchmark Results");

  console.log("## EntryPoint v0.6.0");
  console.log();
  console.log(v6MarkdownTable);
  console.log();

  const v7Rows = resultsToRows(v7results);
  const v7ResultRows = v7Rows.map((row) => "| " + row.join(" | ") + " | ");

  const v7TableRows = [tableHeader, delimiter, ...v7ResultRows];
  const v7MarkdownTable = v7TableRows.join("\n");

  console.log("## EntryPoint v0.7.0");
  console.log();
  console.log(v7MarkdownTable);
}

benchmarkResultsToMarkdownTable(benchmarkResults);
