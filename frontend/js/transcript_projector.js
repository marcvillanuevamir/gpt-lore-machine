$( document ).ready(function() {
    eel.expose(puton_transcript_projector);
    function puton_transcript_projector(text){
        //=text.split('||').join('<br>');
        //parts=text.split(".");
        //text=parts[parts.length - 1];
        text=getLastNWords(text,15);
        text=text.split('||').join('<br>');
        document.getElementById("text").innerHTML =text;
    }
});


function getLastNWords(str, n) {
    let words = str.split(' ');
    return words.slice(Math.max(words.length - n, 0)).join(' ');
}