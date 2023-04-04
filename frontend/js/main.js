$( document ).ready(function() {

    load_template();

    $("#main ").on("click",".textinputs .submit",function(e){
        e.preventDefault();
        let data={};
      
         $(".textinputs:visible input[name]").each(function(e){
            data[$(this).attr("name")]=$(this).val();
           
         });  
         $(".textinputs:visible select[name]").each(function(e){
            data[$(this).attr("name")]=$(this).val();
           
         });  

         $(".textinputs:visible textarea[name]").each(function(e){
            data[$(this).attr("name")]=$(this).val();
           
         });  

         $("#loader").show();
         console.log(data);
         send_template(data);
         scrolltoBottom();
    });

    $("#main ").on("click",".predoptions .submit",function(e){
        e.preventDefault();
        let data={"prediction":$(".predoptions input[type='radio'][name='predresponse']:checked").val()};
        
        console.log(data);
        eel.save_page(data);
        load_template();
        scrolltoBottom();
    });

    
    $("#main ").on("click",".startrecording",function(e){
        eel.init_transcription_projector();
    })

    $("#main ").on("click",".startrecording",function(e){
        e.preventDefault();
        eel.start_audio_transcription();
        $(".startrecording").addClass("hidden");
        $(".stoprecording").removeClass("hidden");
        $(".pauserecording").removeClass("hidden");
        eel.change_recording_state("recording");
    });

    $("#main ").on("click",".stoprecording",function(e){
        e.preventDefault();
        $(".stoprecording").addClass("hidden");
        $(".pauserecording").addClass("hidden");
        $(".resumerecording").addClass("hidden");
        $(".startrecording").removeClass("hidden");
        eel.change_recording_state("stop");
    });

    $("#main ").on("click",".pauserecording",function(e){
        e.preventDefault();
        $(".resumerecording").removeClass("hidden");
        $(".pauserecording").addClass("hidden");
        eel.change_recording_state("pause");
    });

    $("#main ").on("click",".resumerecording",function(e){
        e.preventDefault();
        $(".resumerecording").toggleClass("hidden");
        $(".pauserecording").toggleClass("hidden");
        eel.change_recording_state("recording");
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
               
                H+='<textarea id="'+b.id+'" class="transcription" name="transcription"></textarea>';
                H+='<div class="livetranscribe"></div>'
                H+='<div class="actions">';
                H+='<button class="btn startrecording">Record</button>';
                H+='<button class="btn pauserecording hidden">Pause</button>';
                H+='<button class="btn resumerecording hidden">Resume</button>';
                H+='<button class="btn stoprecording hidden">End recording</button>';
                H+='<button class="btn startprojector">Start projector</button>';
                
                H+='</div>';
            }
            H+='</div>';
     
    });
    
    H+='<div class="process">';
    if ("options"in o.process[0]){
        H+='<div class="bigoptions">';
        H+='<select name="options">';
        H+='<option>Choose a template::::</option>';
        let counter=0;
        o.process[0]["options"].forEach(function(b) {
            H+='<option value="'+counter+'">'+b.title+'</option>';
            counter++;
        });
        H+='</select>';
        H+='<input type="submit" class="btn submit" value="Make predictions" >';
        H+='</div>';
    } else {
        H+='<div class="">'
        H+='<label># Results</label>'
        H+='<input id="res" name="res" type="number" max="10" step="1" value="1" >';
        H+='</div>'
        H+='<input type="submit" class="btn submit" value="Make predictions" >';
        H+='</div>';
    
       
    }
    H+='</div>';
    H+='</form>';
    H+='<div class="responses" style="display:none">';
    // H+='<h2>Options</h2>'
     H+='<form class="predoptions">';
     H+='<div class="list">';
     H+='</div>';
    H+='<input type="submit" class="submit btn" value="Continue">';
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
    $(".transcription").val((oldtranscription+'\n\n'+newtext).trim());
    $(".livetranscribe").html("")
}

eel.expose(finished_transcription);
function finished_transcription(){
    let lasttext=$(".livetranscribe").text();
    let oldtranscription= $(".transcription").val();
    $(".transcription").val(oldtranscription+'\n\n'+lasttext);
    $(".livetranscribe").html("");
}

eel.expose(res_finished);
function res_finished(options){
    $("#loader").hide();
    scrolltoBottom();
}

eel.expose(getRes);
function getRes(res,type="radio") {
    if (type=="radio"){
        let new_res='<div class="res"><input type="radio" name="predresponse" value="'+res+'"><label>'+res+'</label></div>';
        $(".responses .list").append(new_res);
    } else {
        //block of text with no options to choose 
        let new_res='<div class="res"><textarea name="predresponse" >'+res+'</textarea></div>';
        $(".responses .list").append(new_res);
  
    }
  
  $(".responses").show();
}


//helpers
function scrolltoBottom(){
    $('body,html').animate({ scrollTop: $('#main').height() }, 800);
}