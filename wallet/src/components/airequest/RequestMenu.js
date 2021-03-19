import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const ContractMenu = ({ selected }) => {
    const { t, i18n } = useTranslation();
    const contractMenu = [
        {
            path: 'set',
            label: 'Set Request'
        },
        {
            path: 'get',
            label: 'Get Request'
        }
    ];

    return (
        <h2 className="contract-menu">
            {contractMenu.map((item) => {
                if (item.path === selected) return <span key={item.path}>{item.label}</span>;
                return (
                    <Link key={item.path} to={`/${i18n.language}/airequest/${item.path}`}>
                        <button>{item.label}</button>
                    </Link>
                );
            })}
        </h2>
    );
};

export default ContractMenu;
