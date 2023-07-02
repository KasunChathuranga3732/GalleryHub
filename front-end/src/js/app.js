const btnSelectFiles = $("#select-files");
const overlay = $('#overlay');
const download = $(".image > svg");
const dropZoneElm = $('#drop-zone');
const mainElm = $("body > main");
const imgPreviewElm = $("#preview-image");
const popupWindowElm = $(".popup-image");
const btnClose = $("#btn-close");
const btnNext = $("#btn-next");
const slideShow = $("#slideShow");
const btnPrevious = $("#btn-previous");
const REST_API_URL = "http://localhost:8080/gallery";
const cssLoaderHtml = `<div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>`;
let imageUrlList = [];
let currentImageIndex = 0;

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

    if(!slideShow.hasClass('d-none')){
        if(event.key === 'Escape'){
            btnClose.trigger('click');
        }
        if(event.key === 'ArrowRight'){
            btnNext.trigger('click');
        }
        if(event.key === 'ArrowLeft'){
            btnPrevious.trigger('click');
        }
    }
});

dropZoneElm.on('dragover', (eventData)=>{
    eventData.preventDefault();
});

dropZoneElm.on('drop', async (eventData)=>{
    eventData.preventDefault();
    const droppedFiles = eventData.originalEvent.dataTransfer.files;
    const imageFiles = Array.from(droppedFiles).filter(file=>file.type.startsWith("image/"));

    if(!imageFiles.length) return;

    overlay.addClass('d-none');
    await uploadImages(imageFiles);
    await location.reload();
});

overlay.on('drop', (evt)=> evt.preventDefault());
overlay.on('dragover', (evt)=> evt.preventDefault());



mainElm.on('click', '.image:not(.loader):not(.download)', (evt)=>{
    if (!evt.target.classList.contains('download')) {
        popupWindowElm.removeClass('d-none');
        const imgDiv = $(evt.target).closest('.image');
        const imageUrl = imgDiv.css('background-image').replace(/^url\(['"](.+)['"]\)/, '$1');

        const selectedImgIndex = imageUrlList.findIndex((value) => value === imageUrl);
        showPopupImage(selectedImgIndex);
    }
});

btnNext.on('click', ()=>{
    const nextIndex = currentImageIndex + 1;
    showPopupImage(nextIndex);
});

btnPrevious.on('click', ()=>{
    const previousIndex = currentImageIndex - 1;
    showPopupImage(previousIndex);
});

btnClose.on('click', (eventData)=>{
    $(eventData.target).parent().addClass('d-none');
});

function showPopupImage(index) {
    if (index >= imageUrlList.length) {
        index = 0;
    }

    if (index < 0) {
        index = imageUrlList.length - 1;
    }

    imgPreviewElm.css('background-image', `url('${imageUrlList[index]}')`);
    currentImageIndex = index;

}



mainElm.on('click', '.image > .download', (eventData)=>{
    const imgELm = $(eventData.target).parents('div');
    if(imgELm === $('.image > .download')) return;
    let url = $(imgELm).css('background-image');
    let name = url.split("/");
    let fileName = name[name.length - 1].replace(/^(.+)["]\)/, '$1');
    url = url.replace(/^url\(['"](.+)['"]\)/, '$1');
    downloadImage(url, fileName);
});




function downloadImage(url, fileName){

    fetch(`${REST_API_URL}/images/downloadImage/${fileName}`)
        .then(response => response.blob())
        .then(blob => {
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            link.click();

            URL.revokeObjectURL(url); // Clean up the temporary URL
        })
        .catch(error => {
            console.error('Error:', error);
        });
}


function uploadImages(imageFiles){
    const formData = new FormData();
    imageFiles.forEach(imageFile =>{
        const divElm = $(`<div class="image loader">
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
        imageUrlList = data;
        data.forEach(url=>{
            const divElm = $(`<div class="image">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-down-circle download" viewBox="0 0 16 16">
                                  <path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V4.5z"/>
                                </svg>
                            </div>`);

            divElm.css('background-image', `url('${url}')`);
            mainElm.append(divElm);
        })
    });

    jqxhr.fail(()=>{
        console.log("Can't load images");
    });
}

