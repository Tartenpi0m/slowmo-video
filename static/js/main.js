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



async function load_frame(n) {

    response = await this.fetch(base_url + "/getFrame?n=" + n)
    // if (!response.ok) {
    //     console.error("Image not returned by the server")
    // }
    blob = await response.blob()
    console.log("Frame " + n + " loaded")

    img.src = URL.createObjectURL(blob);
    
    img.onload = function() {
        ctx.drawImage(img, 0, 0);
        frame_counter.innerHTML = n
    }

}


function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}

window.addEventListener('DOMContentLoaded', async function() {
    
    

    canvas = this.document.getElementById('main_canvas')
    ctx = canvas.getContext('2d')
    frame_counter = this.document.getElementById('frame_counter')

    
    // INIT VIDEO
    // filename = "video.mp4"
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


    //LOAD FIRST FRAME
    img = new Image();
    load_frame(frame_n)//, img, ctx, base_url)




    let coord_element = this.document.getElementById("mouse_position")
    canvas.addEventListener('mousemove', function(evt) {
        var mousePos = getMousePos(canvas, evt);
        coord_element.innerHTML = '(' + parseInt(mousePos.y) + ',' + parseInt(mousePos.x) + ')'
        // console.log('Mouse position: ' + mousePos.x + ',' + mousePos.y);
    }, false);


    // KEY EVENT
    let request_locked = false
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
                await load_frame(frame_n)
            }




            request_locked = false
        }
    }





})