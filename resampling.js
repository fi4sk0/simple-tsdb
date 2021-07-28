module.exports = function resample(from, to, count, points) {

    var resampled = []
    var span = (to - from) / count;

    var thisFrom = from;

    var pointIndex = 0;

    for (let i = 0; i < count; i++) {
        var thisTo = thisFrom + span;

        let min = Infinity;
        let max = -Infinity;
        let meanRaw = 0;
        let meanOverlapSum = 0;

        let anySourceSampleConsumed = false;

        while (pointIndex < points.length) {

            var [pFrom, pValue] = points[pointIndex];
            var pTo
            if (pointIndex+1 < points.length) {
                pTo = points[pointIndex+1][0]
            } else {
                pTo = to
            }

            // Clamp from to values to resampling point
            var cpFrom = thisFrom > pFrom ? thisFrom : pFrom;
            var cpTo = thisTo < pTo ? thisTo : pTo;
            var clampedTimespan = cpTo - cpFrom;

            if (clampedTimespan > 0) {
                if (min != null && max != null && pValue != null) {
                    min = Math.min(min, pValue);
                    max = Math.max(max, pValue);
                    meanRaw += pValue * clampedTimespan;
                    meanOverlapSum += clampedTimespan;
                } else {
                    min = null;
                    max = null;
                    meanRaw = null;
                }
                anySourceSampleConsumed = true;
            }

            if (thisTo < pTo) {
                break;
            }
            else {
                pointIndex++;
            }

        }

        if (anySourceSampleConsumed) {
            resampled.push({
                from: thisFrom,
                to: thisTo,
                min: min,
                max: max,
                mean: meanRaw != null ? (meanRaw / meanOverlapSum) : null
            });
        } else {
            // There was no overlapping source sample
            resampled.push({
                from: thisFrom,
                to: thisTo,
                min: null,
                max: null,
                mean: null
            });
        }

        thisFrom = thisTo;
    }

    return resampled
}