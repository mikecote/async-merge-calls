const async = require('async');
const mergeCalls = require('../');

test('should callback with different values when hash is differnet', async () => {
	const testFnCallback = jest.fn((letter, done) => {
		setImmediate(done, null, letter);
	});
	const mergedFn = mergeCalls(testFnCallback);
	await new Promise((resolve, reject) => {
		async.parallel({
			firstCall: done => mergedFn('a', done),
			secondCall: done => mergedFn('b', done),
			thirdCall: done => mergedFn('c', done),
		}, (err, result) => {
			if (err) {
				reject(err);
				return;
			}
			expect(result.firstCall).toBe('a');
			expect(result.secondCall).toBe('b');
			expect(result.thirdCall).toBe('c');
			expect(testFnCallback).toHaveBeenCalledTimes(3);
			resolve();
		});
	});
});

test('should re-use first call to respond to other concurrent calls with same hash', async () => {
	const testFnCallback = jest.fn((letter, done) => {
		setImmediate(done, null, letter);
	});
	const mergedFn = mergeCalls(testFnCallback);
	await new Promise((resolve, reject) => {
		async.parallel({
			firstCall: done => mergedFn('a', done),
			secondCall: done => mergedFn('a', done),
			thirdCall: done => mergedFn('a', done),
		}, (err, result) => {
			if (err) {
				reject(err);
				return;
			}
			expect(result.firstCall).toBe('a');
			expect(result.secondCall).toBe('a');
			expect(result.thirdCall).toBe('a');
			expect(testFnCallback).toHaveBeenCalledTimes(1);
			resolve();
		})
	});
});

test('should callback with error when call fails', async () => {
	const testFnCallback = jest.fn((letter, done) => {
		setImmediate(done, new Error(`Invalid letter ${letter}`));
	});
	const mergedFn = mergeCalls(testFnCallback);
	await new Promise((resolve, reject) => {
		async.parallel({
			firstCall: done => mergedFn('a', done),
			secondCall: done => mergedFn('a', done),
			thirdCall: done => mergedFn('a', done),
		}, (err) => {
			expect(err).toBeTruthy();
			expect(err.message).toBe('Invalid letter a');
			resolve();
		});
	});
});

test('should call original callback again after first call finishes', async () => {
	const testFnCallback = jest.fn((letter, done) => {
		setImmediate(done, null, letter);
	});
	const mergedFn = mergeCalls(testFnCallback);
	await new Promise((resolve, reject) => {
		mergedFn('a', (err, result) => {
			if (err) {
				reject(err);
				return;
			}
			expect(result).toBe('a');
			resolve(result);
		});
	});
	await new Promise((resolve, reject) => {
		mergedFn('a', (err, result) => {
			if (err) {
				reject(err);
				return;
			}
			expect(result).toBe('a');
			expect(testFnCallback).toHaveBeenCalledTimes(2);
			resolve();
		});
	});
});
