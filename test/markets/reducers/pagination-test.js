import { assert } from 'chai';
import { UPDATE_SELECTED_PAGE_NUM } from '../../../src/modules/markets/actions/update-selected-page-num';
import { UPDATE_SELECTED_FILTER_SORT } from '../../../src/modules/markets/actions/update-selected-filter-sort';
import { UPDATE_KEYWORDS } from '../../../src/modules/markets/actions/update-keywords';
import { UPDATED_SELECTED_MARKETS_HEADER } from '../../../src/modules/markets/actions/update-selected-markets-header';
import reducer from '../../../src/modules/markets/reducers/pagination';
import testState from '../../testState';

describe(`modules/markets/reducers/pagination.js`, () => {
	let action, expectedOutput, test;
	let thisTestState = Object.assign({}, testState);

	it(`should update the selected page number`, () => {
		action = {
			type: UPDATE_SELECTED_PAGE_NUM,
			selectedPageNum: 5
		};
		expectedOutput = {
			selectedPageNum: 5,
			numPerPage: 10
		};
		test = reducer(thisTestState.pagination, action);

		assert.deepEqual(test, expectedOutput, `Didn't update the selected page number`);
	});

	it(`should handle a update selected sort`, () => {
		action = {
			type: UPDATE_SELECTED_FILTER_SORT
		};
		expectedOutput = {
			selectedPageNum: 1,
			numPerPage: 10
		};
		test = reducer(thisTestState.pagination, action);

		assert.deepEqual(test, expectedOutput, `Didn't handle an update to Selected Sort`);
	});

	it(`should update keywords`, () => {
		action = {
			type: UPDATE_KEYWORDS
		};
		expectedOutput = {
			selectedPageNum: 1,
			numPerPage: 10
		};
		test = reducer(thisTestState.pagination, action);

		assert.deepEqual(test, expectedOutput, `Didn't handle the update keywords action`);
	});

	it(`should update the selected markets header`, () => {
		action = {
			type: UPDATED_SELECTED_MARKETS_HEADER
		};
		expectedOutput = {
			selectedPageNum: 1,
			numPerPage: 10
		};
		test = reducer(thisTestState.pagination, action);

		assert.deepEqual(test, expectedOutput, `Didn't handle an update selected markets header action`);
	});

});
