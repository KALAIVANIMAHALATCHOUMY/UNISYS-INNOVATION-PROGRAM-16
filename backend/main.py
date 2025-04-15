from flask import Flask, jsonify
from flask_cors import CORS
from flask import request
import sys
sys.path.insert(0, '..')

app = Flask("__name__")
CORS(app, resources={r"*": {"origins": "http://localhost:3000"}})
# CORS(app)

@app.route('/conversation',methods=['POST'])
def invokeModel():
    userQry = request.data.decode('utf-8')
    print(userQry)
    return jsonify("hi this is gpt resonse")



if __name__ == "__main__":
    app.run(debug=True)



# python -m venv uip
# uip\Scripts\Activate

# flask --app starter --debug run

# pip install Flask
# pip install Flask-Cors
# pip freeze > requirements.txt
# To install use this
# pip freeze > requirements.py