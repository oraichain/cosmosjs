import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useHistory } from 'react-router';

const Home = () => {
  const { t, i18n } = useTranslation();

  return (
    <div className="menu">
      <Link to={`/${i18n.language}/contract/query`} className="button full">
        {t('interact')}
      </Link>
      <Link to={`/${i18n.language}/send`} className="button full">
        {t('send')}
      </Link>
      <Link to={`/${i18n.language}/provider/set`} className="button full">
        {t('interactScript')}
      </Link>
      <Link to={`/${i18n.language}/airequest/set`} className="button full">
        {t('interactRequest')}
      </Link>
    </div>
  );
};

export default Home;
