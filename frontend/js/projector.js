function typeWriter() {
    if (window.i < window.txt.length) {
        document.getElementById("text").innerHTML += window.txt.charAt(window.i);
        window.i++;
        setTimeout(typeWriter, window.speed);
    }
    }


eel.expose(showtext);
function showtext(data){
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
      var multipartText = [];

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

          multipartText.push(part);
          //console.log(part.length + " - " + part);

        }

        //Add the remaining text
        if (tmptxt.length > 0) {
          multipartText.push(tmptxt);
        }

      } else {

        //Small text
        multipartText.push(text);
      }


      //Play multipart text
      for (var i = 0; i < multipartText.length; i++) {

        //Use SpeechSynthesis
        //console.log(multipartText[i]);

        //Create msg object
        var msg = new SpeechSynthesisUtterance();
        //msg.voice = profile.systemvoice;
        //msg.voiceURI = profile.systemvoice.voiceURI;
        msg.volume = 1; // 0 to 1
        msg.rate = 1; // 0.1 to 10
        // msg.rate = usersetting || 1; // 0.1 to 10
        msg.pitch = 1; //0 to 2*/
        msg.text = multipartText[i];
        msg.speak = multipartText;
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
          //highlight(e.currentTarget.text);
          //$('#showtxt').text(curenttxt);
          //console.log(e);
        };
        //console.log(msg);
        speechSynthesis.speak(msg);

      }
    /*
    // Create a new instance of SpeechSynthesisUtterance.
    //var msg = new SpeechSynthesisUtterance();
    console.log(text);
    // Set the text.
    //  msg.text = text;
    
      var utterance = new SpeechSynthesisUtterance(text);
    // Set the attributes.
     // msg.volume = parseFloat(volumeInput.value);
    //  msg.rate = parseFloat(rateInput.value);
    //  msg.pitch = parseFloat(pitchInput.value);
    
    // If a voice has been selected, find the voice and set the
    // utterance instance's voice attribute.
    // console.log(voicename);
    //msg.voice = speechSynthesis.getVoices().filter(function(voice) { return voice.name == voicename; })[0];
    var voiceArr = speechSynthesis.getVoices();
    utterance.voice = voiceArr[parseInt(voiceindex)];
    // Queue this utterance.
     // window.speechSynthesis.speak(msg);
     speechUtteranceChunker(utterance, {
        chunkLength: 120
    }, function () {
        //some code to execute when done
        console.log('done');
    });
    */
  }

speak("Projector started","Microsoft George - English (United Kingdom)");

function startTheater(){
/* Create a Tree.js script with planes rotating in space with the same image */

let imgSrc='cercle.jpg';//'cringe.jpg';

// Create a scene
let scene = new THREE.Scene();
/*
// create an AudioListener and add it to the camera
const listener = new THREE.AudioListener();
camera.add( listener );

// create a global audio source
const sound = new THREE.Audio( listener );

// load a sound and set it as the Audio object's buffer
const audioLoader = new THREE.AudioLoader();
audioLoader.load( audiofile, function( buffer ) {
	sound.setBuffer( buffer );
	sound.setLoop( true );
	sound.setVolume( 0.5 );
	sound.play();
});*/

// Create a camera
let camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

// Create a renderer
let renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


// Set up the objects
let planeGeometry = new THREE.PlaneGeometry(1,1);
//let planeMaterial = new THREE.MeshBasicMaterial({map:texture} );
let basicmaterial= new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
/*
let plane1 = new THREE.Mesh(planeGeometry, planeMaterial);
let plane2 = new THREE.Mesh(planeGeometry, planeMaterial);
let plane3 = new THREE.Mesh(planeGeometry, planeMaterial);
*/

// Position the planes
//plane1.position.set(2.5, 0, 0);
//plane2.position.set(-2.5, 0, 0);
//plane3.position.set(0, 0, 2.5);

// Add the planes to the scene
//scene.add(plane1);
//scene.add(plane2);
//scene.add(plane3);
//scene.add(mesh);


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

    // Update plane
    let aspectRatio = texture.image.width / texture.image.height;
    plane.scale.x = aspectRatio*2;
    plane.scale.y = 1*2;
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

animate();
}


