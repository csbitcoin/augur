import { assert } from 'chai';
import assertions from 'augur-ui-react-components/lib/assertions';
import * as mockStore from '../../mockStore';

import { formatNumber, formatShares, formatEther } from '../../../src/utils/format-number';
import { formatDate } from '../../../src/utils/format-date';

import { abi } from '../../../src/services/augurjs';

import sinon from 'sinon';
import proxyquire from 'proxyquire';

describe('modules/portfolio/selectors/login-account-markets', () => {
	proxyquire.noPreserveCache().noCallThru();

	let actual, expected;
	const { store, state } = mockStore.default;
	state.marketCreatorFees = {
		'0xMARKET1': abi.bignum('10'),
		'0xMARKET2': abi.bignum('11')
	};

	const { loginAccount, allMarkets } = store.getState();

	const mockedLinks = {
		selectMarketLink: () => {}
	};
	sinon.stub(mockedLinks, 'selectMarketLink', () => (
		{
			text: 'test',
			className: 'test-class',
			href: '/fake/path',
			onClick: 'fake function for testing'
		}
	));

	let stubbedSelectors = {
		loginAccount,
		allMarkets
	};

	let proxiedSelector = proxyquire('../../../src/modules/my-markets/selectors/my-markets', {
		'../../link/selectors/links': mockedLinks,
		'../../../selectors': stubbedSelectors,
		'../../../store': store
	});

	actual = proxiedSelector.default();

	expected = [
		{
			id: '0xMARKET1',
			marketLink: {
				className: "test-class",
				href: "/fake/path",
				onClick: 'fake function for testing',
				text: "test"
			},
			description: 'test-market-1',
			endDate: formatDate(new Date('2017/12/12')),
			volume: formatNumber(100),
			fees: formatEther(abi.bignum('10')),
			numberOfTrades: formatNumber(8),
			averageTradeSize: formatNumber(15),
			openVolume: formatNumber(80)
		},
		{
			id: '0xMARKET2',
			marketLink: {
				className: "test-class",
				href: "/fake/path",
				onClick: 'fake function for testing',
				text: "test"
			},
			description: 'test-market-2',
			endDate: formatDate(new Date('2017/12/12')),
			volume: formatNumber(100),
			fees: formatEther(abi.bignum('11')),
			numberOfTrades: formatNumber(8),
			averageTradeSize: formatNumber(15),
			openVolume: formatNumber(80)
		}
	];

	it('should return the expected array', () => {
		assert.deepEqual(expected, actual, `Didn't return the expected array`);
	});

	it('should deliver the expected shape to augur-ui-react-components', () => {
		let proxiedSelector = proxyquire('../../../src/modules/my-markets/selectors/my-markets', {
			'../../../selectors': stubbedSelectors,
			'../../../store': store
		});

		actual = proxiedSelector.default();

		assertions.myMarkets(actual);
	});
});
