let cnt = 0;
let x, y, offsetx, offsety;
let canvas = document.getElementById("dest_copy");
let editable = true;
let tableItems = document.getElementById("tableItems");
let time = 0;
let ctx = canvas.getContext("2d");
let scale = 50;
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
// var canvas = document.getElementById("canvas");
var graphs = [];
var graphAttr = [
    { x: 20, y: 120, w: 100, h: 60, bgColor: "rgba(111, 84, 153 , 0.8)", canvasObj: canvas },
    { x: 70, y: 60, w: 50, h: 50, bgColor: "rgba(0, 33, 66 , 0.8)", canvasObj: canvas, shape: "circle" },
    { x: 20, y: 130, w: 70, h: 70, bgColor: "rgba(228, 134, 50 , 0.8)", canvasObj: canvas, shape: "triangle" }
];
var tempGraphArr = [];
// for (var i = 0; i < graphAttr.length; i++) {
//     var graph = new dragGraph(graphAttr[i].x, graphAttr[i].y, graphAttr[i].w, graphAttr[i].h,
//         graphAttr[i].bgColor, graphAttr[i].canvasObj, graphAttr[i].shape);
//     graphs.push(graph);
// }
dragGraph = function (id, x, y, w, h, fillStyle, canvas, graphShape) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.fillStyle = fillStyle || "rgba(26, 188, 156 , 0.5)";
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.canvasPos = canvas.getBoundingClientRect();
    this.graphShape = graphShape;
}

