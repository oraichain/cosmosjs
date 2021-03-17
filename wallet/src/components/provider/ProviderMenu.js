import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const ProviderMenu = ({ selected }) => {
    const { t, i18n } = useTranslation();
    const providerMenu = [
        {
            path: 'set',
            label: 'Set Provider Scripts'
        },
        {
            path: 'edit',
            label: 'Edit Provider Scripts'
        }
    ];

    return (
        <h2 className="contract-menu">
            {providerMenu.map((item) => {
                if (item.path === selected) return <span key={item.path}>{item.label}</span>;
                return (
                    <Link key={item.path} to={`/${i18n.language}/provider/${item.path}`}>
                        <button>{item.label}</button>
                    </Link>
                );
            })}
        </h2>
    );
};

export default ProviderMenu;
