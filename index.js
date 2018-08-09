function defaultHasher(args) {
	return args;
}

module.exports = (wrapFn, hasher = defaultHasher) => {
	const callsInProgress = {};
	return (args, done) => {
		const hash = hasher(args);
		if (hash in callsInProgress) {
			callsInProgress[hash].push(done);
			return;
		}
		callsInProgress[hash] = [done];
		wrapFn(args, (err, result) => {
			callsInProgress[hash].forEach(callback => callback(err, result));
			delete callsInProgress[hash];
		});
	};
};
