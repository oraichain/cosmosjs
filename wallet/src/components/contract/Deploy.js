import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import BlockUi from 'react-block-ui';
import 'react-block-ui/style.css';
import Form from '@rjsf/core';

import { getFileSize } from '../../utils';
import PinWrap, { openPinWrap } from '../PinWrap';
import Editor from '@monaco-editor/react';
import message from '../../cosmos/messages/proto';
import ContractMenu from './ContractMenu';

const Deploy = ({ user }) => {
  const $ = window.jQuery;
  const { t, i18n } = useTranslation();
  const [blocking, setBlocking] = useState(false);
  const [inputContract, inputContractChange] = useState('{}');
  const [formData, setFormData] = useState({});
  const [schema, setSchema] = useState();
  const [wasmBody, setWasmBody] = useState('');
  const cosmos = window.cosmos;

  useEffect(() => {
    const handler = (e, file) => {
      processFile(file);
    };
    $('#filename').on('file', handler);
    return () => {
      $('#filename').off('file', handler);
    };
  }, []);

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

  const onChildKey = async (childKey) => {
    try {
      setBlocking(true);
      // will allow return childKey from Pin
      const txBody1 = getStoreMessage(wasmBody);
      // higher gas limit
      const res1 = await cosmos.submit(childKey, txBody1, 'BROADCAST_MODE_BLOCK', 1000000);

      if (res1.tx_response.code !== 0) return;

      // next instantiate code
      const codeId = res1.tx_response.logs[0].events[0].attributes.find((attr) => attr.key === 'code_id').value;
      const label = $('#label').val().trim();
      const input = Buffer.from(schema ? JSON.stringify(formData) : inputContract).toString('base64');
      const txBody2 = getInstantiateMessage(codeId, input, label);
      const res2 = await cosmos.submit(childKey, txBody2, 'BROADCAST_MODE_BLOCK');
      const contractAddress = res2.tx_response.logs[0].events[0].attributes.find((attr) => attr.key === 'contract_address').value;
      $('#address').val(contractAddress);
      $('#tx-json').text(`${res1.tx_response.raw_log}\n\n${res2.tx_response.raw_log}`);
    } catch (ex) {
      alert(ex.message);
    } finally {
      setBlocking(false);
    }
  };

  const onFileChange = (e) => {
    return processFile(e.target.files[0]);
  };

  const processFile = async (file) => {
    if (!file) return;

    let fileBuffer;
    if (file.data) {
      fileBuffer = file.data;
    } else {
      const blob = new Blob([file]);
      fileBuffer = await blob.arrayBuffer();
    }
    setWasmBody(Buffer.from(fileBuffer).toString('base64'));
    $('#filename').html(`<strong>${file.name} (${getFileSize(file.size)})</strong>`);
  };

  const onSchemaFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    $('#filename-schema').html(`<strong>${file.name} (${getFileSize(file.size)})</strong>`);
    const blob = new Blob([file]);
    const fileBuffer = await blob.arrayBuffer();
    const schemaBody = Buffer.from(fileBuffer).toString();
    setSchema(JSON.parse(schemaBody));
  };

  const clearWasmFile = (e) => {
    $('#filename').text('Wasm File');
    $('#wasm-file').val('');
    setWasmBody('');
    e.preventDefault();
  };

  const clearSchemaFile = (e) => {
    $('#filename-schema').text('Init Schema File');
    $('#schema-file').val('');
    setSchema(false);
    e.preventDefault();
  };

  return (
    <BlockUi tag="div" blocking={blocking}>
      <ContractMenu selected="deploy" />
      <form className="keystation-form" id="interact-form">
        <input style={{ display: 'none' }} type="text" tabIndex={-1} spellCheck="false" name="account" defaultValue={user.name} />
        <input style={{ display: 'none' }} type="password" autoComplete="current-password" tabIndex={-1} spellCheck="false" />
        <div className="keystation-tx-info" id="tx-info">
          <div className="field">
            <span>Label</span>
            <input id="label" />
          </div>

          <div className="field">
            <label className="file-upload">
              <input type="file" id="wasm-file" onChange={onFileChange} />
              <i className="fa fa-cloud-upload" /> <small id="filename">Wasm File</small> {wasmBody && <i className="fa fa-trash" onClick={clearWasmFile} />}
            </label>
            <label className="file-upload ml-10">
              <input type="file" id="schema-file" onChange={onSchemaFileChange} />
              <i className="fa fa-cloud-upload" /> <small id="filename-schema">Init Schema File</small> {schema && <i className="fa fa-trash" onClick={clearSchemaFile} />}
            </label>
          </div>
          {schema && <Form schema={schema} formData={formData} onChange={({ formData }) => setFormData(formData)} />}

          {!schema && (
            <div className="field">
              <span>Init Input</span>
              <Editor height={100} defaultLanguage="json" value={inputContract} onChange={inputContractChange} />
            </div>
          )}
        </div>
        <div className="tx-btn-wrap btn-center">
          <button type="button" onClick={openPinWrap} id="allowBtn">
            Continue <i className="fa fa-arrow-right" />
          </button>
        </div>

        <div className="field readonly">
          <span style={{ minWidth: 125 }}>Contract Address</span>
          <input id="address" readOnly />
        </div>
      </form>

      <div className="keystation-tx-json" id="tx-json"></div>

      <PinWrap show={false} pinType="tx" onChildKey={onChildKey} />
    </BlockUi>
  );
};

export default connect((state) => ({
  user: state.user
}))(Deploy);
