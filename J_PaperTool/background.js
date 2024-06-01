chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get("selectedPreset", (reslut) => {
        if(reslut.selectedPreset == undefined)
        {
            var selectedPreset = {id:0,list:[],timeToFresh:1000,minNumOfWord:6,maxNumOfGapWord:4,autoSelected:true}
            chrome.storage.local.set({presets:[selectedPreset],selectedPreset: selectedPreset});
        }
    });
    console.log('插件更新！重置');
});

// chrome.contextMenus.create({
//     type: 'normal',
//     title: 'J_Match查重',
//     id: 'tab1',
//     contexts: ['selection']
// }, function () {
//     console.log('contextMenus are create.');
// });
// chrome.contextMenus.onClicked.addListener((e)=>{
//     if(e.menuItemId == "tab1" && e.selectionText)
//     {
//         chrome.windows.create({
//             url:"./popup.html",
//             type:"popup",
//             width:400,
//         })
//     }
// })