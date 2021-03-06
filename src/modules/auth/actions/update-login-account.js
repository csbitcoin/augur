export const UPDATE_LOGIN_ACCOUNT = 'UPDATE_LOGIN_ACCOUNT';
export const CLEAR_LOGIN_ACCOUNT = 'CLEAR_LOGIN_ACCOUNT';

export function updateLoginAccount(loginAccount) {
	return { type: UPDATE_LOGIN_ACCOUNT, data: loginAccount };
}

export function clearLoginAccount() {
	return { type: CLEAR_LOGIN_ACCOUNT };
}
