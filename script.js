const video = document.getElementById("video");

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");

const status = document.getElementById("status");

const motionCount = document.getElementById("motionCount");
const lastDetected = document.getElementById("lastDetected");

const cameraStatus = document.getElementById("cameraStatus");
const historyList = document.getElementById("historyList");

let stream = null;

let previousFrame = null;

let count = 0;

let detecting = false;


// Start Camera
startBtn.addEventListener("click", async () => {

    try {

        stream = await navigator.mediaDevices.getUserMedia({
            video: true
        });

        video.srcObject = stream;

        cameraStatus.innerText = "ON";

        status.innerText = "Monitoring Motion...";

        detecting = true;

        detectMotion();

    } catch (error) {

        alert("Camera permission denied!");

        console.log(error);
    }

});


// Stop Camera
stopBtn.addEventListener("click", () => {

    detecting = false;

    if (stream) {

        stream.getTracks().forEach(track => {
            track.stop();
        });

        stream = null;
    }

    video.srcObject = null;

    cameraStatus.innerText = "OFF";

    status.innerText = "Camera Stopped";

    previousFrame = null;

});


// Motion Detection
function detectMotion() {

    if (!detecting) {
        return;
    }

    const canvas = document.createElement("canvas");

    const context = canvas.getContext("2d");

    setInterval(() => {

        if (!detecting || video.videoWidth === 0) {
            return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        context.drawImage(
            video,
            0,
            0,
            canvas.width,
            canvas.height
        );

        const currentFrame = context.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
        );

        if (previousFrame) {

            let difference = 0;

            for (
                let i = 0;
                i < currentFrame.data.length;
                i += 4
            ) {

                const currentPixel =
                    currentFrame.data[i];

                const previousPixel =
                    previousFrame.data[i];

                difference += Math.abs(
                    currentPixel - previousPixel
                );
            }

            difference =
                difference /
                (currentFrame.data.length / 4);


            // Motion detected
            if (difference > 15) {

                motionDetected();

            } else {

                status.innerText =
                    "No Motion Detected";
            }
        }

        previousFrame = currentFrame;

    }, 500);
}


// When Motion Detected
function motionDetected() {

    count++;

    motionCount.innerText = count;

    status.innerText =
        "MOTION DETECTED!";

    const now = new Date();

    const time =
        now.toLocaleTimeString();

    lastDetected.innerText = time;

    addHistory(time);
}


// Add detection to history
function addHistory(time) {

    if (
        historyList.children.length === 1 &&
        historyList.children[0].innerText.includes("No motion")
    ) {

        historyList.innerHTML = "";
    }

    const item = document.createElement("li");

    item.innerText =
        "Motion detected at " + time;

    historyList.prepend(item);
}