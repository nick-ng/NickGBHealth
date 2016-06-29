var funcs = {};

funcs.randomString = function randomString(strLength, charSet) {
  var result = [];
  strLength = strLength || 5;
  charSet = charSet || 'abcdefghijklmnopqrstuvwxyz';
  while (result.length < strLength) {
    result.push(charSet.charAt(Math.floor(Math.random() * charSet.length)));
  }
  return result.join( '' );
}

funcs.generateNewKey = function generateNewKey(keyLength, keyList) {
  var maxAttempts = Math.pow(26, keyLength);
  while (maxAttempts--) {
    var newKey = funcs.randomString(keyLength).toLowerCase();
    if (keyList.indexOf(newKey) == -1) {
      return newKey;
    }
  }
  return false;
}

module.exports = funcs;
console.log( 'Loaded funcs' );
