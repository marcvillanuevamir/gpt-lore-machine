window.last_text_H=0;

function typeWriter() {
  let screenH=$(window).height();
  if (window.i < window.txt.length) {
    document.getElementById("text").innerHTML=$("#text").text();
      document.getElementById("text").innerHTML += '<span class="shine">'+window.txt.charAt(window.i)+'</span>';
      let newtextH=$("#text").height();
      if (newtextH>=screenH){
      //if (newtextH>=screenH || window.txt.charAt(window.i)=="."){
        document.getElementById("text").innerHTML="";
      }
     
      window.i++;
      window.last_text_H=newtextH;
      setTimeout(typeWriter, window.speed);
  }
}

eel.expose(endProjection);
function endProjection(data){
  window.playing=false;
  window.multipartText = [];
  speechSynthesis.cancel();
  let speed=1000;
  $("#three,#main").fadeOut(speed);
  setTimeout(function(){
    document.getElementById("text").innerHTML="";
}, speed+300);
};

window.playing=false;

eel.expose(showtext);
function showtext(data){
    $("#main").show();
    window.playing=true;
    console.log(data);
    startTheater();
    speak(data["en"],data["voice"]);
    window.i = 0;
    window.txt = data["cat"];
    window.speed = 50;
    document.getElementById("text").innerHTML="";
    typeWriter();
}


if ('speechSynthesis' in window) {
    // Speech Synthesis supported 🎉
   }else{
     // Speech Synthesis Not Supported 😣
     alert("Sorry, your browser doesn't support text to speech!");
   }

function speak(text,voicename) {
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
        msg.onend = self.OnFinishedPlaying;
        msg.onerror = function (e) {
          console.log('Error');
          console.log(e);
        };
        /*GC*/
        msg.onstart = function (e) {
          var curenttxt = e.currentTarget.text;
          console.log(curenttxt);
        
        };
        //console.log(msg);
        speechSynthesis.speak(msg);
      
      }
   
  }

speak("Projector started","Microsoft George - English (United Kingdom)");

function startTheater(){
/* Create a Tree.js script with planes rotating in space with the same image */

let imgSrc='cercle.jpg';//'cringe.jpg';

// Create a scene
let scene = new THREE.Scene();


// Create a camera
let camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

// Create a renderer
let renderer = new THREE.WebGLRenderer({ antialias: true });
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
  $("#three").fadeIn(1000);
}, 1000);

animate();

}


