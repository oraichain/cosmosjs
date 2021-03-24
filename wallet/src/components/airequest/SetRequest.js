import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import BlockUi from 'react-block-ui';
import 'react-block-ui/style.css';
import bech32 from 'bech32';
import constants from '../../constants';
import { getFileSize } from '../../utils';
import KSUID from 'ksuid';

import message from '../../cosmos/messages/proto';
import PinWrap, { openPinWrap } from '../PinWrap';
import Long from 'long';
import RequestMenu from './RequestMenu';
import * as actions from '../../actions';

const CreateAIRequest = ({ user, updateRequestId }) => {
    const $ = window.jQuery;
    const { t, i18n } = useTranslation();
    const [blocking, setBlocking] = useState(false);
    const [isOScript, setIsOScript] = useState(false);
    const [inputFile, setInputFile] = useState('');
    const [outputFile, setOutputFile] = useState('');
    const [showInput, setShowInput] = useState(true);
    const [showOutput, setShowOutput] = useState(true);
    const cosmos = window.cosmos;

    const pattern = new RegExp(/[~`!#$%\^&*+=\-\[\]\\';/{}|\\":<>\?]/);

    useEffect(() => {
        const handler = (e, file) => {
            processFile(file);
        };
        $('#filename').on('file', handler);
        return () => {
            $('#filename').off('file', handler);
        };
    }, []);

    const clearFile = (e) => {
        if (e.target.id === "trash-output") {
            $('#filename').text('Output file');
            $('#output-file').val('');
            setOutputFile('');
        } else {
            $('#filename').text('Input file');
            $('#input-file').val('');
            setInputFile('');
        }
        e.preventDefault();
    };

    const onFileChange = (e) => {
        return processFile(e.target.files[0], e.target.id);
    };

    const onType = (e) => {
        if (e.target.id === "input") {
            let input = $('#input').val();
            // if empty = 0 then show file option
            if (input.length === 0) {
                setShowInput(true);
            } else {
                setShowInput(false);
                setInputFile('');
            }
        } else {
            let output = $('#expected-output').val();
            console.log("output: ", output)
            // if empty = 0 then show file option
            if (output.length === 0) {
                setShowOutput(true);
            } else {
                setShowOutput(false);
                setOutputFile('');
            }
        }
        console.log("hello world");
    }

    const processFile = async (file, id) => {
        if (!file) return;

        let fileBuffer;
        if (file.data) {
            fileBuffer = file.data;
        } else {
            const blob = new Blob([file]);
            fileBuffer = await blob.arrayBuffer();
        }

        let buffer = Buffer.from(fileBuffer).toString();
        if (id === "input-file") {
            setInputFile(buffer);
        } else if (id === "output-file") {
            setOutputFile(buffer);
        }
        $('#filename').html(`<strong>${file.name} (${getFileSize(file.size)})</strong>`);
    };

    const handleSet = async () => {
        const oscriptName = $('#oscript-name').val().trim();
        try {
            const data = await fetch(`${cosmos.url}/provider/oscript/${oscriptName}`).then((res) => res.json());
            console.log("data: ", data)
            if (data.code !== undefined) {
                alert("current name of the script is not found");
                return;
            }
            let description = $('#des').val().trim();
            let valCount = $('#validator-count').val().trim();
            let requestFees = $('#request-fees').val().trim();
            let memo = $('#memo').val().trim();
            let input = $('#input').val().trim();
            let expectedOutput = $('#expected-output').val().trim();
            if (pattern.test(oscriptName) || pattern.test(description) || Number.isInteger(parseInt(valCount)) === false || pattern.test(memo)) {
                alert("inputs has invalid values");
                return;
            }
            openPinWrap();
        } catch (err) {
            alert("unexpected error from the server: ", err);
            return;
        }
    };

    const getTxBody = (childKey) => {
        let oscriptName = $('#oscript-name').val().trim();
        let accAddress = bech32.fromWords(bech32.toWords(childKey.identifier));
        let description = $('#des').val().trim();
        let valCount = $('#validator-count').val().trim();
        let requestFees = $('#request-fees').val().trim();
        let memo = $('#memo').val().trim();
        let input = $('#input').val().trim();
        let expectedOutput = $('#expected-output').val().trim();
        let reqId = KSUID.randomSync().string;
        if (inputFile.length !== 0) {
            input = inputFile;
        }
        if (outputFile.length !== 0) {
            expectedOutput = outputFile
        }
        const msgSend = new message.oraichain.orai.airequest.MsgSetAIRequest({
            request_id: reqId,
            oracle_script_name: oscriptName,
            creator: accAddress,
            validator_count: new Long(valCount),
            fees: requestFees,
            input: Buffer.from(input),
            expected_output: Buffer.from(expectedOutput)
        });

        const msgSendAny = new message.google.protobuf.Any({
            type_url: '/oraichain.orai.airequest.MsgSetAIRequest',
            value: message.oraichain.orai.airequest.MsgSetAIRequest.encode(msgSend).finish()
        });

        return new message.cosmos.tx.v1beta1.TxBody({
            messages: [msgSendAny],
            memo: memo
        });
    };

    const onChildKey = async (childKey) => {
        try {
            setBlocking(true);
            // will allow return childKey from Pin
            const txBody = getTxBody(childKey);
            console.log("tx body: ", txBody)
            // higher gas limit
            const res = await cosmos.submit(childKey, txBody, 'BROADCAST_MODE_BLOCK');
            const requestId = JSON.parse(res.tx_response.raw_log)[0].events[0].attributes[0].value;
            $('#tx-json').text(res.tx_response.raw_log + "\n" + "request id: " + requestId);
            // check if the broadcast message is successful or not
            updateRequestId({ requestId });
        } catch (ex) {
            alert(ex.message);
            return;
        } finally {
            setBlocking(false);
        }
    };

    return (
        <BlockUi tag="div" blocking={blocking}>
            <RequestMenu selected="set" />
            <form className="keystation-form">
                <input style={{ display: 'none' }} type="text" tabIndex={-1} spellCheck="false" name="account" defaultValue={user.name} />
                <input style={{ display: 'none' }} type="password" autoComplete="current-password" tabIndex={-1} spellCheck="false" />
                <div className="keystation-tx-info" id="tx-info">
                    <h3 className="send">Set</h3>
                    <span>{t('creator')}</span>
                    <p>
                        {user.address}{' '}
                    </p>
                    <div className="field">
                        <span>{t('oracleScriptName')}</span>
                        <input id="oscript-name" />
                    </div>
                    <div className="field">
                        <span>{t('description')}</span>
                        <input id="des" />
                    </div>

                    <div className="field">
                        <span>{t('validatorCount')}</span>
                        <input id="validator-count" />
                    </div>
                    <div className="field">
                        <span>{t('requestFees')}</span>
                        <input id="request-fees" />
                    </div>
                    <div className="field">
                        <span>{t('input')}</span>
                        <input id="input" onInput={onType} />
                        {showInput && <label className="file-upload">
                            <input type="file" id="input-file" onChange={onFileChange} />
                            <i className="fa fa-cloud-upload" /> <small id="filename">Input file json</small> {inputFile && <i className="fa fa-trash" id="trash-input" onClick={clearFile} />}
                        </label>}
                    </div>
                    <div className="field">
                        <span>{t('output')}</span>
                        <input id="expected-output" onInput={onType} />
                        {showOutput && <label className="file-upload">
                            <input type="file" id="output-file" onChange={onFileChange} />
                            <i className="fa fa-cloud-upload" /> <small id="filename">Output file json</small> {outputFile && <i className="fa fa-trash" id="trash-output" onClick={clearFile} />}
                        </label>}
                    </div>
                    <span>{t('memo')}</span>
                    <textarea id="memo"></textarea>
                </div>
                <div className="tx-btn-wrap btn-center">
                    <button type="button" onClick={handleSet} id="allowBtn">
                        Submit
          </button>
                </div>
            </form>

            <div className="keystation-tx-json" id="tx-json"></div>

            <PinWrap show={false} pinType="tx" onChildKey={onChildKey} />
        </BlockUi>
    );
};

function mapStateToProps(state) {
    return {
        user: state.user
    };
}

export default connect(mapStateToProps, actions)(CreateAIRequest);
