var list
var timeToFresh = 1000
var minNumOfWord = 6
var maxNumOfGapWord = 4
var autoSelected = true
var cpuKernelNum = 10
document.getElementById('options-btn').addEventListener('click', function() {
    if (chrome.runtime.openOptionsPage) {
    // 新版API
    chrome.runtime.openOptionsPage();
    } else {
    // 向后兼容
    window.open(chrome.runtime.getURL('options.html'));
    }
    });
init()
function init() {
    chrome.storage.local.get("selectedPreset",(reslut)=>{
        list = reslut.selectedPreset.list
        if(list.length == 0)
        {
            list.push({"content":" ","name":" ","pre":{"index":[],"list":[""]}});
        }
        
        list.sort((a,b)=>a.pre.list.length-b.pre.list.length)
        timeToFresh = reslut.selectedPreset.timeToFresh
        minNumOfWord = reslut.selectedPreset.minNumOfWord
        maxNumOfGapWord = reslut.selectedPreset.maxNumOfGapWord
        autoSelected = reslut.selectedPreset.autoSelected
        if (autoSelected) {
            getFromSelected()
        }
    })
}
var timeOut = true
var stillChange = false
$("#d1").keyup((e) => {
    // console.log(e)
    if (e.keyCode >= 37 && e.keyCode <= 40) {
        return
    }
    $("#d2").hide()
    if (timeOut) {
        timeOut = false
        var func1 = () => {
            if (stillChange) {
                setTimeout(func1, timeToFresh)
            }
            else {
                timeOut = true
                refresh()
            }
            stillChange = false
        }
        setTimeout(func1, timeToFresh)
    }
    else {
        stillChange = true
    }
})
function matchWithMultiKernel(tt2)
{
    return new Promise((resolve,reject)=>{
        var workers = []
        var workersIsRunning = []
        var rest = list.length-1
        var output = []
        var enableCPUNum = cpuKernelNum < list.length ? cpuKernelNum : list.length
        for(var i = 0;i<enableCPUNum;++i)
        {
            var worker = new Worker("./js/worker.js")
            worker.onmessage = (e)=>{
                e.data.output.forEach((v) => {
                    output.push({ paperId: e.data.index, c: v })
                })
                rest-=1;
                if(rest >= 0)
                {
                    // console.log(e.data.wi+":"+rest)
                    workers[e.data.wi].postMessage({wi:e.data.wi,list1:list[rest].pre.list,list2:tt2.list,minNumOfWord:minNumOfWord,maxNumOfGapWord:maxNumOfGapWord,index:rest})
                }
                else
                {
                    workersIsRunning[e.data.wi] = false
                    var ok = true
                    for(var j = 0;j<enableCPUNum;++j)
                    {
                        if(workersIsRunning[j] == true)
                        {
                            ok = false
                            break
                        }
                    }
                    if(ok)
                    {
                        workers.forEach((e)=>e.terminate())
                        resolve(output)
                    }
                }
            }
            workers.push(worker)
            workersIsRunning.push(true)
            worker.postMessage({wi:i,list1:list[rest].pre.list,list2:tt2.list,minNumOfWord:minNumOfWord,maxNumOfGapWord:maxNumOfGapWord,index:rest})
            rest-=1
        }
    })
}
async function refresh(input) {
    if(input == undefined)
    {
        input = $("#d1").text()
    }
    var tt2 = J_Match.stringToList(input)

    // console.time("t1")
    // var output = []
    // list.forEach((element, index) => {
    //     var temp = J_Match.match(element.pre.list, tt2.list, minNumOfWord, maxNumOfGapWord)
    //     temp.forEach((v) => {
    //         output.push({ paperId: index, c: v })
    //     })
    // })
    // console.timeEnd("t1")
    console.time("t2")
    var output = await matchWithMultiKernel(tt2)
    console.timeEnd("t2")
    output.sort((a, b) => b.c.length - a.c.length)

    var set2 = tt2.list.map((v) => -1)
    output.forEach((temp3, index) => {
        var v = temp3.c
        var temp = true
        for (var i = v.length - 1; i >= 0; --i) {
            if (set2[v[i][1]] != -1) {
                temp = false
                break;
            }
        }
        if (temp) {
            v.forEach((vv) => set2[vv[1]] = index)
        }
    })
    var result = input
    for (var i = set2.length - 1; i >= 0; --i) {
        if (set2[i] != -1) {
            var index = tt2.index[i]
            result = result.substring(0, index) + "<span class='hl" + set2[i] % 5 + "' ji=" + set2[i] + ">" + result.substring(index,index + tt2.list[i].length) + "</span>" + result.substring(index + tt2.list[i].length)
        }
    }
    var selectedStart = -1;
    var empty = $("#d1")[0].childNodes.length == 0;
    if(!empty && document.activeElement == $("#d1")[0])
    {
        var sel = window.getSelection()
        var selE = sel.anchorNode.parentElement == $("#d1")[0] ? sel.anchorNode : sel.anchorNode.parentElement
        selectedStart = sel.anchorOffset
        var childs = $("#d1")[0].childNodes
        var i = 0;
        while(childs[i] != selE)
        {
            if(childs[i] instanceof Text)
            {
                selectedStart+=childs[i].length
            }
            else if(childs[i] instanceof Element) 
            {
                selectedStart+=childs[i].innerText.length
            }
            else
            {
                console.error("出错啦！类型不对")
                console.error(childs[i])
            }
            i+=1;
        }
    }
    $("#d1").html(result)
    empty = result.length == 0
    if(!empty && selectedStart != -1)
    {
        var childs = $("#d1")[0].childNodes
        var i = -1;
        var nowElemLength = 0;
        do
        {
            selectedStart-=nowElemLength
            i+=1;
            if(i >= childs.length)
            {
                selectedStart+=nowElemLength
                i-=1
                break
            }
            if(childs[i] instanceof Text)
            {
                nowElemLength=childs[i].length
            }
            else if(childs[i] instanceof Element) 
            {
                nowElemLength=childs[i].innerText.length
            }
            else
            {
                console.error("出错啦！类型不对2")
                console.error(childs[i])
            }
        }
        while(nowElemLength <= selectedStart)
        if(childs[i] instanceof Text)
        {
            window.getSelection().collapse(childs[i],selectedStart)
        }
        else if(childs[i] instanceof Element) 
        {
            window.getSelection().collapse(childs[i].firstChild,selectedStart)
        }
    }

    $("[ji]").click((e) => {
        var ji = e.target.getAttribute("ji")
        var temp4 = output[ji]
        var record = list[temp4.paperId]
        var fromWordIndex = temp4.c[0][0]
        var toWordIndex = temp4.c[temp4.c.length - 1][0]
        var fromIndex = record.pre.index[fromWordIndex]
        var toIndex = record.pre.index[toWordIndex] + record.pre.list[toWordIndex].length + 1
        var string = record.content.substring(fromIndex, toIndex)

        for (var k = temp4.c.length - 1; k >= 0; --k) {
            var i = temp4.c[k][0]
            var index = record.pre.index[i]-fromIndex
            string = string.substring(0,index)+"<span class='hl" + ji % 5 + "'>" + string.substring(index,index + record.pre.list[i].length) + "</span>" + string.substring(index + record.pre.list[i].length)
        }


        $("#d2").html(string).show()
    })
}
async function getFromSelected() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    let result;
    try {
        [{ result }] = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => getSelection().toString(),
        });
    } catch (e) {
        return; // ignoring an unsupported page like chrome://extensions
    }
    // $("#d1").html(result)
    refresh(result)
}
// var popover = new bootstrap.Popover($("#d1"),{
//     content:"H",
//     offset:"1000,1"
    
// })
// popover.show()
// var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
// var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
//     return new bootstrap.Popover(popoverTriggerEl)
// })