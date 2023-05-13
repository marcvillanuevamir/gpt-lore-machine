$( document ).ready(function() {

    load_template();
    window.hasprojector=false;

    $("#statusbar").on("click",".cancelprojection",function(e){
        e.preventDefault();
        if (getStatus()=="CHAT"){
            eel.endchat();
        } else{
            eel.endProjection();
        }
        changeStatus("IDDLE");
    });

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

         data["projectprediction"]=$("#project").val();

         if (data["projectprediction"]=="on"){
            changeStatus("GENERATION STREAM");
         }

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

    $("#main ").on('change', '.frontendselect',function() {
        let text=this.value;
        if (text.length>0){
            $(this).closest(".block").find("textarea").val(text);
        }
    });

    //chat
    $("#main ").on("click",".startchat",function(e){
        e.preventDefault();
        let system=$(".chatsystem").val();
        let engine=$(".chatengine").val();
        changeStatus("CHAT");
        eel.startChat(system,engine);
    });


    //transcriber
    
    $("#main ").on("click",".startprojector",function(e){
        e.preventDefault();
        eel.init_transcription_projector();
        window.hasprojector=true;
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



function send_template(data){
    eel.endchat();
    setTimeout(function(){
    eel.initProjector()
    setTimeout(function(){
        //async function send_template(data){
        //var r =eel.process_template( JSON.stringify(data))();
        eel.launch_template( JSON.stringify(data))
        /*
        if (r){
            //add project button
            //alert("rebut!")
        } else {
            alert("error template process")
        }
        */
    }, 1000);
}, 1000);

}

function build_view(o){
    console.log(o);
    let H='';
    H+='<form class="textinputs">';
    o.blocks.block.forEach(function(b) {
      
            console.log(b);
            H+='<div class="block">';
            if (b.type=="p"){
                H+='<p>'+b.text+'</p>';
            }
            if (b.type=="input"){
                H+='<label>'+b.label+'</label>'
                H+='<input id="'+b.id+'" name="'+b.id+'" >';
            }
            if (b.type=="textarea"){
                H+='<label>'+b.label+'</label>';
                let text="";
                if (b.hasOwnProperty("value")) {
                    text=b.value;
                }
                H+='<textarea id="'+b.id+'" name="'+b.id+'" >'+text+'</textarea>';
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

            if (b.type=="chat"){
                H+='<h4>'+b.label+'</h4>'
                H+='<label>System</label>';
                H+='<textarea class="chatsystem">'+b.system+'</textarea>';
                H+='<input type="hidden" class="chatengine" value="'+b.engine+'" >';
                H+='<div class="actions">';
                H+='<button class="btn startchat">Start</button>';
                H+='</div>';
            }
            if(b.option){
                H+='<select class="frontendselect">';
                H+='<option value="">Select a template</option>';
                id="";
                b.option.forEach(function(o) {
                   H+='<option value="'+o.value+'">'+o.title+'</option>';
                   id=o.id;
                });
                H+='</select>';
                H+='<br><br>';
                H+='<textarea id="'+id+'" name="'+id+'" ></textarea>';
            }


            H+='</div>';
     
    });
    if (o.hasOwnProperty("process")) {
    H+='<div class="process">';
    if (o.process.hasOwnProperty("options")) {
    //if ("options" in o.process[0]){
        H+='<div class="bigoptions">';
        H+='<select name="options">';
        H+='<option>Choose a template::::</option>';
        let counter=0;
        o.process[0]["options"].forEach(function(b) {
            H+='<option value="'+counter+'">'+b.title+'</option>';
            counter++;
        });
        H+='</select>';
        //H+='<input type="checkbox" checked id="project" name="project"> <label for="project">Send to projector?</label>';
        H+='<input type="submit" class="btn submit" value="Make predictions" >';
        H+='</div>';
    } else {
        H+='<div class="">'
        H+='<label># Results</label>'
        H+='<input id="res" name="res" type="number" max="10" step="1" value="1" >';
        H+='</div>'
        H+='<div class="rightprocess">';
        H+='<div class="option"><input checked type="checkbox" id="project" name="project"> <label for="project">Send to projector?</label></div>';
        H+='<input type="submit" class="btn submit" value="Make predictions" >';
        H+='</div>';
        H+='</div>';
    
       
    }

    H+='</div>';
}
    H+='</form>';
    H+='<div class="responses" style="display:none">';
    // H+='<h2>Options</h2>'
     H+='<form class="predoptions">';
     H+='<div class="list">';
     H+='</div>';
     H+='<div class="submitactions">';
    H+='<input type="submit" class="submit btn" value="Next template">';

    H+='<button class="sendtoprojector btn" >Send to projector</button>';
    H+='</div>';
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
    //console.log(sentences);
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


function sendtoprojector(){

}

//helpers
function scrolltoBottom(){
    $('body,html').animate({ scrollTop: $('#main').height() }, 800);
}

function changeStatus(status){
    $("#status").text(status);
}
function getStatus(){
    return $("#status").text();
}