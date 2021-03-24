import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import BlockUi from 'react-block-ui';
import 'react-block-ui/style.css';
import Form from '@rjsf/core';

import ContractMenu from './ContractMenu';

import { getFileSize } from '../../utils';

const Query = () => {
  const $ = window.jQuery;
  const { t, i18n } = useTranslation();
  const [inputContract, inputContractChange] = useState('{}');
  const [formData, setFormData] = useState({});
  const [schema, setSchema] = useState();
  const [blocking, setBlocking] = useState(false);
  const cosmos = window.cosmos;

  const queryContract = async () => {
    try {
      const input = Buffer.from(schema ? JSON.stringify(formData) : inputContract).toString('base64');
      setBlocking(true);
      const address = $('#contract_address').val().trim();
      const data = await fetch(`${cosmos.url}/wasm/v1beta1/contract/${address}/smart/${input}`).then((res) => res.text());
      $('#tx-json').text(data);
    } catch (ex) {
      alert(ex.message);
    } finally {
      setBlocking(false);
    }
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

  const clearSchemaFile = (e) => {
    $('#filename-schema').text('Query Schema File');
    $('#schema-file').val('');
    setSchema(false);
    e.preventDefault();
  };

  return (
    <BlockUi tag="div" blocking={blocking}>
      <ContractMenu selected="query" />
      <div className="keystation-form">
        <div className="keystation-tx-info" id="tx-info">
          <div className="field">
            <span>Contract Address</span>
            <input id="contract_address" />
          </div>

          <div className="field">
            <label className="file-upload">
              <input type="file" id="schema-file" onChange={onSchemaFileChange} />
              <i className="fa fa-cloud-upload" /> <small id="filename-schema">Query Schema File</small>
              {schema && <i className="fa fa-trash" onClick={clearSchemaFile} />}
            </label>
          </div>
          {schema && <Form schema={schema} formData={formData} onChange={({ formData }) => setFormData(formData)} />}

          {!schema && (
            <div className="field">
              <span>Input</span>
              <Editor theme="vs-dark" height={100} defaultLanguage="json" value={inputContract} onChange={inputContractChange} />
            </div>
          )}
        </div>
        <div className="tx-btn-wrap btn-center">
          <button type="button" onClick={queryContract} id="allowBtn">
            Continue <i className="fa fa-arrow-right" />
          </button>
        </div>
      </div>
      <div className="keystation-tx-json" id="tx-json"></div>
    </BlockUi>
  );
};

export default Query;
