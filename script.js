const videoDeviceSelect = document.getElementById('videoDeviceSelect');
const imagesContainer = document.getElementById('imagesContainer');
const takePhotoBtn = document.getElementById('takePhotoBtn');
const videoOutput = document.getElementById('videoOutput');

let imageCapture = null;

navigator.permissions.query({name: 'camera'})
    .then((permissionObj) => {
        console.log(permissionObj.state);
    })
    .catch((error) => {
        console.log('Got error :', error);
    })

takePhotoBtn.addEventListener('click', () => {
    takePhoto();
});


// Listen on device change
videoDeviceSelect.addEventListener('change', (e) => {
    const device = [...e.path[0]].filter(({selected}) => selected).map(({value, label}) => ({value, label}))[0];
    getUserMedia(device);
})

// Fill select with options
navigator.mediaDevices.enumerateDevices().then(results => {
    results.filter(({kind, label}) => kind === 'videoinput' /*&& label.includes('back')*/).forEach(item => {
        console.log(item);
        const option = document.createElement('option');
        option.label = item.label;
        option.value = item.deviceId;
        videoDeviceSelect.appendChild(option);
    });
});

function getUserMedia(device) {
    navigator.mediaDevices.getUserMedia({video: {deviceId: device.value} })
        .then(mediaStream => {
            setReversedView(device.label.includes('front'));
            gotMedia(mediaStream);
        })
        .catch(error => console.error('getUserMedia() error:', error));
}

function gotMedia(mediaStream) {
    const mediaStreamTrack = mediaStream.getVideoTracks()[0];
    imageCapture = new ImageCapture(mediaStreamTrack);

    videoOutput.srcObject = mediaStream;
    videoOutput.play();
}

function takePhoto() {
    imageCapture.takePhoto()
        .then(blob => {
            addToGallery(blob);
        })
        .catch(error => console.error('takePhoto() error:', error));
}

function addToGallery(blob) {
    const image = new Image();
    image.src = URL.createObjectURL(blob);
    image.onload = () => { URL.revokeObjectURL(this.src);}

    imagesContainer.appendChild(image);
}

function setReversedView(isFrontCamera) {
    isFrontCamera ? videoOutput.classList.add('reversed') : videoOutput.classList.remove('reversed');
}
