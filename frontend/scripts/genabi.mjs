import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

const CONTRACT_NAME = "ShieldPool";

// backend directory relative to frontend
const rel = "../backend";

// output dir for generated ABI/addresses
const outdir = path.resolve("./abi");

if (!fs.existsSync(outdir)) {
  fs.mkdirSync(outdir);
}

const dir = path.resolve(rel);
const dirname = path.basename(dir);

const line = "\n===================================================================\n";

if (!fs.existsSync(dir)) {
  console.error(`${line}Unable to locate ${rel}. Expecting <root>/SheildPool/${dirname}${line}`);
  process.exit(1);
}

if (!fs.existsSync(outdir)) {
  console.error(`${line}Unable to locate ${outdir}.${line}`);
  process.exit(1);
}

const deploymentsDir = path.join(dir, "deployments");

function readArtifactABI(contractName) {
  try {
    const artifactFile = path.join(dir, "artifacts", "contracts", `${contractName}.sol`, `${contractName}.json`);
    const jsonString = fs.readFileSync(artifactFile, "utf-8");
    const obj = JSON.parse(jsonString);
    return obj.abi;
  } catch (e) {
    return undefined;
  }
}

function deployOnHardhatNode() {
  if (process.platform === "win32") {
    // Not supported on Windows
    return;
  }
  try {
    execSync(`./deploy-hardhat-node.sh`, {
      cwd: path.resolve("./scripts"),
      stdio: "inherit",
    });
  } catch (e) {
    console.error(`${line}Script execution failed: ${e}${line}`);
    process.exit(1);
  }
}

function readDeployment(chainName, chainId, contractName, optional) {
  const chainDeploymentDir = path.join(deploymentsDir, chainName);

  if (!fs.existsSync(chainDeploymentDir) && chainId === 31337) {
    deployOnHardhatNode();
  }

  if (!fs.existsSync(chainDeploymentDir)) {
    console.error(
      `${line}Unable to locate '${chainDeploymentDir}' directory.\n\n1. Goto '${dirname}' directory\n2. Run 'npx hardhat deploy --network ${chainName}'.${line}`
    );
    if (!optional) {
      process.exit(1);
    }
    return undefined;
  }

  const jsonString = fs.readFileSync(
    path.join(chainDeploymentDir, `${contractName}.json`),
    "utf-8"
  );

  const obj = JSON.parse(jsonString);
  obj.chainId = chainId;

  return obj;
}

let deployLocalhost = readDeployment("localhost", 31337, CONTRACT_NAME, true /* optional */);
let deploySepolia = readDeployment("sepolia", 11155111, CONTRACT_NAME, true /* optional */);

const artifactAbi = readArtifactABI(CONTRACT_NAME);

if (!deployLocalhost) {
  if (artifactAbi) {
    deployLocalhost = { abi: artifactAbi, address: "0x0000000000000000000000000000000000000000" };
  }
}

if (!deploySepolia) {
  if (artifactAbi) {
    deploySepolia = { abi: artifactAbi, address: "0x0000000000000000000000000000000000000000" };
  } else if (deployLocalhost) {
    deploySepolia = { abi: deployLocalhost.abi, address: "0x0000000000000000000000000000000000000000" };
  }
}

if (deployLocalhost && deploySepolia) {
  if (JSON.stringify(deployLocalhost.abi) !== JSON.stringify(deploySepolia.abi)) {
    console.error(
      `${line}Deployments on localhost and Sepolia differ. Cant use the same abi on both networks. Consider re-deploying the contracts on both networks.${line}`
    );
    process.exit(1);
  }
}

const tsCode = `
/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const ${CONTRACT_NAME}ABI = ${JSON.stringify({ abi: (deployLocalhost?.abi ?? deploySepolia?.abi) }, null, 2)} as const;
`;
const tsAddresses = `
/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const ${CONTRACT_NAME}Addresses = { 
  "11155111": { address: "${deploySepolia.address}", chainId: 11155111, chainName: "sepolia" },
  "31337": { address: "${deployLocalhost.address}", chainId: 31337, chainName: "hardhat" },
};
`;

console.log(`Generated ${path.join(outdir, `${CONTRACT_NAME}ABI.ts`)}`);
console.log(`Generated ${path.join(outdir, `${CONTRACT_NAME}Addresses.ts`)}`);

fs.writeFileSync(path.join(outdir, `${CONTRACT_NAME}ABI.ts`), tsCode, "utf-8");
fs.writeFileSync(path.join(outdir, `${CONTRACT_NAME}Addresses.ts`), tsAddresses, "utf-8");


