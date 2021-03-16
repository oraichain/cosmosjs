# Oraichain Cosmosjs CLI installation and usage

## Prerequisites

### 1. Install dependencies

```bash
npm install --global yarn && yarn
```

### 2. Create .env file according to the .env.example file

## Use oraicli to interact with the Oraichain network

### Simplest way to deploy scripts

This is a aggregated way to deploy data sources, test cases and oracle scripts with one command. Type:

```bash
./deploy_ai_services.sh <datasource1,datasource2,...> <testcas1,testcase2,...> <oracle-script> <ds-init-in-json-string> <tc-init-in-json-string> <os-init-in-json-string> <identifier number> ../oraiwasm/smart-contracts/package/cv

Eg:

./deploy_ai_services.sh classification,cv009 '' '' '' '' '' 7 ../oraiwasm/smart-contracts/package/cv
```

If the scripts have been deployed and you run the above command again, it will deploy new smart contracts, and check if the data sources, test cases, and oracle scripts exist or not. If not => create new, if yes then edit accordingly.

### Deploy smart contract + data source and test case

Deploy data source / test case

```bash
./deploy_ds_tc.sh <datasource/testcase> <smart-contract-name> <init-in-json-string> <identifier-number> <path-to-smart-contract-dir>

Eg:

 ./deploy_ds_tc.sh datasource classification '' 17 ../oraiwasm/smart-contracts/package/cv
 ./deploy_ds_tc.sh testcase classification_testcase '' 17 ../oraiwasm/smart-contracts/package/cv
```

Normally, the initial inputs for data source and test case are uneccessary => can leave them empty.

### Deploy smart contract + oracle script

```bash

./deploy_oscript.sh <datasource1,datasource2,...> <testcas1,testcase2,...> <smart-contract-name> <init-in-json-string> <identifier-number> <path-to-smart-contract-dir>

./deploy_oscript.sh classification,cv009 classification_testcase classification_oscript '' 17 ../oraiwasm/smart-contracts/package/cv
```

Initial input for the oracle script shoud contain information about the data sources and test cases, but the deploy_oscript.sh has taken care of it already, so it should be left empty

### Interact with the scripts

#### 1. CLI


