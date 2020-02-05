var basePieces = [
    [[0, 0]],
    [[0, 0], [0, 1]],
    [[0, 0], [0, 1], [1, 0]],
    [[0, 0], [0, 1], [0, 2]],
    [[0, 0], [0, 1], [0, 2], [0, 3]],
    [[0, 0], [0, 1], [0, 2], [1, 1]],
    [[0, 0], [0, 1], [1, 0], [1, 1]],
    [[0, 0], [0, 1], [0, 2], [1, 2]],
    [[0, 0], [0, 1], [1, 1], [1, 2]],
    [[0, 0], [0, 1], [0, 2], [0, 3], [1, 3]],
    [[0, 0], [0, 1], [0, 2], [1, 1], [2, 1]],
    [[0, 0], [0, 1], [0, 2], [1, 0], [2, 0]],
    [[0, 0], [0, 1], [1, 2], [1, 3], [0, 2]],
    [[0, 0], [1, 0], [1, 1], [1, 2], [2, 2]],
    [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]],
    [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0]],
    [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2]],
    [[0, 0], [0, 1], [1, 0], [2, 1], [2, 0]],
    [[0, 2], [1, 1], [0, 1], [2, 1], [1, 0]],
    [[1, 2], [1, 1], [0, 1], [2, 1], [1, 0]],
    [[0, 0], [0, 1], [0, 2], [0, 3], [1, 2]],
];
var touching = [[0, 1], [0, -1], [-1, 0], [1, 0]];
var diagonal = [[1, 1], [-1, 1], [1, -1], [-1, -1]];
var classNames = ['red', 'green', 'blue', 'yellow'];
var _ = {
    get: (object, path, defaultValue) => (
        (!Array.isArray(path) ? path.replace(/\[/g, '.').replace(/\]/g, '').split('.') : path)
            .reduce((o, k) => (o || {})[k], object) || defaultValue)

}
export function makeAreaSquares() {
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

export function drawPiece(arr, side = 16) {
    var wmax = 0;
    var vmax = 0;
    arr.forEach(v2 => {
        var c = Math.abs(v2[0] + 1) * side;
        var d = Math.abs(v2[1] + 1) * side;
        if (c > wmax) {
            wmax = c;
        }
        if (d > vmax) {
            vmax = d;
        }
    });
    var tmax = Math.max(vmax, wmax);
    return {
        width: vmax,
        height: wmax
    };
}

export function getPieces(side) {
    let pieces = [];
    basePieces.map((p, i) => {
        let { width, height } = drawPiece(p, side);
        pieces.push({
            arr: p,
            id: i,
            width,
            height,
            isSel: false,
        })
    })
    console.log(pieces);
    return pieces;
}


function remove_touching(unoc, area) {
    var nunoc = [];
    for (var i = 0; i < unoc.length; i++) {
        var np = [];
        unoc[i].forEach(v => {
            var flag = false;
            touching.forEach(v2 => {
                var pos = [v[0] + v2[0], v[1] + v2[1]];
                if (pos[0] < 0 || pos[0] >= 20 || pos[1] < 0 || pos[1] >= 20) {
                    return;
                }
                if (contains(pos, unoc[i]))
                    return;
                var b = _.get(area, `${pos[0]}.${pos[1]}.className`);
                if (b === 'red') { //player_color 等于
                    flag = true;
                    return false;
                }
            });

            if (!flag) {
                np.push(v);
            }
        });

        if (np.length > 0) {
            nunoc.push(np);
        }
    }
    return nunoc;
}
function check_corners(unoc, area) {
    var nunoc = [];
    for (var i = 0; i < unoc.length; i++) {
        var flag = false;

        unoc[i].forEach(v => {
            diagonal.forEach(v2 => {
                var pos = [v[0] + v2[0], v[1] + v2[1]];
                if (pos[0] < 0 || pos[0] >= 20 || pos[1] < 0 || pos[1] >= 20) {
                    return;
                }
                var b = _.get(area, `${pos[0]}.${pos[1]}.className`);
                if (b === 'red') { //player_color 等于
                    flag = true;
                    return false;
                }
                if ((v[0] == 0 || v[0] == 19) && (v[1] == 0 || v[1] == 19)) {
                    flag = true;
                    return false;
                }

            });

            if (flag) {
                nunoc.push(unoc[i]);
            }
        });
    }
    return nunoc;
}
// 查看是否还有空余的位置可放
export function check_spaces(pieces, area) {
    var maxlen = 0;
    var unoc = check_corners(remove_touching(check_board(area), area), area);
    for (var i = 0; i < unoc.length; i++) {
        var len = unoc[i].length;
        if (len > maxlen) {
            maxlen = len;
        }
    }
    if (maxlen == 0) {
        return false;
    }
    var minpiece = 400;
    pieces.forEach(piece => {
        if (minpiece > piece.arr.length) {
            minpiece = piece.arr.length;
        }
    });
    return minpiece <= maxlen;
}
// 
function check_board(area) {
    var flags = new Array(400);
    var unoc = [];
    for (var i = 0; i < 400; i++) {
        flags[i] = 0;
    }
    for (var i = 0; i < 20; i++) {
        for (var j = 0; j < 20; j++) {
            if (flags[i * 20 + j]) {
                continue;
            }
            var occupied = classNames.includes(_.get(area, `${i}.${j}.className`))
            if (occupied)
                continue;
            var chunk = [];
            var queue = [[i, j]];
            while (queue.length > 0) {
                var item = queue.pop();
                if (item[0] < 0 || item[1] < 0 || item[0] > 19 || item[1] > 19)
                    continue;
                if (flags[item[0] * 20 + item[1]])
                    continue;
                flags[item[0] * 20 + item[1]] = 1;
                var o = classNames.includes(_.get(area, `${item[0]}.${item[1]}.className`))
                if (!o) {
                    chunk.push(item);
                    queue.push([item[0] - 1, item[1]]);
                    queue.push([item[0] + 1, item[1]]);
                    queue.push([item[0], item[1] - 1]);
                    queue.push([item[0], item[1] + 1]);
                }
            }
            if (chunk.length > 0) {
                unoc.push(chunk);
            }
        }
    }
    return unoc;
}
function contains(needle, haystack) {
    var flag = false;
    haystack.forEach(v => {
        if (v[0] == needle[0] && v[1] == needle[1]) {
            flag = true;
            return false;
        }
    });
    return flag;
}

export function check_valid_placement(piece, area) {
    var flag = false;
    // make sure piece is not touching piece of same color
    piece.forEach(v => {
        touching.forEach(v2 => {
            var pos = [v[0] + v2[0], v[1] + v2[1]];
            if (pos[0] < 0 || pos[0] >= 20 || pos[1] < 0 || pos[1] >= 20) {
                return;
            }
            if (contains(pos, piece))
                return;
            var b = _.get(area, `${pos[0]}.${pos[1]}`)
            if (b.className === 'red') {
                flag = true;
                return false;
            }
        });

        if (flag) {
            return false;
        }
    });

    if (flag) {
        return false;
    }
    // make sure piece is connected diagonally
    piece.forEach(v => {
        diagonal.forEach(v2 => {
            var pos = [v[0] + v2[0], v[1] + v2[1]];
            if (pos[0] < 0 || pos[0] >= 20 || pos[1] < 0 || pos[1] >= 20) {
                return;
            }
            if (contains(pos, piece))
                return;
            var b = _.get(area, `${pos[0]}.${pos[1]}`)
            if (b.className === 'red') {
                flag = true;
                return false;
            }
        });
        if ((v[0] == 0 || v[0] == 19) && (v[1] == 0 || v[1] == 19)) {
            flag = true;
            return false;
        }
    });

    if (!flag)
        return false;
    return true;
}