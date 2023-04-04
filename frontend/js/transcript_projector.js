$( document ).ready(function() {
    eel.expose(puton_transcript_projector);
    function puton_transcript_projector(text){
        text=text.split('||').join('<br>');
        document.getElementById("text").innerHTML =text;
    }
});