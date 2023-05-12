function initVars(){
  window.playing=false;
  window.last_text_H=0;
  window.texts=[];
  window.txt="";
  window.i = 0;
  window.talks=[];
  window.is_speaking=false;
  window.is_typing=false;
  window.voice="";
  window.speed = 50;
  document.getElementById("text").innerHTML ="";
  window.streamedText="";
}

initVars();

function reLaunchBlock(){
  speak(window.talks.shift(),window.voice);
  window.txt=window.texts.shift();
  window.i = 0;
  console.log("handleEndBlock",window.txt);
  document.getElementById("text").innerHTML ="";
  typeWriter();
}

function handleEndBlock(trigger){
  //check if both speak and type are finished and process a new chunk of text
  if (!window.is_speaking && !window.is_typing){
    //launch next block
    if (window.texts.length>0){
      if (trigger=="typing"){
        console.log("stop launched by typing, wait some seconds:::::::::::::::::::::::::::");
        setTimeout(function(){
          reLaunchBlock();
        }, 2000);
      } else {
        reLaunchBlock();
      }
     
    } else {
      //all blocks end
      console.log("ALL BLOCKS END!");
    }
  }
}


function typeWriter() {
  window.is_typing=true;
  
  let screenH=$(window).height();
  if (window.i < window.txt.length) {
    $("#text .shine").removeClass("shine");
      let c=window.txt.charAt(window.i);
      document.getElementById("text").innerHTML += '<span class="shine">'+c+'</span>';
      
      let newtextH=$("#text").height()+100;
      if (newtextH>=screenH){
        //next page
        let lastword=$("#text").text().split(" ").splice(-1,1);
        document.getElementById("text").innerHTML=lastword;
      }
      window.i++;
      window.last_text_H=newtextH;
      setTimeout(typeWriter, window.speed);
     // $("#texttype").stop();
     // $("#texttype").animate({ scrollTop:$("#texttype #text").height()}, 600);
     //$("#texttype").scrollTop($("#texttype #text").height());
  } else {
    console.log("no more text in window.txt");
    $("#text .shine").removeClass("shine");
    //end
    window.is_typing=false;
    handleEndBlock("typing");
  }
}

function animateStreamedText(){
  window.is_typing=true;
  if (window.i < window.streamedText.length) {
    $("#text .shine").removeClass("shine");
    let c= window.streamedText.charAt(window.i);
    window.streamedText=window.streamedText.substring(1);
    document.getElementById("text").innerHTML += '<span class="shine">'+c+'</span>';
    setTimeout(animateStreamedText, window.speed);
  } else {
    //end writing text
    window.is_typing=false;
  }
 
}

function typewriterTheaterChunk(chunk){
  //gets chunks from chat2 in story writing mode
  if (chunk=="<STOP>"){
    //end of stream
    $("#text .shine").removeClass("shine");
  } else {
    window.streamedText+=chunk;
    animateStreamedText();
    $("#texttype").stop();
     $("#texttype").animate({ scrollTop:$("#texttype #text").height()}, 600);
  }
}

function typeWriterChat(chunk) {
  //gets chunks from chat2 in chat mode
  $("#chat .shine").removeClass("shine");
  $("#conversation .text")[0].innerHTML += '<span class="shine">'+chunk+'</span>';
}


eel.expose(recieveChatStream);
function recieveChatStream(chunk){
  if (chunk=="<STOP>"){
    //end of stream 
    $("#chat .shine").removeClass("shine");
  
  } else {
    //new chunk
    typeWriterChat(chunk);
  }
  $("#conversation").stop();
  $("#conversation").animate({ scrollTop:$("#conversation .text").height()}, 600);
}

eel.expose(getPredictionChunk);
function getPredictionChunk(chunk) {
  typewriterTheaterChunk(chunk);
}

eel.expose(preStartProjector);
function preStartProjector(timest){
  window.blocksid=timest;
  document.getElementById("text").innerHTML ="";
  $("#main").show();
  window.playing=true;
  startTheater();
}

eel.expose(endProjection);
function endProjection(){
  window.playing=false;
  window.multipartText = [];
  window.i=10000000000000000000000;
  speechSynthesis.cancel();
  initVars();
  let speed=1000;
  $("#three").fadeOut(speed);
 
  /*
  setTimeout(function(){
    document.getElementById("text").innerHTML="";
}, speed+300);
*/
};



eel.expose(addtext);
function addtext(data,i,id){
  console.log("ID CHECK",id,window.blocksid)
  if (id==window.blocksid){
    window.texts.push(data["cat"]);
    window.talks.push(data["en"]);
    //if (window.texts.length==1){
    if (i==0){
      //init writer and speak 
      window.voice=data["voice"];
      console.log("voice",window.voice);
      window.talks.shift();
      window.txt=window.texts.shift();
      window.i = 0;
      console.log("got first text",window.txt);
      speak(data["en"],window.voice);
      typeWriter();
    } else {
        handleEndBlock();
    } 
  }
}

if ('speechSynthesis' in window) {
    // Speech Synthesis supported 🎉
   }else{
     // Speech Synthesis Not Supported 😣
     alert("Sorry, your browser doesn't support text to speech!");
   }

