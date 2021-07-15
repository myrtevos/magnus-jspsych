/*
 * jsPsych plugin to actively request access to microphone
 * Borrows code and concepts from https://www.twilio.com/blog/mediastream-recording-api
 * Michael W. Weiss
 * see also: www.jspsych.org (Joshua R. de Leeuw)
 */

jsPsych.plugins["record-permission"] = (function() {

  var plugin = {};

  plugin.info = {
    name: "record-permission",
    parameters: {
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed above the button.'
      },
      button_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button label',
        default:  'Enable access to microphone',
        description: 'Label of the button.'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    var html = "";
    
    // add the prompt above the button
    html += '<div id="prompt">' + trial.prompt + '<br><br></div>';
    
    // add the button asking for permission
    html += '<button class="mic jspsych-btn">' + trial.button_label + '</button>';
    
    display_element.innerHTML = html;

    // listen for successful permission to microphone
    const getMic = document.querySelector('.mic');
    
    if (navigator.mediaDevices.getUserMedia) {
      console.log('getUserMedia supported.');
      getMic.addEventListener('click', async () => {        
        getMic.setAttribute('hidden', 'hidden');      
        display_element.innerHTML = 'Please grant access now.';			
        try {
          const constraints = { audio: true };          
          let onSuccess = function (stream) {
            const mediaRecorder = new MediaRecorder(stream);          
            console.log('Permission granted');
            jsPsych.finishTrial(); // advance to next trial in timeline        
          }
          let onError = function (err) {
            console.log('The following error occured: ' + err);          
            var html = "";
            html += 'Without temporary access to the microphone, the study cannot continue.';
            html += '<br>Please clear permissions for this site and start over.';
            display_element.innerHTML = html; // post error message
          }
        navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
        } catch {
          console.log('An error has occurred.')
          var html = "";
          html += 'An error has occurred.';
          display_element.innerHTML = html; // post error message
        }
      });
    } else {
      console.log('getUserMedia not supported on this browser');
      var html = "";
      html += 'This computer or browser is not supported.';
      html += '<br>Without temporary access to the microphone, the study cannot continue.';
      html += '<br>Please try again on a different browser or device.';
      display_element.innerHTML = html; // post error message                      
    }
  };

  return plugin;
  
})();