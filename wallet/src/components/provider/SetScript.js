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

const SetScript = ({ user, contract }) => {
  const $ = window.jQuery;
  const { t, i18n } = useTranslation();
  const [blocking, setBlocking] = useState(false);
  const [isOScript, setIsOScript] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const cosmos = window.cosmos;

  const pattern = new RegExp(/[~`!#$%\^&*+=\-\[\]\\';/{}|\\":<>\?]/);

  useEffect(() => {
    console.log('contract: ', contract);
    if (typeof contract === 'string') {
      $('#contract').val(contract);
    }
  }, []);

  const getTxBody = (childKey) => {
    const name = $('#name').val().trim();
    const description = $('#des').val().trim();
    const contractAddress = $('#contract').val().trim();
    const memo = $('#memo').val().trim();
    const type = $('#type').val().trim();
    if (pattern.test(name) || pattern.test(description) || pattern.test(contractAddress) || pattern.test(memo) || pattern.test(type)) {
      alert('inputs has invalid values');
      return;
    }
    let msgSend = '';
    let msgSendAny = '';
    let accAddress = bech32.fromWords(bech32.toWords(childKey.identifier));
    if (type === constants.DATA_SOURCE) {
      msgSend = new message.oraichain.orai.provider.MsgCreateAIDataSource({
        name,
        description,
        contract: contractAddress,
        owner: accAddress
      });

      msgSendAny = new message.google.protobuf.Any({
        type_url: '/oraichain.orai.provider.MsgCreateAIDataSource',
        value: message.oraichain.orai.provider.MsgCreateAIDataSource.encode(msgSend).finish()
      });
    } else if (type === constants.TEST_CASE) {
      msgSend = new message.oraichain.orai.provider.MsgCreateTestCase({
        name,
        description,
        contract: contractAddress,
        owner: accAddress
      });

      msgSendAny = new message.google.protobuf.Any({
        type_url: '/oraichain.orai.provider.MsgCreateTestCase',
        value: message.oraichain.orai.provider.MsgCreateTestCase.encode(msgSend).finish()
      });
    } else if (type === constants.ORACLE_SCRIPT) {
      const ds = $('#ds').val().trim();
      const tc = $('#tc').val().trim();
      console.log('data source: ', ds);
      console.log('pattern: ', pattern.test(ds));
      if (pattern.test(ds) || pattern.test(tc)) {
        alert('input data sources or test cases has invalid values');
        return;
      }
      const dsArr = ds.split(',');
      const tcArr = tc.split(',');
      msgSend = new message.oraichain.orai.provider.MsgCreateOracleScript({
        name,
        description,
        contract: contractAddress,
        owner: accAddress,
        data_sources: dsArr,
        test_cases: tcArr
      });

      msgSendAny = new message.google.protobuf.Any({
        type_url: '/oraichain.orai.provider.MsgCreateOracleScript',
        value: message.oraichain.orai.provider.MsgCreateOracleScript.encode(msgSend).finish()
      });
    } else {
      console.log('error in choosing script type');
    }

    console.log('msg send: ', msgSend);

    return new message.cosmos.tx.v1beta1.TxBody({
      messages: [msgSendAny],
      memo
    });
  };

  const onChildKey = async (childKey) => {
    try {
      setBlocking(true);
      // will allow return childKey from Pin
      const txBody = getTxBody(childKey);
      console.log('tx body: ', txBody);
      // higher gas limit
      const res = await cosmos.submit(childKey, txBody, 'BROADCAST_MODE_BLOCK');
      $('#tx-json').text(res.tx_response.raw_log);
      // check if the broadcast message is successful or not
      try {
        let log = JSON.parse(res.tx_response.raw_log);
      } catch (err) {
        // if error then we don't set success to hide the next button
        return;
      }

      console.log('response: ', JSON.parse(res.tx_response.raw_log)[0]);
      setIsSuccess(true);
      alert('transaction broadcast successfully');
    } catch (ex) {
      alert(ex.message);
    } finally {
      setBlocking(false);
    }
  };

  return (
    <BlockUi tag="div" blocking={blocking}>
      <ProviderMenu selected="set" />
      <form className="keystation-form">
        <input style={{ display: 'none' }} type="text" tabIndex={-1} spellCheck="false" name="account" defaultValue={user.name} />
        <input style={{ display: 'none' }} type="password" autoComplete="current-password" tabIndex={-1} spellCheck="false" />
        <div className="keystation-tx-info" id="tx-info">
          <h3 className="send">Set</h3>
          <span>{t('creator')}</span>
          <p>{user.address} </p>
          <div className="field">
            <span>{t('name')}</span>
            <input id="name" />
          </div>
          <div className="field">
            <span>{t('description')}</span>
            <input id="des" />
          </div>

          <div className="field">
            <span>{t('contract')}</span>
            <input id="contract" />
          </div>
          <span>{t('memo')}</span>
          <textarea id="memo"></textarea>
          <label htmlFor="type">Choose a script type to set:</label>
          <select
            name="contract type"
            id="type"
            onChange={() => {
              const type = $('#type').val().trim();
              console.log('type: ', type);
              // to expose the Next button again to create new requests
              if (isSuccess) {
                setIsSuccess(false);
              }
              if (type === 'oscript') {
                setIsOScript(true);
              } else {
                setIsOScript(false);
              }
            }}
          >
            <option value="datasource">Data Source</option>
            <option value="testcase">Test Case</option>
            <option value="oscript">Oracle Script</option>
          </select>
          {isOScript ? (
            <div>
              <div className="field">
                <span>{t('dsources')}</span>
                <input id="ds" />
              </div>
              <div className="field">
                <span>{t('tcases')}</span>
                <input id="tc" />
              </div>
            </div>
          ) : null}
        </div>
        {!isSuccess ? (
          <div className="tx-btn-wrap btn-center">
            <button type="button" onClick={openPinWrap} id="allowBtn">
              Submit
            </button>
          </div>
        ) : null}
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

export default connect(mapStateToProps)(SetScript);
