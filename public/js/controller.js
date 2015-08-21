/**
 * android
 * Description: Checks if device is an android
 */
var android = !(/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream);

/**
 * addEventListener contextmenu
 * Description: Removes context menus on long touch hold
 */
window.addEventListener('contextmenu', function(e) {
  e.preventDefault();
  return false;
});

/**
 * controller
 * Description: Creates a new controller instance and connects it up to the
 * communication lines
 */
var controller = new Controller();
controller.connect();
controller.startCommunication();

/**
 * posX, posY
 * Description: The global variables we need access to in order to change the
 * velocity of our character.
 */

/**
 * setInterval updateVelocity
 * Inputs: posX, posY
 * Description: Every 20 milliseconds, it will call updateVelocity in
 * communication/client.js.
 */
setInterval(function(){
  controller.updateAngle(yAngle);
}, 10);

////////////////////////////////////
// Accelerometer logic... 
////////////////////////////////////
var yAngle = 0;
  
if (window.DeviceMotionEvent != undefined) {
  window.ondevicemotion = function(e) {
    yAngle = e.accelerationIncludingGravity.y * 10;
  }
}
 

/**
 * control decelerate button
 * Description: When the decelerate button is touched, it will invoke
 * deceleration on the ship. When the decelerate button touch event has ended,
 * it will cause deceleration on the ship to stop. Velocity at this point in
 * time should remain at a constant (i.e. whatever the velocity was at the point
 * of button release).
 */
$('.control__decelerate--button')
.on('touchstart', function() {
  vibrate(50);
  console.log('decelerate start');
  this.classList.add('is-pressed');
  controller.decelerateStart();
})
.on('touchend', function() {
  console.log('decelerate end');
  this.classList.remove('is-pressed');
  controller.decelerateEnd();
});

/**
 * control accelerate button
 * Description: When the accelerate button is touched, it will invoke
 * acceleration on the ship. When the accelerate button touch event has ended,
 * it will cause acceleration on the ship to stop. Velocity at this point in
 * time should remain at a constant (i.e. whatever the velocity was at the point
 * of button release).
 */
$('.control__accelerate--button')
.on('touchstart', function() {
  vibrate(50);
  console.log('accelerate start');
  this.classList.add('is-pressed');
  controller.accelerateStart();
})
.on('touchend', function() {
  console.log('accelerate end');
  this.classList.remove('is-pressed');
  controller.accelerateEnd();
});

var vibrate = function(ms) {
  if (android) {
    navigator.vibrate(ms);
  }
}