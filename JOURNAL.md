## Taks done:
* Created the folder structure
    progress_tracker/
    │
    ├── app.py
    ├── data.json
    │
    ├── templates/
    │   ├── dashboard.html
    │   └── add.html
    │
    ├── static/
    │   ├── style.css
    │   └── script.js
    │
    ├── JOURNAL.md
    └── README.md


* Added some dummy values in the `data.json` file
* Added basic structure of `app.py` file

* Created a conda environment: `progress_tracker_env` with python 3.14 (installed flask too)
* Connected to git repo:
    git init
    git add .
    git commit -m "First commit : message"

    - Then add a new repo to github
    - Copy the url

    git remote add origin <url>
    git push -u origin master 


* And tested if the data from the .json file is loaded correctly using:

    <pre>
        {{ data }}
    </pre>

    <ul>
        {% for test in data %}
        <li>
            {{ test.testName }}: Physics-{{ test.physics }}.... Total-{{ test.total }}
        </li>
        {% endfor %}
    </ul>

-- Now the flow is, `data.json`'s data is taken by the `app.py` file route and then passed to `dashboard.html` as data. It process it and displays


