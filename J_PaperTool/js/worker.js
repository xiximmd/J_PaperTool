importScripts("./match.js")
self.onmessage = (e)=>{
    var output = J_Match.match(e.data.list1, e.data.list2, e.data.minNumOfWord, e.data.maxNumOfGapWord)
    self.postMessage({wi:e.data.wi,output:output,index:e.data.index})
}