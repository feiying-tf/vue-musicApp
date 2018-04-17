function getRandomInt (min, max) {
    // 返回一个随机数min <= return <= max
    return Math.floor(Math.random() * (max - min + 1) + min);
}
// 洗牌函数
export function shuffle (arr) {
    let _arr = arr.slice();
    for (let i = 0; i < _arr.length; i++) {
        let j = getRandomInt(0, i);
        let t = _arr[i];
        _arr[i] = _arr[j];
        _arr[j] = t;
    }
    return _arr;
}
// 节流函数
export function debounce (func, delay) {
    let timer;
    return function (...args) {
        // 在延时期间再次触发，会清除定时器，然后重新计时，
        // 所以最后只会执行一次，即最后的那次
        console.log(timer);
        if (timer) {
            clearTimeout(timer);
        }
        console.log(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}
