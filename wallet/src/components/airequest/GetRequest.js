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

const GetAIRequest = ({ user }) => {
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

    const handleGet = async () => {
        const reqId = $('#request-id').val().trim();
        try {
            const data = await fetch(`${cosmos.url}/airesult/fullreq/${reqId}`).then((res) => res.json());;
            if (data.code !== undefined) {
                alert("current AI request is not found");
                return;
            }
            console.log("data: ", data)
            let results = [];
            for (let i = 0; i < data.result.results.length; i++) {
                results.push(atob(data.result.results[i].result).replace(/\\/g, ""));
            }
            console.log("results: ", results);
            $('#tx-json').text(JSON.stringify(data) + "\n\n\nAggregated result: " + results.toString());
        } catch (err) {
            alert("unexpected error from the server: ", err);
            return;
        }
    };

    return (
        <BlockUi tag="div" blocking={blocking}>
            <RequestMenu selected="get" />
            <form className="keystation-form">
                <input style={{ display: 'none' }} type="text" tabIndex={-1} spellCheck="false" name="account" defaultValue={user.name} />
                <input style={{ display: 'none' }} type="password" autoComplete="current-password" tabIndex={-1} spellCheck="false" />
                <div className="keystation-tx-info" id="tx-info">
                    <h3 className="send">Get</h3>
                    <div className="field">
                        <span>{t('requestId')}</span>
                        <input id="request-id" />
                    </div>
                </div>
                <div className="tx-btn-wrap btn-center">
                    <button type="button" onClick={handleGet} id="allowBtn">
                        Submit
          </button>
                </div>
            </form>

            <div className="keystation-tx-json" id="tx-json"></div>
        </BlockUi>
    );
};

function mapStateToProps(state) {
    return {
        user: state.user
    };
}

export default connect(mapStateToProps)(GetAIRequest);
