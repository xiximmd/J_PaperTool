var selectedPreset
var numOfWords = 0
init()
document.getElementById('shortcuts-btn').addEventListener('click', function() {
    chrome.tabs.create({ 'url': 'chrome://extensions/shortcuts' });
    });
$("#b5").dblclick(()=>{
    selectedPreset = {id:0,list:[],timeToFresh:1000,minNumOfWord:6,maxNumOfGapWord:4,autoSelected:true}
    chrome.storage.local.set({selectedPreset:selectedPreset})
    location.reload()
})
$("#b4").click(()=>{
    var files = $("#file2")[0].files
    if(files.length > 0)
    {
        var file = files[0]
        let reader = new FileReader();
        reader.onload = function(){
            var readed = JSON.parse(this.result)
            if(readed.id != undefined)//检测是否是有效文件
            {
                chrome.storage.local.set({selectedPreset:readed})
                location.reload()
            }
        }
        reader.readAsText(file)
    }
})
$("#b1").click(() => {

    var files = $("#file")[0].files
    function readItem(i) {
        if (i >= files.length) {
            chrome.storage.local.set({ selectedPreset: selectedPreset })
            $("#file")[0].value = null
            return
        }
        var file = files[i];
        if (file.type == "application/pdf") {
            let reader = new FileReader();
            var name = file.name
            reader.onload = function () {
                PDFtoTXT(this.result).then((v) => {
                    selectedPreset.list.push({ name: name, content: v, pre: J_Match.stringToList(v) })
                    addItem(selectedPreset.list[selectedPreset.list.length - 1], selectedPreset.list.length - 1)
                    readItem(i + 1);
                })
            };
            reader.readAsArrayBuffer(file);
        }
        else {
            console.error('以下文件不是pdf格式！')
            console.error(file)
            readItem(i + 1);
        }
    }
    readItem(0)
})
$("#b2").click(() => {
    var v = $("#i7").val()
    selectedPreset.list.push({ name: $("#i6").val(), content: v, pre: J_Match.stringToList(v) })
    addItem(selectedPreset.list[selectedPreset.list.length - 1], selectedPreset.list.length - 1)
    chrome.storage.local.set({ selectedPreset: selectedPreset })
    $("#i6").val("")
    $("#i7").val("")
})
function init() {
    chrome.storage.local.get("selectedPreset", (reslut) => {
        selectedPreset = reslut.selectedPreset
        selectedPreset.list.forEach((element, index) => {
            addItem(element, index)
        });
        $("#i1").val(selectedPreset.minNumOfWord)
        $("#i2").val(selectedPreset.maxNumOfGapWord)
        $("#i3").attr("checked",selectedPreset.autoSelected)
        $("#i4").val(selectedPreset.timeToFresh)
    });
    $("#i1").change((e)=>{
        selectedPreset.minNumOfWord = $("#i1").val()
        chrome.storage.local.set({ selectedPreset:selectedPreset });
    })
    $("#i2").change((e)=>{
        selectedPreset.maxNumOfGapWord = $("#i2").val()
        chrome.storage.local.set({ selectedPreset:selectedPreset });
    })
    $("#i3").change((e)=>{
        selectedPreset.autoSelected = $("#i3").prop("checked")
        chrome.storage.local.set({ selectedPreset:selectedPreset });
    })
    $("#i4").change((e)=>{
        selectedPreset.timeToFresh = $("#i4").val()
        chrome.storage.local.set({ selectedPreset:selectedPreset });
    })
    $("#b3").click((e)=>{
        download("Jpreset.json",JSON.stringify(selectedPreset))
    })
}
function addItem(element, index) {
    numOfWords+=element.pre.list.length
    $("#d1").html(numOfWords)
    $("#t1").append(`<tr>
    <th scope="row">`+ (index + 1) + `</th>
    <td>`+ element.name + `</td>
    <td>`+ element.pre.list.length + `</td>
    <td><button type="button" class="btn btn-danger">删除</button></td>
</tr>`)
    var item = $("#t1").children().last()
    item.find("button").dblclick(() => {
        selectedPreset.list.splice(index, 1)

        chrome.storage.local.set({ selectedPreset: selectedPreset }).then(() => {
            // item.remove()
            $("#t1").children().remove()
            numOfWords=0
            selectedPreset.list.forEach((element, index) => {
                addItem(element, index)
            });
        })
    })
}
function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
  }



