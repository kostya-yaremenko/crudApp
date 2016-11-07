/**
 * Created by kostya on 27.10.2016.
 */
var frame = null;
ind = 0;
function parse(str){
    for (var i=0; i<str.length; ++i){
        if (str[i] == "_") {
            return i;
        }
    }
    return null;
}


function clickOnUnit(e){
    var obj = document.getElementById("frame");
    obj.style.visibility='visible';
    var image =  document.getElementById("canvas");
    image.src = e.currentTarget.src;
    var str = e.currentTarget.id;
    var i = parse(str);
    var str_ind = str.slice(i+1);
    console.log("index: " + parse(e.currentTarget.id));
    console.log("str: " + str_ind);
    ind = parseInt(str_ind, 10);
    console.log(ind);

}

function clickOnClose(e){
    var obj = document.getElementById("frame");
    if (obj.style.visibility == 'visible'){
        obj.style.visibility = 'hidden';
    }
    // obj.src = null;
}
function clickOnNextImg(e){
    var obj = document.getElementById("canvas");
    if ( document.getElementById('unit_'+(ind+1))) {
        ind = ind + 1;
        console.log('r: unit_' + ind);
        obj.src = document.getElementById('unit_' + ind).src;
    }
}

function clickOnPrevImg(e){
    var obj = document.getElementById("canvas");
    if ( document.getElementById('unit_'+(ind-1))) {
        ind = ind - 1;
        console.log('r: unit_' + ind);
        obj.src = document.getElementById('unit_' + ind).src;
    }
}

for (var i = 1; i <= 2; i++) {
    document.getElementById("unit_" + i).onclick = function(event){clickOnUnit(event);}
}
document.getElementById('cross').onclick = function(event){clickOnClose(event)};
document.getElementById('bt_2').onclick = function(event){clickOnNextImg(event)};
document.getElementById('bt_1').onclick = function(event){clickOnPrevImg(event)};