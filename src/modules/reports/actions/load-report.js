import { augur } from '../../../services/augurjs';
import { decryptReport } from '../../reports/actions/decrypt-report';
import { updateReport } from '../../reports/actions/update-reports';

export function loadReport(branchID, period, eventID, marketID, callback) {
	return (dispatch, getState) => {
		const { loginAccount, marketsData } = getState();
		const marketData = marketsData[marketID];
		console.log('augur.getReport', branchID, period, eventID, loginAccount.address);
		augur.getReport(branchID, period, eventID, loginAccount.address, marketData.minValue, marketData.maxValue, marketData.type, (report) => {
			console.log('augur.getReport ok:', report);
			if (report) {
				const reportedOutcomeID = report.report;
				if (reportedOutcomeID && reportedOutcomeID !== '0' && !reportedOutcomeID.error) {
					dispatch(updateReport(branchID, eventID, {
						period,
						marketID,
						reportedOutcomeID,
						isIndeterminate: report.isIndeterminate,
						reportHash: null,
						salt: null,
						isUnethical: false,
						isRevealed: true,
						isCommitted: true
					}));
					return callback(null);
				}
				augur.getReportHash(branchID, period, loginAccount.address, eventID, (reportHash) => {
					console.log('augur.getReportHash:', reportHash);
					if (!reportHash || reportHash.error || !parseInt(reportHash, 16)) {
						dispatch(updateReport(branchID, eventID, {
							period,
							marketID,
							reportedOutcomeID: null,
							salt: null,
							isUnethical: false,
							reportHash: null,
							isRevealed: false,
							isCommitted: false
						}));
						return callback(null);
					}
					decryptReport(loginAccount, branchID, period, eventID, (err, decryptedReport) => {
						console.log('decryptReport:', err, decryptedReport);
						if (err) return callback(err);
						if (decryptedReport.reportedOutcomeID) {
							const { report, isIndeterminate } = augur.unfixReport(
								decryptedReport.reportedOutcomeID,
								marketData.minValue,
								marketData.maxValue,
								marketData.type);
							console.log('unfixed report:', report);
							console.log('isIndeterminate:', isIndeterminate);
							decryptedReport.reportedOutcomeID = report;
							decryptedReport.isIndeterminate = isIndeterminate;
						}
						dispatch(updateReport(branchID, eventID, {
							period,
							marketID,
							...decryptedReport,
							reportHash,
							isUnethical: false,
							isRevealed: false,
							isCommitted: true
						}));
						callback(null);
					});
				});
			}
		});
	};
}