dragGraph.prototype = {
    paint: function () {
        // console.log(this.fillStyle);
        this.context.beginPath();
        this.context.fillStyle = this.fillStyle;
        this.shapeDraw();
        this.context.fill();
        this.context.closePath();
    },
    isMouseInGraph: function (mouse) {
        this.context.beginPath();
        this.shapeDraw();
        return this.context.isPointInPath(mouse.x, mouse.y);
    },
    shapeDraw: function () {
        if (this.graphShape == "circle") {
            this.context.arc(this.x, this.y, 50 * 50 / scale, 0, Math.PI * 2);
            // this.context.arc(70, 60, 50, 0, Math.PI * 2);
        }
        else if (this.graphShape == "triangle") {
            this.context.moveTo(this.x, this.y - 40 * 50 / scale);
            this.context.lineTo(this.x + 50 * 50 / scale, this.y + 40 * 50 / scale);
            this.context.lineTo(this.x - 50 * 50 / scale, this.y + 40 * 50 / scale);
        }
        else {
            // console.log("ahdfuihdjo");
            // console.log(this.x, this.y, this.w, this.h);
            this.context.rect(this.x-this.w/2, this.y-this.h/2, this.w, this.h);
        }
    },
    erase: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
canvas.addEventListener("mousedown", function (e) {
    var mouse = {
        x: e.clientX - canvas.getBoundingClientRect().left,
        y: e.clientY - canvas.getBoundingClientRect().top
    };
    // "shape" here represents the object of dragGraph
    graphs.forEach(function (shape) {
        var offset = {
            x: mouse.x - shape.x,
            y: mouse.y - shape.y
        };
        if (shape.isMouseInGraph(mouse)) {
            let id = shape.id;
            console.log("in the rect");
            tempGraphArr.push(shape);
            canvas.addEventListener("mousemove", function (e) {
                mouse = {
                    x: e.clientX - canvas.getBoundingClientRect().left,
                    y: e.clientY - canvas.getBoundingClientRect().top
                };

                if (shape === tempGraphArr[0]) {
                    shape.x = mouse.x - offset.x;
                    shape.y = mouse.y - offset.y;

                    shape.erase();
                    // shape.paint();
                    graphs.forEach(function(graph){
                        graph.paint();
                    })
                    plan.items.get(id).pos_x = (mouse.x - offset.x) * scale / 50;
                    plan.items.get(id).pos_y = (mouse.y - offset.y) * scale / 50;
                    // drawGraph();
                    // plan.draw();
                }
            }, false);
            canvas.addEventListener("mouseup", function () {
                tempGraphArr = [];
            }, false);
        }
    });
    e.preventDefault();
}, false);
class Item{
    // item_id is the auto-generated id for each item as soon as it's constructed
    item_id;
    // count_id;
    name;
    fillStyle;
    start_time; 
    end_time;
    owner;
    setup_time;
    breakdown_time;
    // type should be consistent with the id of the items in the repository shown in HTML
    type;
    pos_x;
    pos_y;
    rotate;
    width;
    length;
    constructor(){

    }
    //calculateExpression(value.start_time, value.item_id)
    draw(){
        if(this.start_time > time || this.end_time < time){
            // console.log("returned");
            return;
        }
        // console.log("thishishihsihs");
        let graph = new dragGraph(this.item_id, this.pos_x * 50 / scale, this.pos_y * 50 / scale, this.width * 50 / scale, this.height * 50 / scale, this.fillStyle, canvas, this.type);
        graphs.push(graph);
        graph.paint();
    }
}
class Plan{
    items;
    constructor(){
        // I use hashmap to store all the items to make sure the storage used is low and deleting and searching fast.
        // However, I still need to perform the sorting algorithm, I would prefer to generate a new array and then sort it by the required attribute
        // the time complexity is O(n + nlogn) = O(nlogn)
        this.items = new Map();
    }
    addItem(item){
        let id = item.item_id;
        if(this.items.has(id)){
            // it's wrong, as the id is self-incremented, we shouldn't have
        }else{
            this.items.set(id, item);
        }
    }
    deleteItem(id){
        if(this.items.has(id)){
            this.items.delete(id);
        }else{
            // no such item
        }
    }
    draw(){
        graphs = [];
        // console.log("plan drawing");
        // console.log(this.items.size);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // while(canvas.hasChildNodes()){
        //     canvas.removeChild(canvas.firstChild);
        // }
        this.items.forEach(drawItems);
    }
    generateTable(){
        $("#tableItemsBody").remove();
        $("#tableItems").append("<tbody id='tableItemsBody'></tbody>");
        console.log("this is what i want ", plan.items);
        this.items.forEach(generateTableItems);
    }
}
let plan = new Plan();
// hashmap iteration function
function drawItems(value, key, map){
    // console.log(value);
    value.draw();
}
function calculateExpression(expression, id){
  var numberRe = /^\d+$/i;
  var startTimeRe = /^ts\d+\+\d+$/i;
  var endTimeRe = /^te\d+\+\d+$/i;
  if(numberRe.test(expression)){
    return expression;
  }
  else if (startTimeRe.test(expression)) {
    var matchedData = expression.match(/\d+/g);
    var parentId = matchedData[0];
    var offset = matchedData[1];
    // For start time, partentID can be equal to childID. Examle: TE11 = TS11 + 5.
    // Self addition is not allowed. Example: TS11 = TS11 + 1.
    if(parentId <= id && plan.items.get(parseInt(parentId)) && plan.items.get(parseInt(parentId)).start_time != expression){
      var parentValue = calculateExpression(plan.items.get(parseInt(parentId)).start_time, parentId);
      if(numberRe.test(parentValue)){
        return parseInt(parentValue) + parseInt(offset);
      }
    }
  }
  else if (endTimeRe.test(expression)) {
    var matchedData = expression.match(/\d+/g);
    var parentId = matchedData[0];
    var offset = matchedData[1];
    if(parentId < id && plan.items.get(parseInt(parentId))){
      var parentValue = calculateExpression(plan.items.get(parseInt(parentId)).end_time, parentId);
      if(numberRe.test(parentValue)){
        return parseInt(parentValue) + parseInt(offset);
      }
    }
  }
  return 'Invalid!'
}
function generateTableItems(value, key, map){
    let tr = `<tr>
    <td class="data">${value.item_id}</td>
    <td class="data" onclick="clickToEditData(event, ${value.item_id}, 'name')">${value.name}</td>
    <td class="data" onclick="clickToEditData(event, ${value.item_id}, 'start_time')">${calculateExpression(value.start_time, value.item_id)}</td>
    <td class="data" onclick="clickToEditData(event, ${value.item_id}, 'end_time')">${calculateExpression(value.end_time, value.item_id)}</td>
    <td class="data" onclick="clickToEditData(event, ${value.item_id}, 'owner')">${value.owner}</td>
    </tr>`;
    $("#tableItemsBody").append(tr);
}
function clickToEditData(e, item_id, attr){
    // console.log("uuuuu", e.currentTarget.getAttribute("class"));
    let current_item = plan.items.get(parseInt(item_id));
    let table = document.getElementById("table");
    ox = table.getBoundingClientRect().left;
    oy = table.getBoundingClientRect().top;
    x = e.currentTarget.getBoundingClientRect().left;
    y = e.currentTarget.getBoundingClientRect().top;
    console.log(item_id, x, y, ox, oy, e.currentTarget);
    // let newDiv = document.createElement("div");
    // newDiv.id = "editData";
    // newDiv.style.cssText = `position: absolute; left: ${x}px; top: ${y}px;`;
    if(document.getElementById("editData")){
        document.getElementById("editData").remove();
    }
    console.log("1234567", table.scrollLeft);
    $("#table").append(`<div id="editData" style="position: absolute; left: ${x - ox + 3 + table.scrollLeft}px; top: ${y - oy + 3 + table.scrollTop}px">
    <input style="width:60px; height: 30px;" id="blankInput" type="text" onchange="changeData(event, ${item_id}, '${attr}');" value="${e.currentTarget.innerText}">
    </div>`);
    document.getElementById("blankInput").select();
    // let blank = `<input type="text" onchange="">`;
    // $("#editData").append(blank);

}
function changeData(e, id, attr){
    // console.log((e.value);
    let item = plan.items.get(id);

    if(attr == 'name'){
        item.name = e.currentTarget.value;
    }
    if(attr == 'start_time'){
        item.start_time = e.currentTarget.value;
    }
    if(attr == 'end_time'){
        item.end_time = e.currentTarget.value;
    }
    if(attr == 'owner'){
        item.owner = e.currentTarget.value;
    }
    plan.generateTable();
    document.getElementById("editData").remove();
}
// button action
function clickToEdit(e){
    //
    editable = true;
    // console.log(editable);
    return;
}
function clickToSave(e){
    // location.reload(false);
    editable = false;
    // communicate with the server
    return;
}
// click to submit
function clickToSubmit(){
    // hide the editing table
    document.getElementById("editing_page").style.visibility = "hidden";
    // update the parameters
    // get the current id
    let curID = document.getElementById("cur_id").value;
    let curName = document.getElementById("cur_name").value;
    let curStart = document.getElementById("cur_start_time").value;
    let curEnd = document.getElementById("cur_end_time").value;
    let curOwner = document.getElementById("cur_owner").value;
    // get the item from plan
    let curItem = plan.items.get(parseInt(curID));
    // update the current item
    console.log(plan.items);
    console.log(curID, typeof(parseInt(curID)));
    curItem.name = curName;
    curItem.start_time = parseInt(curStart);
    curItem.end_time = parseInt(curEnd);
    curItem.owner = curOwner;

    plan.generateTable();
    plan.draw();

    document.getElementById("editing_page").style.visibility = "hidden";
    document.getElementById("cur_id").value = -1;
}
function selectTheTime(){
    // console.log("test clicking the timebar");
    time = document.getElementById("timebar").value;
    // console.log("current time is ", time);
    plan.draw();
}
function selectTheScale(){
    scale = document.getElementById("scale").value;
    canvas.width = canvasWidth * 50 / scale;
    canvas.height = canvasHeight * 50 / scale;
    plan.draw();
}
function showTime(){
    let time = document.getElementById("timebar").value;
    document.getElementById("showTimebar").innerText = `timebar:    ${time}`;
}
function dragstart_handler(ev) {
    if(editable == false){
        return;
    }
    let dragdiv = ev.currentTarget;
    let id = dragdiv.id;
    offsetx = ev.clientX - dragdiv.getBoundingClientRect().left;
    offsety = ev.clientY - dragdiv.getBoundingClientRect().top;
    if(dragdiv.getAttribute("class") == "items"){
        dragdiv.style.opacity = 0.5;
    }
    // update the dataTransfer
    ev.dataTransfer.setData("text", ev.currentTarget.id);
    ev.dataTransfer.setDragImage(dragdiv, offsetx * 2, offsety * 2);
    // Tell the browser both copy and move are possible
    ev.effectAllowed = "copyMove";

}
function dragover_handler(ev) {
    ev.preventDefault();
    console.log("dragOver");
}

function drop_handler(ev) {
    if(editable == false){
        return;
    }
    x = ev.clientX - canvas.getBoundingClientRect().left;
    y = ev.clientY - canvas.getBoundingClientRect().top;
    console.log(ev.clientX, ev.clientY, canvas.getBoundingClientRect().left, canvas.getBoundingClientRect().top);
    console.log("Drop");
    ev.preventDefault();
    let id = ev.dataTransfer.getData("text");
    let dragDiv = document.getElementById(id);
    if (dragDiv.getAttribute("class") == "sourceItems" && ev.target.id == "dest_copy") {
        // copy an item and show it on the screen
        // "true" in parentheses ensures that the entire div is copied, including deeper elements

        // var nodeCopy = dragDiv.cloneNode(true);
        // nodeCopy.id = cnt;
        // nodeCopy.style.cssText += `position: absolute; left: ${x - offsetx}px; top: ${y - offsety}px;`;
        // nodeCopy.setAttribute("oncontextmenu", "rightClick(event);");
        // nodeCopy.setAttribute("class", "items");
        // nodeCopy.setAttribute("onclick", "leftClick(event);")
        // ev.target.appendChild(nodeCopy);

        
        // create a new item, then insert it into the plan and finally update the table
        let current_item = new Item();
        current_item.item_id = parseInt(cnt);
        current_item.pos_x = x * scale / 50;
        current_item.pos_y = y * scale / 50;
        current_item.type = dragDiv.id;
        current_item.width = 30;
        current_item.height = 40;
        plan.addItem(current_item);
        console.log("asss", plan.items);
        plan.generateTable();
        current_item.draw();
        // editing information
        showEditingPage(current_item);
        
        cnt++;
    }
    // here is a bug, when the target location is outside of the "dest_copy" but still inside
    // the current div (ev.target.id == id), it still works for the drag
    else if (dragDiv.getAttribute("class") == "items" && (ev.currentTarget.id == "dest_copy" || ev.currentTarget.id == id)) {
        dragDiv.style.cssText = "position:absolute; left: 120px; top: 240px;";
        dragDiv.style.cssText += `position: absolute; left: ${x - offsetx}px; top: ${y - offsety}px;`;
        // update the attributes of dragged div
        console.log("w yao d id", typeof(dragDiv.id));
        // console.log(plan.items);
        let cur = plan.items.get(parseInt(dragDiv.id));
        cur.pos_x = x - offsetx;
        cur.pos_y = y - offsety;
    }

}
function dragend_handler(ev) {
    console.log("dragEnd");
    document.getElementById(ev.currentTarget.id).style.opacity = 1;
    // Remove all of the drag data
    ev.dataTransfer.clearData();
}
function showEditingPage(current_item){
    document.getElementById("editing_page").style.visibility = "visible";
    console.log(typeof(current_item));
    document.getElementById("cur_id").value = current_item.item_id;
    document.getElementById("cur_name").value = current_item.name;
    document.getElementById("cur_start_time").value = current_item.start_time;
    document.getElementById("cur_end_time").value = current_item.end_time;
    document.getElementById("cur_owner").value = current_item.owner;

}
function rightClick(e){
    if(editable == false){
        return;
    }
    e.preventDefault();
    closeMenu();
    let menu = createMenu(e);
    canvas.appendChild(menu);
}
// when clicking on any other space except the menu, the menu disappear
document.addEventListener('click', function(e){
    // console.log(e.target.getAttribute("class"));
    closeMenu();
    if(e.target.getAttribute("class") != "data" && document.getElementById("editData")){
        document.getElementById("editData").remove();
    }
})
function leftClick(e){
    console.log("leftClick on the item");
    let cur_id = parseInt(e.currentTarget.id);
    showEditingPage(plan.items.get(cur_id));
}
function leftClickById(id){
    showEditingPage(plan.items.get(parseInt(id)));
}
function closeMenu(){
    // console.log("clickingggggggggggggg");
    let findMenu = document.getElementById("deletionMenu");
    if(findMenu){
        findMenu.remove();
    }
}

function createMenu(e){
    x = e.pageX;
    y = e.pageY;
    let newDiv = document.createElement("ul");
    newDiv.id = "deletionMenu";
    newDiv.setAttribute("class", "context-menu");
    newDiv.style.cssText = `position: absolute; left: ${x}px; top: ${y}px;`;
    let sub1 = createOptionsInMenu(e, "delete");
    let sub2 = createOptionsInMenu(e, "edit");
    newDiv.appendChild(sub1);
    newDiv.appendChild(sub2);
    return newDiv;
}
// str represents the text
function createOptionsInMenu(e, str){
    let opt = document.createElement("li");
    opt.textContent = str;
    let id = e.currentTarget.id;
    opt.setAttribute("onclick", `${str}Item(${id});`);
    return opt;
}
// select deletion
function deleteItem(id){
    console.log("complete deletion");
    document.getElementById(id).remove();
    console.log("yyyy",typeof(id))
    plan.items.delete(id);
    plan.generateTable();
}
function editItem(id){
    showEditingPage(plan.items.get(id));
}

// decode from JSON
function decodeJSON(str){
    // update current cnt, it should be acquired from the JSON code
    cnt = 16;
    let plan = new Plan();
    // decode the JSON

    // mock a plan
    let it1 = new Item();
    it1.name = "weiwei";
    it1.item_id = 0;
    it1.start_time = 0;
    it1.end_time = 10;
    it1.type = "src_copy0";
    it1.pos_x = 80;
    it1.pos_y = 40;
    it1.owner = "chu";
    it1.width = 100;
    it1.height = 60;
    it1.type = "rect";

    let it2 = new Item();
    it2.name = "chuxi";
    it2.item_id = 11;
    it2.start_time = 0;
    it2.end_time = 16;
    it2.type = "src_copy2";
    it2.pos_x = 400;
    it2.pos_y = 300;
    it2.owner = "zhang";
    it2.type = "triangle";
    it2.width = 30;
    it2.height = 40;

    let it3 = new Item();
    it3.name = "zhang";
    it3.item_id = 14;
    it3.start_time = 0;
    it3.end_time = 18;
    it3.type = "src_copy1";
    it3.pos_x = 280;
    it3.pos_y = 120;
    it3.owner = "youli";
    it3.type = "circle";
    it3.height = 15;
    it3.width = 23;

    plan.items.set(0, it1);
    plan.items.set(11, it2);
    plan.items.set(14, it3);
    console.log("decodeJson " + plan.items.size);
    return plan;
}
// get JSON from server
function getJSON(){
    let str = new String();
    // maybe calling the interface from the server
    return str;
}
// when loading, get the JSON data and then draw the plan
// plan is a global variable
window.onload = function(){
    // firstly, try to get data (JSON) from local cache, if cannot find the required data, then get it from the server
    console.log("loading");
    let json = getJSON();
    plan = decodeJSON(json);
    plan.draw();
    plan.generateTable();
}
