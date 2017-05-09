from flask import Flask
from flask import render_template

app = Flask(__name__)

@app.route('/')
def hello():
    title='FACT Real Time Analysis'
    return render_template('index.html', title=title)
