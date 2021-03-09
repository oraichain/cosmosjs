import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import Editor from '@monaco-editor/react';
import message from '../cosmos/messages/proto';

const getFileSize = (size) => {
  const fileSize = size.toString();
  if (fileSize.length < 7) return `${Math.round(+fileSize / 1024).toFixed(2)}kb`;
  return `${(Math.round(+fileSize / 1024) / 1000).toFixed(2)}MB`;
};

const Deploy = ({ user }) => {
  const $ = window.jQuery;
  const { t, i18n } = useTranslation();
  const [inputContract, inputContractChange] = useState('');
  const cosmos = window.cosmos;
  let wasmBody = '';

  const getStoreMessage = (wasm_byte_code) => {
    const msgSend = new message.cosmwasm.wasm.v1beta1.MsgStoreCode({
      wasm_byte_code,
      sender: user.address
    });

    const msgSendAny = new message.google.protobuf.Any({
      type_url: '/cosmwasm.wasm.v1beta1.MsgStoreCode',
      value: message.cosmwasm.wasm.v1beta1.MsgStoreCode.encode(msgSend).finish()
    });

    return new message.cosmos.tx.v1beta1.TxBody({
      messages: [msgSendAny]
    });
  };

  const getInstantiateMessage = (code_id, init_msg, label = '') => {
    const msgSend = new message.cosmwasm.wasm.v1beta1.MsgInstantiateContract({
      code_id,
      init_msg,
      label,
      sender: user.address
    });

    const msgSendAny = new message.google.protobuf.Any({
      type_url: '/cosmwasm.wasm.v1beta1.MsgInstantiateContract',
      value: message.cosmwasm.wasm.v1beta1.MsgInstantiateContract.encode(msgSend).finish()
    });

    return new message.cosmos.tx.v1beta1.TxBody({
      messages: [msgSendAny]
    });
  };

  const deployContract = async () => {
    try {
      // will allow return childKey from Pin
      const childKey = cosmos.getChildKey('sock isolate water indoor worry rally reveal scheme gasp food army library during drip gentle foam attract popular elite shoot trophy lyrics stereo topic');
      const txBody1 = getStoreMessage(wasmBody);
      const res1 = await cosmos.submit(childKey, txBody1);

      // next instantiate code
      const label = $('#label').val().trim();
      const codeId = res1.tx_response.code;
      const input = Buffer.from(inputContract).toString('base64');
      const txBody2 = getInstantiateMessage(codeId, input, label);
      const res2 = await cosmos.submit(childKey, txBody2);

      $('#tx-json').text(`${JSON.stringify(res1)}\n\n${JSON.stringify(res2)}`);
    } catch (ex) {
      alert(ex.message);
    }
  };

  const onFileChange = async (e) => {
    const file = e.target.files[0];
    $('#filename').html(`<strong>${file.name} (${getFileSize(file.size)})</strong>`);
    const blob = new Blob([file]);
    const fileBuffer = await blob.arrayBuffer();
    wasmBody = Buffer.from(fileBuffer).toString('base64');
  };

  return (
    <div>
      <h2>Deploy Contract </h2>
      <form className="keystation-form" id="interact-form">
        <div className="keystation-tx-info" id="tx-info">
          <div className="field">
            <span>Label</span>
            <input id="label" />
          </div>

          <div className="field">
            <span>Smart Contract Code</span>
            <label className="file-upload">
              <input type="file" onChange={onFileChange} />
              <i className="fa fa-cloud-upload" /> <small id="filename">Wasm File</small>
            </label>
          </div>

          <div className="field">
            <span>Init Input</span>
            <Editor height={150} defaultLanguage="json" value={inputContract} onChange={inputContractChange} />
          </div>
        </div>
        <div className="tx-btn-wrap btn-center">
          <button type="button" onClick={deployContract} id="allowBtn">
            Continue <i className="fa fa-arrow-right" />
          </button>
        </div>
      </form>
      <div className="keystation-tx-json" id="tx-json"></div>
    </div>
  );
};

export default connect((state) => ({
  user: state.user
}))(Deploy);
