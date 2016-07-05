var funcs = {};

funcs.randomString = function randomString(strLength, charSet) {
  var result = [];
  strLength = strLength || 5;
  charSet = charSet || '0123456789';
  while (result.length < strLength) {
    result.push(charSet.charAt(Math.floor(Math.random() * charSet.length)));
  }
  return result.join( '' );
}

funcs.getRandomInt = function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

funcs.generateNewKey = function generateNewKey(keyLength, keyList) {
  while (true) {
    var maxAttempts = Math.pow(10, keyLength);
    while (maxAttempts--) {
      var newKey = funcs.randomString(keyLength).toLowerCase();
      if (keyList.indexOf(newKey) == -1) {
        return newKey;
      }
    }
    keyLength++;
    console.log( 'Increasing keyLength' );
  }
}

module.exports = funcs;
console.log( 'Loaded funcs' );
