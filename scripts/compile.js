const fs = require('fs');
const path = require('path');
const solc = require('solc');

const contractsDir = path.resolve(__dirname, '../contracts');
const abiDir = path.resolve(__dirname, '../abi');
const feAbiDir = path.resolve(__dirname, '../template-fe-arbitrum-workshop/src/abi');

const contractFiles = [
  'SafeToken.sol',
  'MintableToken.sol',
  'TaxToken.sol',
  'HoneypotTestToken.sol'
];

const sources = {};
contractFiles.forEach((file) => {
  const filePath = path.join(contractsDir, file);
  sources[file] = {
    content: fs.readFileSync(filePath, 'utf8')
  };
});

const input = {
  language: 'Solidity',
  sources,
  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    },
    outputSelection: {
      '*': {
        '*': ['abi', 'evm.bytecode', 'evm.deployedBytecode']
      }
    }
  }
};

console.log('Compiling contracts with solc...');
const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
  let hasErrors = false;
  output.errors.forEach((err) => {
    if (err.severity === 'error') {
      hasErrors = true;
      console.error(err.formattedMessage);
    } else {
      console.warn(err.formattedMessage);
    }
  });
  if (hasErrors) {
    process.exit(1);
  }
}

const buildArtifacts = {};

for (const contractFile in output.contracts) {
  for (const contractName in output.contracts[contractFile]) {
    const artifact = output.contracts[contractFile][contractName];
    const abi = artifact.abi;
    const bytecode = '0x' + artifact.evm.bytecode.object;
    const deployedBytecode = '0x' + artifact.evm.deployedBytecode.object;

    buildArtifacts[contractName] = {
      contractName,
      sourceName: contractFile,
      abi,
      bytecode,
      deployedBytecode
    };

    // Write ABI JSON
    fs.writeFileSync(path.join(abiDir, `${contractName}.json`), JSON.stringify(abi, null, 2));
    fs.writeFileSync(path.join(feAbiDir, `${contractName}.json`), JSON.stringify(abi, null, 2));
    console.log(`[Compiled] ${contractName} -> ABI and Bytecode generated.`);
  }
}

// Save complete artifacts
fs.writeFileSync(path.resolve(__dirname, 'artifacts.json'), JSON.stringify(buildArtifacts, null, 2));
console.log('All contracts compiled successfully!');
