

let makeAreaSquares = function () {
    let area = [];
    for (let i = 0; i < 20; i++) {
        let arr = [];
        for (let j = 0; j < 20; j++) {
            arr.push({
                className: '',
                id: j + i * 20,
                text: '',
            })
        }
        area.push(arr);

    }
    return area;
}
var baseIds = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21
];
module.exports = {
    makeAreaSquares, baseIds

}