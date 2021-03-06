import {
	assert
} from 'chai';
import * as mockStore from '../../mockStore';
import proxyquire from 'proxyquire';
import sinon from 'sinon';
// import configureMockStore from 'redux-mock-store';
// import thunk from 'redux-thunk';
// import testState from '../../testState';
// import * as action from '../../../src/modules/markets/actions/update-selected-page-num';

describe(`modules/markets/actions/update-selected-page-num.js`, () => {
	proxyquire.noPreserveCache().noCallThru();

	let { state, store } = mockStore.default;
	let out, action;
	let mockUpdateURL = { updateURL: () => {} };

	sinon.stub(mockUpdateURL, 'updateURL', (href) => {
		return { type: 'UPDATE_URL', href };
	});

	action = proxyquire('../../../src/modules/markets/actions/update-selected-page-num', {
		'../../link/actions/update-url': mockUpdateURL,
		'../../../selectors': proxyquire('../../../src/selectors', {
			'./modules/link/selectors/links': proxyquire('../../../src/modules/link/selectors/links', {
				'../../../store': store
			})
		})
	});

	beforeEach(() => {
		store.clearActions();
		// Mock the Window object
		global.window = {};
		global.window.location = {
			pathname: '/',
			search: '?isOpen=true'
		};
		global.window.history = {
			pushState: (a, b, c) => true
		};
		global.window.scrollTo = (x, y) => true;
	});

	afterEach(() => {
		store.clearActions();
		global.window = {};
	});

	it(`should return a func. which dispatches UPDATE_SELECTED_PAGE_NUM and UPDATE_URL actions`, () => {
		out = [{
			type: 'UPDATE_SELECTED_PAGE_NUM',
			selectedPageNum: 2
		}, {
			type: 'UPDATE_URL',
			href: '/?search=test%20testtag&tags=testtag%2Ctag'
		}, {
			type: 'UPDATE_SELECTED_PAGE_NUM',
			selectedPageNum: 5
		}, {
			type: 'UPDATE_URL',
			href: '/?search=test%20testtag&tags=testtag%2Ctag'
		}];
		store.dispatch(action.updateSelectedPageNum(2));
		store.dispatch(action.updateSelectedPageNum(5));

		assert.deepEqual(store.getActions(), out, `Didn't dispatch an update selected page number action or a update url action as expected`);
	});
});
