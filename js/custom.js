// //this is just a global variable to store stuff
var GLOBAL = {};
var LPtimer;
var ScrollTimerHandle;

$(function() {
  var ua = navigator.appVersion.toLowerCase();
   if (     ua.indexOf("iphone") > -1
        ||  ua.indexOf("ipad") > -1
    ) {
        GLOBAL.ios = true;
      }

   document.addEventListener("deviceready", onDeviceReady, false);

//   //create our own long tap functionality
//     $('.session').on('touchstart' ,function(e){
//         LPtimer = setTimeout(function() {
//           onLongPress(e);
//         }, 600);
//     })
//     $('.session').on('touchend' ,function(e){
//         clearTimeout(LPtimer);
//     })
//     $('.session').on('touchmove' ,function(e){
//         clearTimeout(LPtimer);
//     })

});

function onDeviceReady() {
  //setup iOS status bar for Phonegap Build
  //cordova does this via config.xml
  StatusBar.overlaysWebView(false);
  StatusBar.backgroundColorByHexString("#434244");

  //listen to the Menu button on Android phones
  document.addEventListener("menubutton", OnMenuButton, false);
}

function OnMenuButton() {
  //trigger the menu open button in Lectora
  button7705onUp();
}

// function onLongPress(e) {
//   //class format is "session d1b1s1" for day1 breakout1 session1
//   var sessionID = $(e.currentTarget).attr('class').split(/\s+/)[0];
//   toggleFavorite(sessionID);
// }

// function toggleFavorite(sessionID) {

//   var favoritesList = Var_favorites.getValue();

//   if (favoritesList.indexOf(sessionID) > -1) {
//     //remove from favorites
//     $('.fav-ribbon.'+sessionID).css('visibility','hidden');
//     favoritesList = favoritesList.replace(sessionID+'|','');
//   } else {
//     //add to favorites
//     $('.fav-ribbon.'+sessionID).css('visibility','visible');
//     favoritesList += sessionID+'|';
//   }

//   Var_favorites.set(favoritesList);
// }

// function displayAllFavorites() {
//   var favoritesList = Var_favorites.getValue();
//   var favoritesArray = favoritesList.split('|');

//   $.each(favoritesArray, function(i, sessionID) {
//       if (sessionID) $('.fav-ribbon.'+sessionID).css('visibility','visible');
//   })
// }

function requestMaps(coordinates) {
  var mapsURL = '';

  if (navigator.userAgent.match(/(iPod|iPhone|iPad)/)) {
      mapsURL = 'http://maps.apple.com/?q='+coordinates;
  } else {
      mapsURL = 'geo:'+coordinates;
  }
  window.open(mapsURL, '_system');
}