function speak(text,voicename) {
  window.is_speaking=true;
    var CHARACTER_LIMIT = 200;
      //Support for multipart text (there is a limit on characters)
      window.multipartText = [];

      if (text.length > CHARACTER_LIMIT) {

        var tmptxt = text;

        while (tmptxt.length > CHARACTER_LIMIT) {

          //Split by common phrase delimiters
          var p = tmptxt.search(/[:!?.;]+/);
          var part = '';

          //Coludn't split by priority characters, try commas
          if (p == -1 || p >= CHARACTER_LIMIT) {
            p = tmptxt.search(/[,]+/);
          }

          //Couldn't split by normal characters, then we use spaces
          if (p == -1 || p >= CHARACTER_LIMIT) {
            var words = tmptxt.split(' ');
            for (var i = 0; i < words.length; i++) {
              if (part.length + words[i].length + 1 > CHARACTER_LIMIT)
                break;
              part += (i != 0 ? ' ' : '') + words[i];
            }
          } else {
            part = tmptxt.substr(0, p + 1);
          }

          tmptxt = tmptxt.substr(part.length, tmptxt.length - part.length);
          window.multipartText.push(part);
        }

        //Add the remaining text
        if (tmptxt.length > 0) {
          window.multipartText.push(tmptxt);
        }

      } else {
        //Small text
        window.multipartText.push(text);
      }

      //Play multipart text
      for (var i = 0; i < window.multipartText.length; i++) {

        //Create msg object
        var msg = new SpeechSynthesisUtterance();
      
        msg.volume = 1; // 0 to 1
        msg.rate = 1; // 0.1 to 10
        // msg.rate = usersetting || 1; // 0.1 to 10
        msg.pitch = 1; //0 to 2*/
        msg.text = window.multipartText[i];
        msg.speak = window.multipartText;
        //msg.lang = lang;
        msg.voice = speechSynthesis.getVoices().filter(function(voice) { return voice.name == voicename; })[0];
        msg.onend = function (e) {//self.OnFinishedPlaying;
          //console.log("end msg");
          self.OnFinishedPlaying;
        };
        msg.onerror = function (e) {
          console.log('Error');
          console.log(e);
        };
        /*GC*/
        msg.onstart = function (e) {
          var curenttxt = e.currentTarget.text;
          //console.log(curenttxt);
        
        };
        //console.log(msg);
        if (window.playing){
          speechSynthesis.speak(msg);
        }
      
      }
      msg.onend = function (e) {
        console.log("end all speak msg");
        self.OnFinishedPlaying;
        window.is_speaking=false;
        handleEndBlock("speaking");
      };
   
  }

speak("Interface ready","Google US English");

function startTheater(){

  //$("#main").fadeIn(1000);
  $("#chat").removeClass("enabled");

  console.log("startTheater");
  /* Create a Tree.js script with planes rotating in space with the same image */

  let imgSrc='cercle.jpg';//'cringe.jpg';

  // Create a scene
  let scene = new THREE.Scene();


  // Create a camera
  let camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

  // Create a renderer
  let renderer = new THREE.WebGLRenderer({ antialias: true , alpha: true });
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize(window.innerWidth, window.innerHeight);
  $("#three")[0].appendChild(renderer.domElement);


  // Set up the objects
  let planeGeometry = new THREE.PlaneGeometry(1,1);
  //let planeMaterial = new THREE.MeshBasicMaterial({map:texture} );
  let basicmaterial= new THREE.MeshBasicMaterial( { color: 0x00ff00 } );

  camera.position.z = 5;

  // Create a plane geometry
  let geometry = new THREE.PlaneGeometry(10, 10);

  // Create a material
  let material = new THREE.MeshBasicMaterial();

  // Create a plane
  let plane = new THREE.Mesh(geometry, material);

  // Load an image
  let loader = new THREE.TextureLoader();
  loader.load(imgSrc, (texture) => {
      loader.needsUpdate = true;
      // Set texture to material
      material.map = texture;

      let scaler=1.2;
      // Update plane
      let aspectRatio = texture.image.width / texture.image.height;
      plane.scale.x = aspectRatio*scaler;
      plane.scale.y = 1*scaler;
      console.log("loaded");
      // Add plane to the scene
      scene.add(plane);
  });



  // Rotate the planes, render loop
  function animate() {
    requestAnimationFrame( animate );
    plane.rotation.z += 0.001;
    //plane2.rotation.z -= 0.01;
    //plane3.rotation.z += 0.01;
    //mesh.rotation.x += 0.005;
    renderer.render(scene, camera);
    //requestAnimationFrame(animate);
  }
  setTimeout(function(){
    console.log("three fadein");
    $("#three").fadeIn(1000);
  }, 1000);

  console.log("animate");
  animate();

}

///CHAT functions

eel.expose(startchat);
function startchat(){
  endProjection();
  $("#conversation .text").text("");
  $("#main").show();
  $("#chat").addClass("enabled");
  $("#prompt").removeClass("disabled");
 
}

eel.expose(endchat);
function endchat(){
  $("#prompt").addClass("disabled");
  setTimeout(function(){ $("#chat").removeClass("enabled"); }, 5000);
}
 



$("#prompt").on("keydown", function (event) {
  if (event.key === "Enter") {
    const text = $(this).val();
    if (text) {
      //window.chathistory.push({"role":"user","content":text});
      //eel.sendprompt(window.chathistory,window.chatsystem,window.chatengine);
      eel.sendprompt(text);
      
      $("#conversation .text").text("")
      $(this).val("");
    }
  }
});