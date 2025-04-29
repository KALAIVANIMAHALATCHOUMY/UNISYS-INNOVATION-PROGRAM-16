from flask import Flask, jsonify
from flask_cors import CORS
from flask import request
import sys
from agents import mainLogicStartsHere
import os
sys.path.insert(0, '..')

app = Flask("__name__")
UPLOAD_FOLDER = './myFiles/'
CORS(app, resources={r"*": {"origins": "http://localhost:3000"}})
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# @app.route('/conversation',methods=['POST'])
# def invokeModel():
#     userQry = request.data.decode('utf-8')
#     print(userQry)
#     res = mainLogicStartsHere(userQry)
#     print("res", res['response'])
#     return jsonify(res['response'])
@app.route('/conversation',methods=['POST'])
def invokeModel():
    userQry = request.data.decode('utf-8')
    print(userQry)
    res = mainLogicStartsHere(userQry)
    print("res", res['response'])
    return jsonify(res)

@app.route("/uploadFiles", methods=['POST'])
def uploadFiles():
    print(request.files)
    print(request.method)
    files = request.files

    if not files:
        return jsonify({'error': 'No files received'})

    uploaded_files = []
    print(files.items())
    for key, file in files.items():
        print("Key", key, "file", file)
        if file.filename == '':
            return jsonify({'error': f'No selected file for key: {key}'})

        if(os.path.exists("./myFiles")):
            filename = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
            print(filename)
            file.save(filename)
            uploaded_files.append({'key': key, 'filename': filename})
            print(uploaded_files)
        else:
            print("File Already Exist")
            return jsonify("file already exist")

    return jsonify({'message': 'Files uploaded successfully', 'files': uploaded_files})


if __name__ == "__main__":
    app.run(debug=True)















# python -m venv uip
# uip\Scripts\Activate

# flask --app main --debug run

# pip install Flask
# pip install Flask-Cors
# pip freeze > requirements.txt
# To install use this
# pip freeze > requirements.py