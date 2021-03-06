import { augur } from '../../../services/augurjs';
import { updateBranch } from '../../app/actions/update-branch';
import { loadReports } from '../../reports/actions/load-reports';
import { clearOldReports } from '../../reports/actions/clear-old-reports';
import { revealReports } from '../../reports/actions/reveal-reports';
import { collectFees } from '../../reports/actions/collect-fees';
import { loadEventsWithSubmittedReport } from '../../my-reports/actions/load-events-with-submitted-report';

const tracker = {
	checkPeriodLock: false,
	feesCollected: false,
	reportsRevealed: false,
	notSoCurrentPeriod: 0
};

export function checkPeriod(unlock, cb) {
	return (dispatch, getState) => {
		const { loginAccount, branch } = getState();
		if (branch.id && loginAccount.address && loginAccount.rep !== '0') {
			const currentPeriod = augur.getCurrentPeriod(branch.periodLength);
			if (unlock || currentPeriod > tracker.notSoCurrentPeriod) {
				tracker.feesCollected = false;
				tracker.reportsRevealed = false;
				tracker.notSoCurrentPeriod = currentPeriod;
				tracker.checkPeriodLock = false;
				dispatch(clearOldReports());
			}
			console.log('checkPeriod tracker:', tracker);
			if (!tracker.checkPeriodLock) {
				tracker.checkPeriodLock = true;
				augur.checkPeriod(branch.id, branch.periodLength, loginAccount.address, (err, reportPeriod) => {
					console.log('checkPeriod complete:', err, reportPeriod);
					if (err) {
						tracker.checkPeriodLock = false;
						return cb && cb(err);
					}
					dispatch(updateBranch({ reportPeriod }));
					dispatch(loadEventsWithSubmittedReport());
					dispatch(clearOldReports());
					dispatch(loadReports((err) => {
						if (err) {
							tracker.checkPeriodLock = false;
							return cb && cb(err);
						}
						if (branch.isReportRevealPhase) {
							if (!tracker.reportsRevealed) {
								tracker.reportsRevealed = true;
								dispatch(revealReports((err) => {
									console.log('revealReports complete:', err);
									if (err) {
										tracker.reportsRevealed = false;
										tracker.checkPeriodLock = false;
										return console.error('revealReports:', err);
									}
									if (!tracker.feesCollected) {
										tracker.feesCollected = true;
										dispatch(collectFees((err) => {
											console.log('collectFees complete:', err);
											tracker.checkPeriodLock = false;
											if (err) {
												tracker.reportsRevealed = false;
												return console.error('revealReports:', err);
											}
										}));
									}
								}));
							}
						} else {
							tracker.checkPeriodLock = false;
						}
						cb && cb(null);
					}));
				});
			}
		}
	};
}
