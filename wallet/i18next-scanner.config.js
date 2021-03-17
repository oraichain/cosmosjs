module.exports = {
  input: [
    'src/**/*.{js,jsx}',
    // Use ! to filter out files or directories
    '!src/**/*.spec.{js,jsx}',
    '!src/i18n/**',
    '!**/node_modules/**'
  ],
  options: {
    debug: true,
    // read strings from functions: IllegalMoveError('KEY') or t('KEY')
    func: {
      list: ['i18next.t', 'i18n.t', 't'],
      extensions: ['.js', '.jsx']
    },

    trans: false,

    // Create and update files `en.json`, `fr.json`, `es.json`
    lngs: ['en', 'vn'],

    ns: [
      // The namespace I use
      'wallet'
    ],

    defaultLng: 'en',
    defaultNs: 'wallet',

    // Put a blank string as initial translation
    // (useful for Weblate be marked as 'not yet translated', see later)
    defaultValue: (lng, ns, key) => '',

    // Location of translation files
    resource: {
      loadPath: 'src/i18n/locales/{{lng}}.json',
      savePath: 'src/i18n/locales/{{lng}}.json',
      jsonIndent: 4
    }
  }
};
