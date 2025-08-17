# Enhanced Visualization of Cosine Similarity for Bias Detection Across Multiple ML Models
<!-- 
[[_TOC_]] -->


## Project Goal 
To design a visualization technique that allows for the simultaneous comparison of cosine similarities across multiple ML models, anchor groups, and concepts, improving the current pairwise comparison method.

### Use Case
The findings of this research are expected to be utilized in academic workshops and research demonstrations, providing a visualization technique for simultaneously comparing cosine similarities across multiple machine learning models.

### Datasets
The data is present in a set of .pkl files. Contact us for access to the data.

<!-- ### Tasks
Define all the tasks you want your dashboard solve. -->

- - -
## Folder Structure
Specify here the structure of you code and comment what the most important files contain

``` bash
├── backend-project
│   ├── data:
│   ├── Dockerfile
│   ├── MANIFEST.in
│   ├── pyproject.toml
│   ├── README.md
│   ├── setup.py
│   └── src
│       └── dummy_server
│           ├── __init__.py
│           ├── resources
│           │   ├── __init__.py
│           │   ├── app_info.py
│           │   └── cosine_data.py: Contains logic for WEAT and UMAP calculations
│           └── router
│               ├── app.py
│               ├── __init__.py
│               └── routes.py: Defines the API route
├── helm
│   ├── charts
│   ├── Chart.yaml
│   ├── files
│   ├── templates
│   │   ├── deployment.yaml
│   │   ├── ingress.yaml
│   │   └── service.yaml
│   └── values.yaml
├── react-frontend
│   ├── Dockerfile
│   ├── Dockerfile_local
│   ├── package.json
│   ├── package-lock.json
│   ├── public
│   │   ├── favicon.ico
│   │   ├── index.html
│   │   ├── logo192.png
│   │   ├── logo512.png
│   │   ├── manifest.json
│   │   └── robots.txt
│   ├── README.md
│   ├── src
│   │   ├── App.css
│   │   ├── App.test.tsx
│   │   ├── App.tsx
│   │   ├── components
│   │   │   ├── LayerSelector.css
│   │   │   ├── LayerSelector.tsx
│   │   │   ├── LoadingIndicator.css
│   │   │   ├── LoadingIndicator.tsx
│   │   │   ├── ResetComponentsButton.css
│   │   │   ├── ResetComponentsButton.tsx
│   │   │   ├── ThresholdSlider.css
│   │   │   ├── ThresholdSlider.tsx
│   │   │   ├── TypeSelector.css
│   │   │   ├── TypeSelector.tsx
│   │   │   ├── Visualizations.tsx: Contains code for the d3.js visualizations
│   │   │   └── utils.ts
│   │   ├── index.css
│   │   ├── index.tsx
│   │   ├── logo.svg
│   │   ├── react-app-env.d.ts
│   │   ├── reportWebVitals.ts
│   │   ├── router: API Calls
│   │   │   ├── apiClient.ts
│   │   │   └── resources
│   │   │       └── data.ts
│   │   ├── setupTests.ts
│   │   └── types
│   │       ├── data.ts: Defines data types used
│   │       └── margin.ts
│   └── tsconfig.json
└── README.md
```

## Requirements
<!-- In the ```backend-project > dummy_server > router > appy.py``` file, make sure to add the path to where you have your data stored. -->
<!-- Write here all intructions to build the environment and run your code.\
**NOTE:** If we cannot run your code following these requirements we will not be able to evaluate it. -->

## How to Run

To run the backend
- open the backend folder called "backend-project"
- to start the backend first you need to create a virtual environment using conda
    ```conda create -n nameOfTheEnvironment```
  - to activate the virtual environment run the command ```conda activate nameOfTheEnvironment```
  - install the requirements using the command ```pip3 install .```
  - If you want to make changes and test them in real time, you can install the package in editable mode using the command```pip install -e .```
  - to start the backend use the command ```python3 -m gamut_server.router.app``` or use the ```start-server``` command directly on your terminal

To run the frontend
- Open a new terminal window and go to the project folder
- Enter the frontend folder called "react-frontend"
- Do the following command to start the front end ```npm install```, ```npm start```
<!-- If all the steps have been successfully executed a new browser window witht he dummy project loaded will open automatically. -->

<!-- ## Milestones
Document here the major milestones of your code and future planned steps.\
- [x] Week 1
  - [x] Completed Sub-task: [#20984ec2](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/dummy-fullstack/-/commit/20984ec2197fa8dcdc50f19723e5aa234b9588a3)
  - [x] Completed Sub-task: ...

- [ ] Week 2
  - [ ] Sub-task: [#2](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/dummy-fullstack/-/issues/2)
  - [ ] Sub-task: ... -->

<!-- Create a list subtask.\
Open an issue for each subtask. Once you create a subtask, link the corresponding issue.\
Create a merge request (with corresponding branch) from each issue.\
Finally accept the merge request once issue is resolved. Once you complete a task, link the corresponding merge commit.\
Take a look at [Issues and Branches](https://www.youtube.com/watch?v=DSuSBuVYpys) for more details. 

This will help you have a clearer overview of what you are currently doing, track your progress and organise your work among yourselves. Moreover it gives us more insights on your progress.  

## Weekly Summary 
Write here a short summary with weekly progress, including challanges and open questions.\
We will use this to understand what your struggles and where did the weekly effort go to. -->

<!-- ## Versioning
Create stable versions of your code each week by using gitlab tags.\
Take a look at [Gitlab Tags](https://docs.gitlab.com/ee/topics/git/tags.html) for more details. 

Then list here the weekly tags. \
We will evaluate your code every week, based on the corresponding version.

Tags:
- Week 1: [Week 1 Tag](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/dummy-fullstack/-/tags/stable-readme)
- Week 2: ..
- Week 3: ..
- ... -->


