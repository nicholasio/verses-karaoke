module.exports = {
	parser: 'babel-eslint',
	parserOptions: {
		ecmaFeatures: {
			generators: true,
			experimentalObjectRestSpread: true
		},
		sourceType: 'module',
		allowImportExportEverywhere: false
	},
	env: {
		node: true,
		es6: true
	},
	plugins: ['prettier', 'babel'],
	extends: ['airbnb', 'prettier', 'prettier/react'],
	settings: {
		'import/resolver': {
			node: {
				extensions: ['.js', '.json', '.css', '.styl']
			}
		}
	},
	globals: {
		window: true,
		document: true,
		__dirname: true,
		__DEV__: true,
		CONFIG: true,
		process: true,
		jest: true,
		describe: true,
		test: true,
		it: true,
		expect: true,
		beforeEach: true,
		fetch: true,
		alert: true
	},
	rules: {
		'no-tabs': 0,
		'class-methods-use-this': 1,
		'max-len': 0,
		'global-require': 0,
		'import/no-dynamic-require': 0,
		'indent': [2, 'tab', { 'SwitchCase': 1 }],
		'no-plusplus': [2, { 'allowForLoopAfterthoughts': true }],
		'react/jsx-indent': [2, 'tab'],
		'react/jsx-filename-extension': 0,
		'react/no-danger': 0,
		'no-unused-vars': [ 'error', { args: 'none' } ],
		// See https://github.com/evcohen/eslint-plugin-jsx-a11y/issues/340
		"jsx-a11y/anchor-is-valid": [ "error", {
				"components": [ "Link" ],
				"specialLink": [ "to" ]
		}],
		'prettier/prettier': [ 'error', { useTabs: true, tabWidth: 2, singleQuote: true, printWidth: 100, trailingComma: "all" } ]
	}
}