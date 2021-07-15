/*
 * jsPsych plugin to record audio as OGG, replay and rerecord it, and upload to JATOS
 * Paired with audio-elicitation.css
 * A hybrid of Michael W. Weiss' record-audio-JATOS plugin, and Becky Gilbert's html-audio-response plugin
 * Borrows code and concepts from https://www.twilio.com/blog/mediastream-recording-api
 * see also: www.jspsych.org (Joshua R. de Leeuw) and www.jatos.org (Lange, Kühn, & Filevich)
 */

jsPsych.plugins["audio-elicitation"] = (function () {

    var plugin = {};

    plugin.info = {
        name: "audio-elicitation",
        parameters: {
            stimulus: {
                type: jsPsych.plugins.parameterType.HTML_STRING,
                pretty_name: 'Stimulus',
                default: undefined,
                description: 'The string to be displayed'
            },
            prompt: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Prompt',
                default: null,
                description: 'Any content here will be displayed above the buttons.'
            },
            margin_vertical: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Margin vertical',
                default: 0,
                description: 'The vertical margin of the button.'
            },
            margin_horizontal: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Margin horizontal',
                default: 8,
                description: 'The horizontal margin of the button.'
            },
            recording_light: {
                type: jsPsych.plugins.parameterType.HTML_STRING,
                pretty_name: 'Recording light',
                default: '<div id="jspsych-html-audio-response-light"><recordinglight class="Rec"></div>',
                description: 'HTML to display while recording is in progress.'
            },
            recording_light_off: {
                type: jsPsych.plugins.parameterType.HTML_STRING,
                pretty_name: 'Recording light (off state)',
                default: '<div id="jspsych-html-audio-response-light"><recordinglight class="notRec"></div>',
                description: 'HTML to display while recording is not in progress.'
            },
            audio_filename: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Audio filename',
                default: null,
                description: 'The name of the audio file (no extension). If empty, uses timestamp.'
            },
            timeout: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Recording timeout',
                default: 30000,
                description: 'The time (in milliseconds) until the recorder times out and stops recording.'
            },
            record_button_label: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Button label record',
                default: 'Record',
                description: 'The text that appears on the button to start recording.'
            },
            stop_button_label: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Button label stop',
                default: 'Stop',
                description: 'The text that appears on the button to stop recording.'
            },
            rerecord_button_label: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Button label rerecord',
                default: 'Rerecord',
                description: 'The text that appears on the button to overwrite the recording with a new recording.'
            },
            upload_button_label: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Button label upload',
                default: 'Upload',
                description: 'The text that appears on the button to upload the recording to JATOS.'
            }
        }
    }

    plugin.trial = function (display_element, trial) {

        if (typeof trial.stimulus === 'undefined') {
            console.error('Required parameter "stimulus" missing in html-audio-response');
        }

        // set the width of the audio container to the width of the button div
        // yes, this is the only thing I'm using jquery for, fight me
        $(display_element).ready(function() {
            $("#response-audio").css({
              'width': (($("#jspsych-audio-elicitation-buttons").width() - trial.margin_horizontal) + 'px')
            });
          });

        // start of adding HTML...
        var html = "";

        // add stimulus
        html += '<div id="jspsych-audio-elicitation-stimulus">' + trial.stimulus + '</div>';

        // add the prompt above the buttons
        html += '<div class="prompt">' + trial.prompt + '<br><br></div>';

        // add recording off light
        html += '<div class="recording-light-container">' + trial.recording_light_off + '</div>';

        // add audio element container with hidden audio element
        html += '<div class="audio-container"><audio id="response-audio" controls style="visibility:hidden;"></audio></div>';

        // add the buttons
        html += '<div id="jspsych-audio-elicitation-buttons"><button class="record jspsych-btn" style="margin:' + trial.margin_vertical + 'px ' + trial.margin_horizontal + 'px">' + trial.record_button_label + '</button>' +
            '<button class="stop jspsych-btn" hidden="hidden" style="margin:' + trial.margin_vertical + 'px ' + trial.margin_horizontal + 'px" disabled>' + trial.stop_button_label + '</button>' +
            '<button class="upload jspsych-btn" style="margin:' + trial.margin_vertical + 'px ' + trial.margin_horizontal + 'px" disabled>' + trial.upload_button_label + '</button></div>';

        // ...end of adding HTML
        display_element.innerHTML = html;

        // prepare for recording
        const constraints = { audio: true };
        let chunks = [];
        //var audio_data;

        // prepare for interactions
        const record = document.querySelector('.record');
        const stop = document.querySelector('.stop');
        const player = document.querySelector('#response-audio');
        //const prompt = document.querySelector('.prompt');
        const light = document.querySelector('.recording-light-container');
        const uploadButton = document.querySelector('.upload');

        // if getUserMedia succeeds...
        let onSuccess = function (stream) {

            const mediaRecorder = new MediaRecorder(stream);

            // listen for clicks to record
            record.onclick = function () {
                mediaRecorder.start();
                console.log(mediaRecorder.state);
                console.log("recorder started");

                record.style.visibility = 'hidden';
                uploadButton.style.visibility = 'hidden';
                player.style.visibility = 'hidden';
                stop.style.visibility = 'visible';
                light.innerHTML = trial.recording_light;

                stop.disabled = false;
                record.disabled = true;

                jsPsych.pluginAPI.setTimeout(function(){
                    mediaRecorder.stop();
                    console.log("recorder timed out");
                    stop.style.visibility = 'hidden';
                    stop.disabled = true;
                    light.innerHTML = trial.recording_light_off;
                    player.style.visibility = 'visible';
                    record.style.visibility = 'visible';
                    record.disabled = false;
                }, 30000);
            }

            // listen for click to stop recording audio
            stop.onclick = function () {
                mediaRecorder.stop();
                console.log(mediaRecorder.state);
                console.log("recorder stopped");

                stop.style.visibility = 'hidden';
                stop.disabled = true;

                record.disabled = false;
                record.style.visibility = 'visible';
                record.innerHTML = trial.rerecord_button_label;

                uploadButton.style.visibility = 'visible';
                uploadButton.disabled = false;

                player.style.visibility = 'visible';
                
                light.innerHTML = trial.recording_light_off;
            }

            // when recording is stopped...
            mediaRecorder.onstop = function (e) {

                console.log("recording stopped.");

                const blob = new Blob(chunks, { 'type': 'audio/ogg; codecs=opus' });
                chunks = [];
                const audioURL = window.URL.createObjectURL(blob);
                player.src = audioURL;

                // upload the audio blob as OGG to JATOS with given filename
                uploadButton.onclick = function (e) {
                    uploadButton.disabled = true;
                    if (trial.audio_filename === null) {
                        trial.audio_filename = String(Date.now());
                      };
                      var filename = trial.audio_filename + ".ogg";
                      //var audio_data = { url: audioURL, str: filename };
                      jatos.uploadResultFile(blob, filename).done(() => {
                        console.info(filename + " uploaded");
                    });

                    end_trial();
                }
            }

            // function to end trial when it is time
            function end_trial() {

                // gather the data to store for the trial
                var endTime = performance.now();
                var response_time = endTime - startTime;
                var trial_data = {
                    rt: response_time,
                    stimulus: trial.stimulus,
                    audio_filename: trial.audio_filename,
                };

                // clear the display
                display_element.innerHTML = '';

                // move on to the next trial
                jsPsych.finishTrial(trial_data);
            }

            // gathering chunks of audio
            mediaRecorder.ondataavailable = function (e) {
                chunks.push(e.data);
            }
        }

        let onError = function (err) {
            console.log('The following error occurred: ' + err);
        }

        // attempt to getUserMedia  
        navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);

        // keep track of start time for eventual rt variable
        var startTime = performance.now();
    };

    return plugin;
})();