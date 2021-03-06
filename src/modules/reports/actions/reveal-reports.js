import async from 'async';
import { updateReports } from '../../reports/actions/update-reports';
import { addRevealReportTransaction } from '../../transactions/actions/add-reveal-report-transaction';

export function revealReports(cb) {
	return (dispatch, getState) => {
		const callback = cb || ((e) => console.log('revealReports:', e));
		const { branch, loginAccount, reports } = getState();
		// Make sure that:
		//  - branch is in the second half of its reporting period
		//  - user is logged in and has Rep
		//  - that this user has committed reports to reveal
		if (branch.isReportRevealPhase && loginAccount.rep && reports) {
			const branchReports = reports[branch.id];
			if (branchReports) {
				const revealableReports = Object.keys(branchReports)
					.filter(eventID => branchReports[eventID].reportHash &&
					branchReports[eventID].reportHash.length && !branchReports[eventID].isRevealed && branchReports[eventID].period === branch.reportPeriod)
					.map(eventID => {
						const obj = { ...branchReports[eventID], eventID };
						return obj;
					});
				if (revealableReports && revealableReports.length && loginAccount.id) {
					async.eachSeries(revealableReports, (report, nextReport) => {
						let type;
						if (report.isScalar) {
							type = 'scalar';
						} else if (report.isCategorical) {
							type = 'categorical';
						} else {
							type = 'binary';
						}
						console.log('add reveal report tx:', report.eventID, report.marketID, report.reportedOutcomeID, report.salt, report.minValue, report.maxValue, type, report.isUnethical, report.isIndeterminate);
						dispatch(addRevealReportTransaction(report.eventID, report.marketID, report.reportedOutcomeID, report.salt, report.minValue, report.maxValue, type, report.isUnethical, report.isIndeterminate, (e) => {
							if (e) return nextReport(e);
							dispatch(updateReports({
								[branch.id]: {
									[report.eventID]: {
										...report,
										isRevealed: true
									}
								}
							}));
							nextReport();
						}));
					}, (e) => {
						if (e) return callback(e);
						callback(null);
					});
				}
			}
		}
	};
}
