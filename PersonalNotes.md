1.How to setup projects
  init the node package manager(init node -y)
  make dir structue like this
  root:-
  node_modules
  public
   temp
    .gitkeep
  src
   controller
   db
   middleware
   model
   routes
   utils
   app.js
   constants.js
   index.js
  .env
  .gitignore
  .prettierrc
  .prettierignore
  package-lock.json
  package.json



       
   root/
   ├── node_modules/      # Installed dependencies
   ├── public/            # Static assets (images, CSS, client files)
   │   └── temp/.gitkeep  # Keeps empty folder in Git
   ├── src/               # Application source code
   │   ├── controller/    # Handles business logic
   │   ├── db/            # Database connection
   │   ├── middleware/    # Request middleware (e.g., auth, validation)
   │   ├── model/         # Database schemas & models
   │   ├── routes/        # API route definitions
   │   ├── utils/         # Helper functions, error/success response classes
   │   ├── app.js         # Express app configuration
   │   ├── constants.js   # Application constants
   │   └── index.js       # Entry point
   ├── .env               # Environment variables
   ├── .gitignore         # Files/folders to ignore in Git
   ├── .prettierrc        # Code formatting rules
   ├── .prettierignore    # Files to exclude from formatting
   ├── package.json       # Project configuration & dependencies
   └── package-lock.json  # Dependency lock file


2.what to think when connecting TO DATABASE
  alwsys use async /await
  always use try catch
  DATABASE IS ALWAYS IN OTHER CONTINENT 




3.using custom api for error and sucess (in utils folder)
 
4.use bcyrpt in model(schema)
  add enception in schema
  add deenception in schema
  add access token in schema
  add referesh token in schema
  "use meathods not meathod"
  "use pre to store data befor saving"


5.use --->mongooseAggregatePaginate
 use aggrigation functions
 how to use?
  "videoschema.plugin(mongooseAggregatePaginate)"

  
   