const btnSelectFiles = $("#select-files");
const overlay = $('#overlay');
const download = $(".image > svg");
const dropZoneElm = $('#drop-zone');
const mainElm = $("body > main");
const REST_API_URL = "http://localhost:8080/gallery";
const cssLoaderHtml = `<div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>`;

loadAllImages();

btnSelectFiles.on('click', ()=>{
    overlay.removeClass("d-none");
});

overlay.on('click', (event)=>{
    if(event.target === overlay[0]) overlay.addClass('d-none');
});

$(document).on('keydown', (event)=>{
    if(event.key === 'Escape' && !overlay.hasClass('d-none')){
        overlay.addClass("d-none");
    }
});

dropZoneElm.on('dragover', (eventData)=>{
    eventData.preventDefault();
});

dropZoneElm.on('drop', (eventData)=>{
    eventData.preventDefault();
    const droppedFiles = eventData.originalEvent.dataTransfer.files;
    const imageFiles = Array.from(droppedFiles).filter(file=>file.type.startsWith("image/"));

    if(!imageFiles.length) return;

    overlay.addClass('d-none');
    uploadImages(imageFiles);
});

overlay.on('drop', (evt)=> evt.preventDefault());
overlay.on('dragover', (evt)=> evt.preventDefault());

mainElm.on('click', '.image:not(.loader)', (evt)=>evt.target.requestFullscreen());



mainElm.on('click', '.image > svg', (eventData)=>{
    // if($(eventData.target) !== $('.image > svg')) return;
    // console.log('target', $(eventData.target));
    const imgELm = $(eventData.target).parent();
    let url = $(imgELm).css('background-image');
    let name = url.split("/");
    let fileName = name[name.length - 1].replace(/^(.+)["]\)/, '$1');
    url = url.replace(/^url\(['"](.+)['"]\)/, '$1');
    downloadImage(url, fileName);
});




function downloadImage(url, fileName){
    let link = document.createElement('a');
    link.href = url;
    console.log("link",link);
    link.download = fileName;
    // $(link).attr('target', '_blank');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

}


function uploadImages(imageFiles){
    const formData = new FormData();
    imageFiles.forEach(imageFile =>{
        const divElm = $(`<div class="image loader">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-down-circle" viewBox="0 0 16 16">
                                  <path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V4.5z"/>
                            </svg>
                        </div>`);
        divElm.append(cssLoaderHtml);
        mainElm.append(divElm);
        formData.append("images", imageFile);
    });

    const jqxhr = $.ajax(`${REST_API_URL}/images`, {
        method: 'POST',
        data: formData,
        contentType:false,
        processData: false
    });

    jqxhr.done((imageUrlList)=>{
        imageUrlList.forEach(imageUrl =>{
            const divElm = $('.image.loader').first();
            divElm.css('background-image', `url('${imageUrl}')`);
            divElm.empty();
            divElm.removeClass('loader');
        })
    });

    jqxhr.always(()=>$('.image.loader').remove());

}


function loadAllImages(){
    const jqxhr = $.ajax(`${REST_API_URL}/images`);
    jqxhr.done((data)=>{
        data.forEach(url=>{
            const divElm = $(`<div class="image">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-down-circle" viewBox="0 0 16 16">
                                  <path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V4.5z"/>
                                </svg>
                            </div>`);
            divElm.css('background-image', `url('${url}')`);
            mainElm.append(divElm);
        })
    });

    jqxhr.fail(()=>{

    });
}





