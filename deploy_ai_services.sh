#!/bin/bash

CHAIN_ID=${CHAIN_ID:-Oraichain}
DS_RAW=${1:-classification}
TC_RAW=${2:-classification_testcase}
OS=${3:-classification_oscript}
DS_INPUT=${4:-''}
TC_INPUT=${5:-''}
OS_INPUT=${6:-''}
OS_DS=''
OS_TC=''
NONCE=${7:-1}
DIR_PATH=${8:-'../oraiwasm'}
FEES=${9:-0}

# deploy data sources
bash $PWD/deploy_ds_tc.sh "datasource" $DS_RAW "$DS_INPUT" $NONCE $DIR_PATH $FEES

# deploy test cases
bash $PWD/deploy_ds_tc.sh "testcase" $TC_RAW "$TC_INPUT" $NONCE $DIR_PATH $FEES

# deploy oracle scripts
bash $PWD/deploy_oscript.sh $DS_RAW $TC_RAW $OS "$OS_INPUT" $NONCE $DIR_PATH $FEES

# ./deploy_ai_services.sh classification,cv009 '' '' '' '' '' 7 ../oraiwasm/smart-contracts/package/cv 5000orai