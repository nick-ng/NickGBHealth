// Common variables
var socket = io();
var common = {};
common.cookieExpiry = 999; // 999 days

// Common functions
common.removeWhiteSpace = function removeWhiteSpace(someString) {
  // Replace multiple spaces with one, REMOVE leading and trailing spaces.
  return someString.replace( /[\s\n\r]+/g, ' ' ).replace( /^\s|\s$/g, '' );
  // This matches leading and trailing spaces of any number /^\s+|\s+$/g
};

common.findInArray = function findInArray(array, searchValue, searchKey, returnKey) {
  var returnObj = array.find(function(item) {
    return item[searchKey] == searchValue;
  });
  if (returnKey != undefined) {
    return returnObj[returnKey];
  } else {
    return returnObj;
  };
}

common.sumArray = function sumArray(someArray, useFloat) {
  // Sums all values in an array which may be strings. If a value cannot be parsed, it's skipped
  useFloat = useFloat || false;
  if (someArray && (someArray.length > 0)) {
    return someArray.reduce(function(prev, curr) {
      if (useFloat) {
        curr = parseFloat(curr);
      } else {
        curr = parseInt(curr);
      };
      if (isNaN(curr)) {
        curr = 0;
      };
      return prev + curr;
    });
  } else {
    return 0;
  };
};

// Adapted from http://stackoverflow.com/a/32501584
common.setSelectOnClick = function setSelectOnClick(selectorList) {
  for (var i = 0; i < selectorList.length; i++) {
    $(selectorList[i]).blur(function() {
      if ($(this).attr("data-selected-all")) {
        $(this).removeAttr("data-selected-all");
      }
    });
    $(selectorList[i]).click(function() {
      if (!$(this).attr("data-selected-all")) {
        try {
          $(this).selectionStart = 0;
          $(this).selectionEnd = $(this).value.length + 1;
          //add atribute allowing normal selecting post focus
          $(this).attr("data-selected-all", true);
        } catch (err) {
          $(this).select();
          //add atribute allowing normal selecting post focus
          $(this).attr("data-selected-all", true);
        }
      }
    });
  }
};
