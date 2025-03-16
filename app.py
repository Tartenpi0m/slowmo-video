# Importing flask module in the project is mandatory
# An object of Flask class is our WSGI application.
from flask import Flask, Response, render_template, jsonify, send_file, request 

from video import Video
from io import BytesIO
from PIL import Image
import sys


# Flask constructor takes the name of 
# current module (__name__) as argument.
app = Flask(__name__)

# The route() function of the Flask class is a decorator, 
# which tells the application which URL should call 
# the associated function.


filename = None
if len(sys.argv) > 1:
    filename = sys.argv[1]  # First argument
video = Video(filename)

@app.route('/')
def main_page():
    return render_template("video.html")

@app.route('/loadVideo', methods=['GET'])
def init_video():
    if request.method == 'GET':
        global video        
        width, height, max_frame = video.get_property()
        return jsonify({"width": width, "height": height, "max_frame" : max_frame})
    else:
        return "Not valid request"
    
@app.route('/getFrame', methods=['GET', 'POST'])
def get_frame():
    if request.method == 'GET':
        global video

        n = request.args.get("n")  # frame number
        frame = video.read_frame(int(n))

        image =  Image.fromarray(frame)
        img_io = BytesIO()
        image.save(img_io, 'PNG')  # Save as PNG format
        img_io.seek(0)
        return send_file(img_io, mimetype='image/png' )
        return Response(img_io, mimetype='image/png')
    
    if request.method == 'POST':
        rotation = request.json["rotation"]
        video.rotation = int(rotation)
        print(f"Rotation fixed to {video.rotation*90}°")
        return jsonify({"message": "ok"}), 200

# @app.route('/setParam', methods=['POST'])

# # @app.route('/getFrame')
# # def return 




# main driver function
if __name__ == '__main__':

    # run() method of Flask class runs the application 
    # on the local development server.
    app.run(debug=True)
