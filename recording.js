let recorder;
let recognition;

function sendTranscriptToServer(transcript) {
    $.ajax({
        type: "POST",
        url: "/transcript",
        data: { transcript: transcript },
        success: function(response) {
            console.log("Transcript sent to server successfully");
        },
        error: function(error) {
            console.error("Error sending transcript to server:", error);
        }
    });
}

function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            recorder = new MediaRecorder(stream);
            const chunks = [];

            recorder.ondataavailable = event => {
                if (event.data.size > 0) {
                    chunks.push(event.data);
                }
            };

            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/wav' });
                const audioURL = URL.createObjectURL(blob);
                document.querySelector('#recordedAudio').src = audioURL;

                if ('webkitSpeechRecognition' in window) {
                    recognition = new webkitSpeechRecognition();
                    recognition.lang = 'en-US';
                    recognition.continuous = false;

                    recognition.onresult = event => {
                        const transcript = event.results[0][0].transcript;
                        console.log('Transcript:', transcript);

                        // Send transcript to server
                        sendTranscriptToServer(transcript);
                    };

                    recognition.start();
                } else {
                    console.error('Speech recognition is not supported in this browser.');
                }
            };

            recorder.start();

            // Update the timer
            let seconds = 0;
            const timerElement = document.querySelector('#timer');
            const timerInterval = setInterval(() => {
                seconds++;
                timerElement.textContent = `${Math.floor(seconds / 60)}:${(seconds % 60).toLocaleString('en-US', { minimumIntegerDigits: 2 })}`;
                if (seconds >= 15) {
                    clearInterval(timerInterval);
                    recorder.stop();
                }
            }, 1000);
        })
        .catch(error => {
            console.error('Error accessing microphone:', error);
        });
}

function stopRecording() {
    if (recorder && recorder.state === 'recording') {
        recorder.stop();
    }
    if (recognition) {
        recognition.stop();
    }
}

// Export the functions to make them accessible in other files
module.exports = { startRecording, stopRecording };
