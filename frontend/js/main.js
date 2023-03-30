$( document ).ready(function() {

    load_template();

    $("#main ").on("click",".textinputs .submit",function(e){
        e.preventDefault();
        let data={};
      
         $(".textinputs:visible input[name]").each(function(e){
            data[$(this).attr("name")]=$(this).val();
           
         });  
         $("#loader").show();
         console.log(data);
         send_template(data);
    });

    $("#main ").on("click",".predoptions .submit",function(e){
        e.preventDefault();
        let data={"prediction":$(".predoptions input[type='radio'][name='predresponse']:checked").val()};
        
        console.log(data);
        eel.save_page(data);
        load_template();
    });

    $("#main ").on("click",".startrecording",function(e){
        eel.start_audio_transcription();
    });

});


async function load_template() {
    var t = await eel.get_template()();
        if (t) {
            build_view(t);          
        } else {
           // alert("error");
        }
    }

async function send_template(data){
    var r =eel.process_template( JSON.stringify(data))();
    if (r){
        //alert("rebut!")
    } else {
        alert("error template process")
    }
}

function build_view(o){
    let H='';
    H+='<form class="textinputs">';
    o.blocks.forEach(function(b) {
      
            console.log(b);
            H+='<div class="block">';
            if (b.type=="p"){
                H+='<p>'+b.text+'</p>';
            }
            if (b.type=="input"){
                H+='<label>'+b.label+'</label>'
                H+='<input id="'+b.id+'" name="'+b.id+'" >';
            }
            if (b.type=="transcription"){
                H+='<div class="livetranscribe"></div>'
                H+='<textarea id="'+b.id+'" class="transcription"></textarea>';
                H+='<div class="actions"><button class="btn startrecording">Record</button></div>'
            }
            H+='</div>';
     
    });
    
    H+='<div class="process">'
    H+='<div class="">'
    H+='<label># Resultats</label>'
    H+='<input id="res" name="res" type="number" max="10" step="1" value="1" >';
    H+='</div>'
    H+='<input type="submit" class="btn submit" value="Fer prediccions" >';
    H+='</div>'
    H+='</form>';

    H+='<div class="responses" style="display:none">';
    H+='<h2>Opcions</h2>'
    H+='<form class="predoptions">';
    H+='<div class="list">';
    H+='</div>';
    H+='<input type="submit" class="submit btn" value="Continuar">';
    H+='</form>';
    H+='</div>';
    console.log(H);
    $("#main").html(H);
}

eel.expose(end);
function end(){
    let H='<div class="end">Fi</div>';
    $("#main").html(H);
}

eel.expose(get_transcription);
function get_transcription(sentences){
    console.log(sentences);
    //let newtext=sentences.split('||').join('\n');
    let newtext=sentences.split('||').join('<br>');
    $(".livetranscribe").html(newtext);
    //$(".transcription").val( newtext);
}

eel.expose(archive_transcription);
function archive_transcription(sentences){
    console.log(sentences);
    let newtext=sentences.split('||').join('\n');
    let oldtranscription= $(".transcription").val();
    $(".transcription").val(newtext+'\n\n'+oldtranscription);
}

eel.expose(res_finished);
function res_finished(options){
    $("#loader").hide();
}

eel.expose(getRes);
function getRes(res) {
   let new_res='<div class="res"><input type="radio" name="predresponse" value="'+res+'"><label>'+res+'</label></div>';
  $(".responses .list").append(new_res);
  $(".responses").show();
}