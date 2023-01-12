$( document ).ready(function() {

    eel.getaudios();

    $("#stop").on("click",function(e){
        e.preventDefault();
        eel.stopProjector();
    });

    $(".textcontrol").on("click",".submit",function(e){
        e.preventDefault();
        let data={};
      
         $("form  input[name],form textarea[name],select[name]").each(function(e){
            data[$(this).attr("name")]=$(this).val();
           
         });  
         //$("#loader").show();
         console.log(data);
         eel.sendtoprojector(data);
    });

    function loadVoices() {
        var voiceSelect = document.getElementById('voice');
        // Fetch the available voices.
          var voices = speechSynthesis.getVoices();
        
        // Loop through each of the voices.
          voices.forEach(function(voice, i) {
          // Create a new option element.
              var option = document.createElement('option');
          
          // Set the options value and text.
              option.value = voice.name;
              option.innerHTML = voice.name;
                
          // Add the option to the voice selector.
              voiceSelect.appendChild(option);
          });
      }
      
      // Execute loadVoices.
      loadVoices();

      // Chrome loads voices asynchronously.
    window.speechSynthesis.onvoiceschanged = function(e) {
        loadVoices();
    };
});

eel.expose(recieveAudios);
function recieveAudios(audios){
    console.log(audios)
    audios.forEach(a => $("#audio").append(new Option(a, a)));
}