# Oraichain Cosmosjs CLI installation and usage

## Prerequisites

### 0. Install yarn and node

Node version should be >= 12.0.0

### 1. Install dependencies

```bash
yarn
```

### 2. Create .env file according to the .env.example file

## Example flow and script for simplification

### 1. Deploy nlp008 service

Assume that the oraiwasm (smart contract repo) dir has the same parent dir as this one.

```bash
./deploy_ai_services.sh nl008 nl008_testcase nl008_oscript '' '' '' 1 ../oraiwasm/smart-contracts/package/nlp
```

### 2. Run the AI request

command for running an AI request:

```bash
yarn oraicli airequest set-aireq <oscript-name> <number-of-validators> --input <input-in-string> --expected-output <expected-output-string>

Eg:

yarn oraicli airequest set-aireq nl008_oscript 5 --input '{"paragraph":"my name is duc"}' --expected-output "english"
```

### 3. Query the AI request afterwards

```bash
curl http://<ip>:1317/airesult/fullreq/<request-id>
```

## Use oraicli to interact with the Oraichain network

### Simplest way to deploy scripts

This is a aggregated way to deploy data sources, test cases and oracle scripts with one command. Type:

```bash
./deploy_ai_services.sh <datasource1,datasource2,...> <testcas1,testcase2,...> <oracle-script> <ds-init-in-json-string> <tc-init-in-json-string> <os-init-in-json-string> <identifier number> ../oraiwasm/smart-contracts/package/cv

Eg:

./deploy_ai_services.sh classification,cv009 classification_testcase classification_oscript '' '' '' 7 ../oraiwasm/smart-contracts/package/cv
```

If the scripts have been deployed and you run the above command again, it will deploy new smart contracts, and check if the data sources, test cases, and oracle scripts exist or not. If not => create new, if yes then edit accordingly.

Afterwards, you can move on to the [interaction section](#interact-with-the-scripts)

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

Interact directly with data source, test case and data source smart contracts through:

```bash
yarn oraicli wasm query <contract-address> <json-string>

Eg:

# Query input for data source
yarn oraicli wasm query orai1v5l3yfxnmu4j3e2z7s73try82jg5kjnc238mg3 --input '{"get":{"input":"{\"paragraph\":\"my name is duc\"}"}}'

# query input for test case
yarn oraicli wasm query orai1v5l3yfxnmu4j3e2z7s73try82jg5kjnc238mg3 --input '{"test":{"input":"{\"image\":\"https://encrypted-tbn0.gstatic.com/images%3Fq%3Dtbn%3AANd9GcSfx__RoRYzLDgXDiJxYGxLihJC4zoqV3V0xg%26usqp%3DCAU\",\"model\":\"inception_v3\",\"name\":\"test_image\"}","output":"a","contract":"orai1aysde07zjurpp99jgl4xa7vskr8xnlcfkedkd9"}}'
```

Note that the image url when passed needs to be encoded beforehand

#### 2. GUI