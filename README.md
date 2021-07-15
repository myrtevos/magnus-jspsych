# magnus-jspsych
<h2>The materials for the 'magnus' image categorization experiment tutorial</h2>

These are all the assets for the toy jsPsych experiment I built for/during the 15/07/2021 LADAL Opening Webinar (University of Queensland).
(There is a Zoom recording of this webinar, which will eventually be made available on the LADAL YouTube channel.)

This experiment was developed to be run on JATOS (jatos.org), and tested on a local installation of JATOS. To replicate that workflow, see https://www.jatos.org/Installation.html#easy-installation-on-your-local-computer for a guide to getting your own local JATOS installation.

Most of the plugins used in this experiment are 'official' and included in the jsPsych download package. There are two exceptions: 
`jspsych-record-permission.js`, which was developed by Michael W. Weiss (https://github.com/m-w-w/custom-jspsych-plugins); and `jspsych-audio-elicitation.js`, which was built by me but owes a lot to Michael W. Weiss's `record-audio-JATOS.js` plugin and the `jspsych-html-audio-response.js` plugin (https://github.com/becky-gilbert/jsPsych/blob/audio-response/plugins/jspsych-html-audio-response.js) under development by the jsPsych team (Josh de Leeuw and Becky Gilbert). THIS PLUGIN IS NOT FULLY TESTED AND STILL UNDER DEVELOPMENT SO BE VERY CAREFUL IN USING IT.

<h2>audio-elicitation.js</h2>

This plugin has `stimulus` and `prompt` parameters, and a recording light that indicates whether the mic is recording audio (red, pulsing circle) or not (empty circle with a red outline). The recording light can be customized using the `recording_light` and `recording_light_off` parameters (note that the CSS for the current defaults is stored in `audio-elicitation.css`). 
<p></p>

Under the recording light are a Record button and a (disabled) Stop button. Once the user clicks Record, the recording light 'turns on', the Record button disappears, and the Stop button is enabled. Once Stop is clicked, the recorded audio becomes available for playback in a media player, and the user is given the option to either Rerecord or Upload the audio. If the user clicks Rerecord, the first audio recording is overwritten. If the user clicks Upload, the audio file is named according to the `audio_filename` parameter (if left empty, a timedatestamp is used), and uploaded as an .ogg Result file to the JATOS server.
<p></p>

The `timeout` parameter sets a time in milliseconds after which the media recorder times out and stops recording. Default is 30000 (30 seconds). The button labels can be set using the `record_`, `stop_`, `rerecord_`, and `upload_` `button_label` parameters.

This plugin needs JQuery (.js file included in the elicitation folder), which is unfortunate and something I'm planning to resolve.
