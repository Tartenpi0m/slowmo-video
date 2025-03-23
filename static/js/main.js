var canvas
var ctx
var img
var frame_counter // html element
const base_url = "http://127.0.0.1:5000"

var width
var height
var max_frame
var frame_n = 0
var rotation = 0
var request_locked = false



async function load_frame(n) {

    response = await this.fetch(base_url + "/getFrame?n=" + n)
    // if (!response.ok) {
    //     console.error("Image not returned by the server")
    // }
    blob = await response.blob()
    // console.log("Frame " + n + " loaded")

    img.src = URL.createObjectURL(blob);
    
    img.onload = function() {
        ctx.drawImage(img, 0, 0);
        frame_counter.innerHTML = n
    }

}

function synchronizeCursor(n, canvas, progress_bar_cursor) {

    let progress_percent = n / max_frame
    let cursor_pos = progress_percent * canvas.width
    progress_bar_cursor.style.left = parseInt(cursor_pos) + 'px';
    
}


function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}

async function moveCursor(mouseEvent) {

    // move Cursor
    let pos = getMousePos(canvas, mouseEvent).x;
    progress_bar_cursor.style.left = pos + 'px';

    // Synchronize frame
    if(!request_locked) {
        request_locked = true
        let n = parseInt((pos / canvas.width) * max_frame)
        await load_frame(n)
        frame_n = n
        request_locked = false
    }
};











window.addEventListener('DOMContentLoaded', async function() {
    

    canvas = this.document.getElementById('main_canvas')
    ctx = canvas.getContext('2d')
    frame_counter = this.document.getElementById('frame_counter')

    let progress_bar_cursor = this.document.getElementById('progress_bar_cursor')
    let progress_bar = document.getElementById('progress_bar')


    
    /* Initialize video */    // filename = "video.mp4"

    response = await fetch(base_url + "/loadVideo")//?filename=" + filename)
    if (response.ok) {
        let data = await response.json()
        width = data['width']; height = data['height']; max_frame = data['max_frame']
        console.log(width, height, max_frame)

        canvas.height = height
        canvas.width = width
    } else {
        console.error("Video not loaded")
    }

    // Load first frame
    img = new Image();
    load_frame(frame_n)//, img, ctx, base_url)
    synchronizeCursor(frame_n, canvas, progress_bar_cursor);





    /* Progress bar */

    let bar = [progress_bar, progress_bar_cursor]
    bar.forEach((element) => {element.addEventListener('mousedown', (mouseEvent) => {

        moveCursor(mouseEvent)

        document.addEventListener('mousemove', moveCursor);

        document.addEventListener('mouseup', () => {
            document.removeEventListener('mousemove', moveCursor);
        }, { once: true });
    })})










    /* Mouse cursor position indicator */
    let coord_element = this.document.getElementById("mouse_position")

    canvas.addEventListener('mousemove', function(mouseEvent) {
        var mousePos = getMousePos(canvas, mouseEvent);
        coord_element.innerHTML = '(' + parseInt(mousePos.y) + ',' + parseInt(mousePos.x) + ')'
        // console.log('Mouse position: ' + mousePos.x + ',' + mousePos.y);
    }, false);





    /* Keyboard event*/

    let frame_added = 0
    let load_frame_bool = false
    this.document.onkeydown = async function(event) {

        load_frame_bool = false
        frame_added = 0

        if (!request_locked) {
            request_locked = true
            if (event.key === "ArrowRight") {
                frame_added = 1
                load_frame_bool = true

            } else if (event.key ==="ArrowLeft") {
                frame_added = -1
                load_frame_bool = true
            }

            if (event.shiftKey) {
                frame_added *= 10
            }

            if (frame_n + frame_added > max_frame || frame_n + frame_added < 0) {
                frame_added = 0
                load_frame_bool = false
            }

            if (event.key === "r") {
                rotation += 1
                if (rotation == 4) {rotation = 0;}
                await fetch(base_url + '/getFrame', {
                    method: "POST", 
                    headers: {"Content-Type": "application/json"}, 
                    body: JSON.stringify({"rotation": rotation})
                })
                let width = canvas.width
                canvas.width = canvas.height
                canvas.height = width
                load_frame_bool = true
            }

            
            if (load_frame_bool) {
                frame_n += frame_added
                await load_frame(frame_n);
                synchronizeCursor(frame_n, canvas, progress_bar_cursor);
            }




            request_locked = false
        }
    }





})