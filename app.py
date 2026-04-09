from flask import Flask, render_template, redirect, url_for, request
import json

app = Flask(__name__) #initialising app

@app.route('/')
def dashboard():
    with open('data.json', 'r') as file:
        data = json.load(file)

    return render_template('dashboard.html', data=data)


@app.route('/add')
def add_data():

    return render_template('add.html')



if __name__ == "__main__":
    app.run(debug=True)