function AdjustScreen(mode) {
  if (mode=='init') {
  //create a div that will hold all position-fixed elements and move them there
    $('<div id="topfixed-wrapper">').insertAfter('#pageDIV').css({
      position: 'fixed',
      clip: 'inherit',
      top: '0px',
      left: '0px',
      width: '100%',
      zIndex: '9999'
    });
    $('.topfixed, .menu, .fader').appendTo('#topfixed-wrapper');
    $('.menu, .fader, .button, .keepontransition').css('z-index', '3000');
    $('div#topfixed-wrapper > div[id^="button"]').css('z-index','9999');
  }
  if (mode == 'rotate' && Var_menuState.getValue() == 'on') {
    animateMenu('static');
  }
 //since pageDIV gets scaled, we need to scale the fixed elements, too
 if (!GLOBAL.ios) { //ios scales via viewport, android requires extra scaling of fixed elements
   var element = document.querySelector('#pageDIV');
   var mode = VarCurrentView.getValue();
   var long = Math.max(winW, winH);
   var short = Math.min(winW, winH);

  if (mode.indexOf('Landscape') > -1)  {
      w = long;
   } else {
      w = short;
   }

   var scale = w / element.offsetWidth;
   GLOBAL.scale = scale;

   $('#topfixed-wrapper').css({
    transform: 'scale(' + scale + ')',
    transformOrigin: 'top left',
    '-webkit-transform': 'scale(' + scale + ')',
    '-webkit-transform-origin': 'top left'
  });
 }
   //ios hack
   //if (GLOBAL.ios) document.getElementsByName('viewport')[0].setAttribute('content','')

// we had to create copies of all fixed clickable objects
// because buttons with position:fixed don't work on Android 4.3-

    // var $btn = $('.button.topfixed, div[id^="button"].topfixed');

    // $btn.each( function() {
    //   var buttonDimensionsObj = this.getBoundingClientRect();

    //     var $div = $('<div>', {
    //           'data-id':this.id,
    //           'data-class':this.getAttribute('class'),
    //           'data-type':'pseudobutton',
    //           //'data-original-position': buttonDimensionsObj.top
    //           'data-original-position': parseInt($(this).css('top'))*GLOBAL.scale
    //         });
    //         $div.css({
    //           'position': 'absolute',
    //           'z-index': '9999',
    //           //'border': '1px solid blue',
    //           'height': buttonDimensionsObj.height,
    //           'width': buttonDimensionsObj.width,
    //           'top': buttonDimensionsObj.top,
    //           'left': buttonDimensionsObj.left
    //         }).on('click', function(){
    //           var f = this.getAttribute("data-id")+'onUp';
    //           if (window[f]) window[f].call();
    //         }).appendTo('body');
    // });

    // var func = function() {

    //     //instead of doing something on scroll/
    //     //we wait 100ms to see if scroll stopped
    //     //then we fire the adjustment
    //     clearTimeout(ScrollTimerHandle);
    //     ScrollTimerHandle = setTimeout(function() {
    //       onScrollComplete();
    //     }, 100);
    // };

    // $(window).on('scroll', func);
    // onScrollComplete();
}

// function onScrollComplete() {
//   var offset = $(window).scrollTop();
//   //set transition duration to 0 to effect immediate adjustment
//   $('[data-type="pseudobutton"]').css({
//     transitionDuration: '0ms'
//     //transform: 'translate3d(0,0,0)'
//   });
//   //now adjust each element to account for scroll
//   $('[data-type="pseudobutton"]').each(function(i, el) {
//     var origTop = $(this).attr('data-original-position');
//     var newTop = parseInt(origTop)+parseInt(offset);
//     $(el).css('top',newTop+'px');
//   })
// }

function animateMenu(dir) {
 var mode = VarCurrentView.getValue();
 var w = 0;
 if (mode=='PhoneLandscape') { w = 327 }
 if (mode=='PhonePortrait') { w = 400 }
 if (mode=='TabletLandscape') { w = 259 }
 if (mode=='TabletPortrait') { w = 362 }

 switch(dir) {
    case 'in':
      $('body').on('touchmove.animate',function(e){e.preventDefault();})
      var dur = '600ms';
      $('#text6601').css({
        '-webkit-transform-origin': 'center center',
        transform: 'rotate3d(0,0,1,90deg)',
        transitionDuration: dur,
      });
      $('.menu').css({
        transform: 'translate3d(+'+w+'px,0,0)',
        transitionDuration: dur
      });
      break;
    case 'out':
      $('body').off('touchmove.animate');
      var dur = '400ms';
      $('#text6601').css({
        transform: 'rotate3d(0,0,1,0deg)',
        transitionDuration: dur,
      });
      $('.menu').css({
        transform: 'translate3d(-'+w+'px,0,0)',
        transitionDuration: dur
      });
      break;
    case 'static':
      var dur = '0ms';
      $('.menu').css({
        transform: 'translate3d(+0px,0,0)',
        transitionDuration: dur,
        left: '0px'
      });
      break;
    default:
      //do nothing
  }
}

// function initQRscanner() {
//   cordova.plugins.barcodeScanner.scan(
//       function (result) {
//           SetupBingo(result.text);
//       },
//       function (error) {
//           //fail silently, weep alone
//       }
//    );
// }

