$( document ).ready(function() {

    load_template();

    $("#main").on("click",".submit",function(e){
        e.preventDefault();
        let data={};
      
         $("form:visible input[name]").each(function(e){
            data[$(this).attr("name")]=$(this).val();
           
         });  
         console.log(data);
         send_template(data);
    });

});


async function load_template() {
    var t = await eel.get_template()();
        if (t) {
            build_view(t);          
        } else {
            alert("error");
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
    H+='<form>';
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
            H+='</div>';
     
    });
    
    H+='<div class="process">'

    H+='<label># Resultats</label>'
    H+='<input id="res" name="res" type="number" max="10" step="1" value="1" >';
    H+='<input type="submit" class="submit" >';
    H+='</div>'
    H+='</form>';

    H+='<div class="responses"></div>'
    console.log(H);
    $("#main").html(H);
}


eel.expose(getRes);
function getRes(res) {
  $(".responses").append('<div class="res">'+res+'</div>');
}