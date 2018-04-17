import storage from 'good-storage';
const SEARCH_KEY = '__search__';
const SEARCH_MAX_LENGTH = 15;
const PLAY_KEY = '__play__';
const PLAY_MAX_LENGTH = 200;
const FAVORITE_KEY = '__favorite__';
const FAVORITE_MAX_LENGTH = 200;
// const FAVORITE_KEY = '__favorite__';
// const FAVORITE_MAX_LEN = 200;
/*
 * 将元素放到最前面的地方，如果有重复的就先将重复的删掉，
 * 如果操作maxLen，那么就删除最后一个
 * @param {*} arr 数组
 * @param {*} val 被添加的元素
 * @param {*} compare 比较的条件，返回index
 * @param {*} maxLen 最大长度
 */
function insertArray (arr, val, compare, maxLen) {
    const index = arr.findIndex(compare);
    // 如果放入的数据时第一个，那么就直接return
    if (index === 0) {
        return;
    }
    // 如果查找的值在arr中，并且大于0，那么就删掉，然后放到第一个
    if (index > 0) {
        arr.splice(index, 1);
    }
    arr.unshift(val);
    // 如果
    if (maxLen && arr.length > maxLen) {
        arr.pop();
    }
 }
export function saveSearch (query) {
    let searches = storage.get(SEARCH_KEY, []);
    // 将query插入到当前耳朵历史列表中
    insertArray(searches, query, (item) => {
        return item === query;
    }, SEARCH_MAX_LENGTH);
    // 进行保存
    storage.set(SEARCH_KEY, searches);
    return searches;
}
// 从本地缓存中去读取searches
export function loadSearch () {
    return storage.get(SEARCH_KEY, []);
 }
 // 删除当前query
export function deleteSearch (query) {
    let searches = storage.get(SEARCH_KEY, []);
    deleteFromArray(searches, (item) => {
        return item === query;
    });
    storage.set(SEARCH_KEY, searches);
    return searches;
}
function deleteFromArray (arr, compare) {
    const index = arr.findIndex(compare);
    if (index > -1) {
        arr.splice(index, 1);
    }
}
export function clearSearch () {
    // 移除对应key值的search
    storage.remove(SEARCH_KEY);
    return [];
}
export function savePlay (song) {
    let songs = storage.get(PLAY_KEY, []);
    insertArray(songs, song, (item) => {
        return item.id === song.id;
    }, PLAY_MAX_LENGTH);
    // 缓存新的数组
    storage.set(PLAY_KEY, songs);
    return songs;
}
export function loadPlay () {
    // 读取本地储存
    console.log('这儿是本地存储');
    console.log(storage.get(PLAY_KEY, []));
    return storage.get(PLAY_KEY, []);
}
export function saveFavorite (song) {
    let songs = storage.get(FAVORITE_KEY, []);
    insertArray(songs, song, (item) => {
        return item.id === song.id;
    }, FAVORITE_MAX_LENGTH);
    storage.set(FAVORITE_KEY, songs);
    return songs;
}
export function deleteFavorite (song) {
    let songs = storage.get(FAVORITE_KEY, []);
    deleteFromArray(songs, (item) => {
        return song.id === item.id;
    });
    storage.set(FAVORITE_KEY, songs);
    return songs;
}
export function loadFavorite () {
    return storage.get(FAVORITE_KEY, []);
}
