# Alexandria Stevenson — Portfolio

## Structure
```
index.html              one-page site
assets/css/style.css     design system + layout
assets/js/main.js        loads /data/*.json and renders every section
data/                   used to make editing/adding roles/projects simpler
  projects.json          add a new project card by adding an entry here
  experience.json
  education.json
  interests.json          the "beyond my screen" deck
  skills.json
assets/img/               put real images here 
```

## Running locally
```
cd site
python3 -m http.server 8000
```
Then visit `http://localhost:8000`.
