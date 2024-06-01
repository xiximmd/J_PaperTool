class J_Node {
    constructor(last, x, y, length, numOfChild) {
        this.last = last
        this.x = x
        this.y = y
        this.length = length
        this.numOfChild = numOfChild
    }
    last;
    x;
    y;
    length;
    numOfChild;
}
class J_Match {
    static stringToList(input) {
        //去除标点，去除多余空格
        input = input.replace(/\W/g, " ")
        var matchR = input.matchAll(/\w+/g)
        var index = [...matchR].map((v) => v.index)
        input = input.replace(/ +/g, " ").trim()
        //一律小写
        input = input.toLocaleLowerCase()
        //按空格分开
        return { list: input.split(" "), index: index }
    }
    /**
     * 
     * @param {*} list1 长的list
     * @param {*} list2 短的list
     * @param {*} minNumOfWord 最少匹配单词数，包含
     * @param {*} maxNumOfGapWord 间隔最大单词数，不包含
     * @returns 
     */
    static match(list1, list2, minNumOfWord, maxNumOfGapWord) {
        var list1len = list1.length
        var list2len = list2.length
        var tempOutput = []
        var cache = []
        for (var i = -1; i < maxNumOfGapWord; ++i) {
            var temp = []
            for (var j = 0; j < list2len + maxNumOfGapWord; ++j) {
                temp.push(new J_Node(null, -1, -1, 0, -1));
            }
            cache.push(temp);
        }
        for (var i = 0; i < list1len; ++i) {
            //为防止j - maxNumOfGapWord越界，加maxNumOfGapWord偏移量
            for (var j = list2len - 1 + maxNumOfGapWord; j >= maxNumOfGapWord; --j) {
                if (list1[i] == list2[j - maxNumOfGapWord]) {
                    var maxLength = 0;
                    var last = null
                    for (var i2 = 0; i2 < maxNumOfGapWord; ++i2) {
                        for (var j2 = j - maxNumOfGapWord; j2 < j; ++j2) {
                            if (cache[i2][j2].length > maxLength) {
                                last = cache[i2][j2]
                                maxLength = last.length;
                            }
                        }
                    }
                    if (last != null) {
                        last.numOfChild += 1
                        cache[maxNumOfGapWord][j].last = last;
                    }
                    cache[maxNumOfGapWord][j].length = maxLength + 1
                    cache[maxNumOfGapWord][j].x = i;
                    cache[maxNumOfGapWord][j].y = j - maxNumOfGapWord;
                    cache[maxNumOfGapWord][j].numOfChild = 0
                }
                //取出满足的
                if (cache[0][j].numOfChild == 0) {
                    if(cache[0][j].length >= minNumOfWord)
                    {
                        tempOutput.push(cache[0][j])
                    }
                    cache[0][j] = new J_Node(null, -1, -1, 0, -1);
                }
                else if (cache[0][j].numOfChild > 0) {
                    cache[0][j] = new J_Node(null, -1, -1, 0, -1);
                }
            }
            var temp2 = cache[0]
            cache.shift()
            cache.push(temp2)
        }
        for (var i = 0; i < maxNumOfGapWord; ++i) {
            //为防止j - maxNumOfGapWord越界，加maxNumOfGapWord偏移量
            for (var j = list2len - 1 + maxNumOfGapWord; j >= maxNumOfGapWord; --j) {
                if (cache[i][j].numOfChild == 0 && cache[i][j].length >= minNumOfWord) {
                    tempOutput.push(cache[i][j])
                }
            }
        }
        var output = tempOutput.map((v) => {
            var temp3 = [];
            temp3.push([v.x,v.y])
            while(v.last!=null)
            {
                v = v.last
                temp3.push([v.x,v.y])
            }
            return temp3.reverse()
        })
        //按照长度排序
        // output.sort((v1,v2)=>v2.length-v1.length)
        return output;
    }
}