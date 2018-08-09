# async-merge-calls
Merge asynchronous calls with other duplicate calls in progress

## Example

Below is an example of how calls will be merged to reduce the number of times redis gets called.

Redis will be called once to get `1` and another for `2` while each callback will be properly called with the result from redis.

Redis will be called once again when no existing calls are in progress for a given id.

```
const mergeCalls = require('async-merge-calls');

function readFromRedis(id, done) {
	redis.get(id, done);
}

function printResult(err, result) {
	if (err) throw err;
	console.log(result);
}

const readFromRedisAggregated = mergeCalls(readFromRedis);
readFromRedisAggregated(1, printResult);
readFromRedisAggregated(1, printResult);
readFromRedisAggregated(2, printResult);
```

`readFromRedis` will be called once with `1` and another time with `2`.