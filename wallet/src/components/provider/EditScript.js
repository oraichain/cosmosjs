import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import BlockUi from 'react-block-ui';
import 'react-block-ui/style.css';
import bech32 from 'bech32';
import constants from '../../constants';

import message from '../../cosmos/messages/proto';
import PinWrap, { openPinWrap } from '../PinWrap';
import ProviderMenu from './ProviderMenu';

const EditScript = ({ user, contract }) => {
    const $ = window.jQuery;
    const { t, i18n } = useTranslation();
    const [blocking, setBlocking] = useState(false);
    const [isOScript, setIsOScript] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [curName, setCurName] = useState('');
    const [newName, setNewName] = useState('');
    const [description, setDes] = useState('');
    const [contractAddress, setAddress] = useState('');
    const [type, setType] = useState('');
    const [ds, setDs] = useState([]);
    const [tc, setTc] = useState([]);
    const cosmos = window.cosmos;

    const pattern = new RegExp(/[~`!#$%\^&*+=\-\[\]\\';/{}|\\":<>\?]/);

    useEffect(() => {
        if (typeof contract === "string") {
            $('#contract').val(contract);
        }
    }, []);

    const handleEdit = async () => {
        const curName = $('#curName').val().trim();
        const newName = $('#newName').val().trim();
        const description = $('#des').val().trim();
        const contractAddress = $('#contract').val().trim();
        const memo = $('#memo').val().trim();
        const type = $('#type').val().trim();
        if (pattern.test(curName) || pattern.test(newName) || pattern.test(description) || pattern.test(contractAddress) || pattern.test(memo) || pattern.test(type)) {
            alert("inputs has invalid values");
            return;
        }
        try {
            const data = await fetch(`${cosmos.url}/provider/${type}/${curName}`).then((res) => res.json());
            console.log("data: ", data)
            if (data.code !== undefined) {
                alert("current name of the script is not found");
                return;
            } else {
                setCurName(curName);
                setNewName(newName === "" ? curName : newName);
                setDes(description === "" ? data.description : description);
                setAddress(contractAddress === "" ? data.contract : contractAddress);
                setType(type);
                if (type === constants.ORACLE_SCRIPT) {
                    const ds = $('#ds').val().trim();
                    const tc = $('#tc').val().trim();
                    if (pattern.test(ds) || pattern.test(tc)) {
                        alert("inputs has invalid values");
                        return;
                    }
                    setDs(ds === "" ? data.d_sources : ds.split(","));
                    setTc(tc === "" ? data.t_cases : tc.split(","));
                }
                openPinWrap();
            }
        } catch (err) {
            alert("unexpected error from the server: ", err);
            return;
        }
    }

    const getTxBody = (childKey) => {
        let msgSend = "";
        let msgSendAny = "";
        let accAddress = bech32.fromWords(bech32.toWords(childKey.identifier));
        if (type === constants.DATA_SOURCE) {
            msgSend = new message.oraichain.orai.provider.MsgEditAIDataSource({
                old_name: curName,
                new_name: newName,
                description: description,
                contract: contractAddress,
                owner: accAddress
            });

            msgSendAny = new message.google.protobuf.Any({
                type_url: '/oraichain.orai.provider.MsgEditAIDataSource',
                value: message.oraichain.orai.provider.MsgEditAIDataSource.encode(msgSend).finish()
            });
        } else if (type === constants.TEST_CASE) {
            msgSend = new message.oraichain.orai.provider.MsgEditTestCase({
                old_name: curName,
                new_name: newName,
                description: description,
                contract: contractAddress,
                owner: accAddress
            });

            msgSendAny = new message.google.protobuf.Any({
                type_url: '/oraichain.orai.provider.MsgEditTestCase',
                value: message.oraichain.orai.provider.MsgEditTestCase.encode(msgSend).finish()
            });
        } else if (type === constants.ORACLE_SCRIPT) {
            msgSend = new message.oraichain.orai.provider.MsgEditOracleScript({
                old_name: curName,
                new_name: newName,
                description: description,
                contract: contractAddress,
                owner: accAddress,
                data_sources: ds,
                test_cases: tc,
            });

            msgSendAny = new message.google.protobuf.Any({
                type_url: '/oraichain.orai.provider.MsgEditOracleScript',
                value: message.oraichain.orai.provider.MsgEditOracleScript.encode(msgSend).finish()
            });
        } else {
            console.log("error in choosing script type");
        }

        console.log("msg send: ", msgSend)

        return new message.cosmos.tx.v1beta1.TxBody({
            messages: [msgSendAny],
            memo: $('#memo').val().trim()
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
            $('#tx-json').text(res.tx_response.raw_log);
            // check if the broadcast message is successful or not
            try {
                let log = JSON.parse(res.tx_response.raw_log)
            } catch (err) {
                // if error then we don't set success to hide the next button
                return;
            }

            console.log("response: ", JSON.parse(res.tx_response.raw_log)[0])
            setIsSuccess(true);
            alert("transaction broadcast successfully");
        } catch (ex) {
            alert(ex.message);
        } finally {
            setBlocking(false);
        }
    };

    return (
        <BlockUi tag="div" blocking={blocking}>
            <ProviderMenu selected="edit" />
            <form className="keystation-form">
                <input style={{ display: 'none' }} type="text" tabIndex={-1} spellCheck="false" name="account" defaultValue={user.name} />
                <input style={{ display: 'none' }} type="password" autoComplete="current-password" tabIndex={-1} spellCheck="false" />
                <div className="keystation-tx-info" id="tx-info">
                    <h3 className="send">Edit</h3>
                    <span>{t('creator')}</span>
                    <p>
                        {user.address}{' '}
                    </p>
                    <div className="field">
                        <span>{t('curName')}</span>
                        <input id="curName" />
                    </div>
                    <div className="field">
                        <span>{t('newName')}</span>
                        <input id="newName" />
                    </div>
                    <div className="field">
                        <span>{t('editDescription')}</span>
                        <input id="des" />
                    </div>

                    <div className="field">
                        <span>{t('editContract')}</span>
                        <input id="contract" />
                    </div>
                    <span>{t('memo')}</span>
                    <textarea id="memo"></textarea>
                    <label for="type">Choose a script type to set:</label>
                    <select name="contract type" id="type" onChange={() => {
                        const type = $('#type').val().trim();
                        console.log("type: ", type)
                        // to expose the Next button again to create new requests
                        if (isSuccess) {
                            setIsSuccess(false);
                        }
                        if (type === "oscript") {
                            setIsOScript(true);
                        } else {
                            setIsOScript(false);
                        }
                    }}>
                        <option value="datasource">Data Source</option>
                        <option value="testcase">Test Case</option>
                        <option value="oscript">Oracle Script</option>
                    </select>
                    {isOScript ? <div>
                        <div className="field">
                            <span>{t('dsources')}</span>
                            <input id="ds" />
                        </div>
                        <div className="field">
                            <span>{t('tcases')}</span>
                            <input id="tc" />
                        </div>
                    </div> : null}
                </div>
                {!isSuccess ?
                    <div className="tx-btn-wrap btn-center">
                        <button type="button" onClick={handleEdit} id="allowBtn">
                            Submit
          </button>
                    </div> : null
                }
            </form>

            <div className="keystation-tx-json" id="tx-json"></div>

            <PinWrap show={false} pinType="tx" onChildKey={onChildKey} />
        </BlockUi>
    );
};

function mapStateToProps(state) {
    return {
        user: state.user,
        contract: state.contract
    };
}

export default connect(mapStateToProps)(EditScript);
