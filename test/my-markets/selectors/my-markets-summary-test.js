import { assert } from 'chai';
import assertions from 'augur-ui-react-components/lib/assertions';

import sinon from 'sinon';
import proxyquire from 'proxyquire';

import * as mockStore from '../../mockStore';

describe('modules/my-markets/selectors/my-markets-summary', () => {
	proxyquire.noPreserveCache().noCallThru();

	let actual, expected;

	const { store } = mockStore.default;
	const { loginAccount, allMarkets } = store.getState();

	const stubbedSelectors = { loginAccount, allMarkets };

	const proxiedMyMarkets = proxyquire('../../../src/modules/my-markets/selectors/my-markets', {
		'../../../selectors': stubbedSelectors,
		'../../../store': store
	});

	const spiedMyMarkets = sinon.spy(proxiedMyMarkets, 'default');

	const proxiedSelector = proxyquire('../../../src/modules/my-markets/selectors/my-markets-summary', {
		'../../../modules/my-markets/selectors/my-markets': proxiedMyMarkets
	});

	expected = {
		numMarkets: 2,
		totalValue: 21
	};

	before(() => {
		actual = proxiedSelector.default();
	});

	it(`should call 'selectMyMarkets' once`, () => {
		assert(spiedMyMarkets.calledOnce, `Didn't call 'selectMyMarkets' once as expected`);
	});

	it(`should return the correct object`, () => {
		assert.deepEqual(expected, actual, `Didn't return the expected object`);
	});

	it('should return the correct object to augur-ui-react-components', () => {
		assertions.myMarketsSummary(actual);
	});
});