// function codeCheckManual() {
//   var inputText = $('.entryfield.code input').val();
//   SetupBingo(inputText);
// }

// function SetupBingo(tryCode) {
//   var bingo = [];
//       bingo.push(['aflyn','villan','uthith','havan','kadar']);
//       bingo.push(['aerruil','nailyn','evae','eilkash','sumilus']);
//       bingo.push(['ridaro','eilim','ssneg','amas','zaas']);
//       bingo.push(['rehar','thersel','maranin','aelas','erual']);
//       bingo.push(['dhonis','rythar','duquis','zyaro','caltha']);

//   if (tryCode) {
//       //try to check the code
//       tryCode = tryCode.toLowerCase();
//       //***
//       if (tryCode == 'easter') {
//           //enter debug mode ;)
//           $('[data-type="pseudobutton"]').css({'border':'1px solid blue'})
//       }
//       //***
//       for (var i=0;i<5;i++) {
//           for (var j=0;j<5;j++) {
//             if ( bingo[i][j] == tryCode ) {
//                 //player found a valid code
//                  $('body').animate({scrollTop:0}, '500');
//                  $('.yellow'+i+j).css('visibility','visible');
//                  $('.yellow'+i+j).fadeIn( 300 ).fadeOut( 300 ).fadeIn( 300 ).fadeOut( 300 ).fadeIn( 300 );
//                  var checkCodes = Var_foundCodes.getValue();
//                  if (checkCodes.indexOf(tryCode) < 0) {
//                     Var_foundCodes.set(Var_foundCodes.getValue()+'|'+tryCode);
//                  }
//                  SetupBingo(); //go for a dry run to update the bingo field and check for winning lines
//           }
//         }
//       }

//   } else {
//       //dry run - just setup the bingo field and check for winners
//       //get discovered codes list from Lectora, put them into array, filter out empty strings
//         var foundCodes = Var_foundCodes.getValue();
//         var foundCodesArray = foundCodes.split('|');
//         var foundCodesArray = foundCodesArray.filter(function(v){return v!==''});

//         //check for codes already found, paint them yellow and remove them from the field
//         for (var i=0;i<5;i++) {
//           for (var j=0;j<5;j++) {
//             if ( $.inArray(bingo[i][j],foundCodesArray) > -1 ) {
//               bingo[i][j] = '';
//               $('.yellow'+i+j).css('visibility','visible');
//             }
//           }
//         }

//         //now look for lines that only contain empty values
//         var winLines = [];
//         //start with rows
//         for (var i=0;i<5;i++) {
//             if (bingo[i].join("") == '') winLines.push('horizontal'+i);
//         }

//         //then with columns
//         for (var i=0;i<5;i++) {
//           var column = '';
//           for (var j=0;j<5;j++) {
//             column += bingo[j][i]; //note how i and j are reversed to iterate by column
//           }
//           if (column == '') winLines.push('vertical'+i);
//         }

//         //finally, check for diagonals
//         var dia0 = '';
//         var dia1 = '';
//         for (var i=0;i<5;i++) {
//             dia0 += bingo[i][i];
//             dia1 += bingo[4-i][i];
//         }
//         if (dia0 == '') winLines.push('diagonal0');
//         if (dia1 == '') winLines.push('diagonal1');

//          $.each(winLines, function(i, line) {
//                 $('.'+line).css('visibility','visible');
//           });
//          if (winLines.length > 0) {
//             og83208.actionHide(); //hide code inputs
//             showSubmitForm();
//          }
//    }
// }

// function showSubmitForm() {
//   og83229.actionShow();

//   // temporary removed the c
//   // if (navigator && navigator.connection && navigator.connection.type == Connection.NONE) {
//   //   og83246.actionShow(); //show offline warning
//   // } else {
//   //   og83229.actionShow(); //show email submit form
//   // }
// }


// ;;;;