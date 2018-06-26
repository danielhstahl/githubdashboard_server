## API for aggregating statistics

### Average time to close issues

Endpoint: /:owner/:repo/time_issues?min_date=[date in iso format (eg 2018-03-09T15:27:26Z)]&aggregation=[aggregation time in ms (eg 604800000)]

### Number of issues

Endpoint: /:owner/:repo/issues?min_date=[date in iso format (eg 2018-03-09T15:27:26Z)]&aggregation=[aggregation time in ms (eg 604800000)]

### Number of releases

Endpoint: /:owner/:repo/releases?min_date=[date in iso format (eg 2018-03-09T15:27:26Z)]&aggregation=[aggregation time in ms (eg 604800000)]

### Number of commits

Endpoint: /:owner/:repo/commits?min_date=[date in iso format (eg 2018-03-09T15:27:26Z)]&aggregation=[aggregation time in ms (eg 604800000)]