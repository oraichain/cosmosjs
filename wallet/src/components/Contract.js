import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Editor from '@monaco-editor/react';

const Contract = () => {
  const $ = window.jQuery;
  const { t, i18n } = useTranslation();
  const [inputContract, inputContractChange] = useState('');
  const cosmos = window.cosmos;

  const queryContract = async () => {
    const address = $('#contract_address').val().trim();
    const input = Buffer.from(inputContract).toString('base64');
    console.log(input);
    const data = await fetch(`${cosmos.url}/wasm/v1beta1/contract/${address}/smart/${input}`).then((res) => res.text());
    $('#tx-json').text(data);
  };

  return (
    <div>
      <h2>Interact with Contract</h2>
      <form className="keystation-form">
        <div className="keystation-tx-info" id="tx-info">
          <div className="field">
            <span>Contract Address</span>
            <input id="contract_address" />
          </div>

          <div className="field">
            <span>Input</span>
            <Editor height={150} defaultLanguage="json" value={inputContract} onChange={inputContractChange} />
          </div>
        </div>
        <div className="tx-btn-wrap btn-center">
          <button type="button" onClick={queryContract} id="allowBtn">
            Continue <i className="fa fa-arrow-right" />
          </button>
        </div>
      </form>
      <div className="keystation-tx-json" id="tx-json"></div>
    </div>
  );
};

export default Contract;
