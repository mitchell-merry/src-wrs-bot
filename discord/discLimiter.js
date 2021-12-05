import Bottleneck from 'bottleneck';

export default new Bottleneck({
    maxConcurrent: 1,
    minTime: 100,
});