#!/bin/bash

CHAIN_ID=${CHAIN_ID:-Oraichain}
IFS=',' read -r -a DS <<< "$1"
DS=${DS:-classification}
DS_RAW=${1:-classification}
IFS=',' read -r -a TC <<< "$2"
TC=${TC:-classification_testcase}
TC_RAW=${2:-classification_testcase}
OS=${3:-classification_oscript}
OS_DS=''
OS_TC=''
NONCE=${5:-1}
DIR_PATH=${6:-$PWD}
FEES=${7:-0}

# add double quotes in the list of data sources
for ((i=0; i<${#DS[@]}; i++));
do
    OS_DS+=\"${DS[$i]}\",
done
# remove the last character (comma)
OS_DS=${OS_DS::-1}

# add double quotes in the list of test cases
for ((i=0; i<${#TC[@]}; i++));
do
    OS_TC+=\"${TC[$i]}\",
done
# remove the last character (comma)
OS_TC=${OS_TC::-1}

OS_INPUT=${4:-'{"ai_data_source":['$OS_DS'],"testcase":['$OS_TC']}'}

yarn oraicli wasm deploy $DIR_PATH/$OS/artifacts/$OS.wasm --label "$OS $NONCE" --input "$OS_INPUT" --fees $FEES --chain-id $CHAIN_ID

# check if the oracle script exists or not
yarn oraicli provider get-script oscript $OS
description="test $OS"
address=$(cat $PWD/address.txt)
# if the file is empty, then the oracle script does not exist. We create new

echo $DS_RAW
echo $TC_RAW

if [ -s $PWD/is_exist.txt ]
then
    yarn oraicli provider set-oscript $OS "test $OS" $address --ds ${DS[*]} --tc ${TC[*]} --fees $FEES --chain-id $CHAIN_ID
else
    yarn oraicli provider edit-oscript $OS $OS "test $OS" $address --ds ${DS[*]} --tc ${TC[*]} --fees $FEES --chain-id $CHAIN_ID
fi

# ./deploy_oscript.sh classification,cv009 classification_testcase classification_oscript '' 17 ../oraiwasm/smart-contracts/package/cv 5000orai