# Collaboralist
Simple web app made with React.js for creating and maintaining collaborative shopping lists.

### [Live](https://collaboralist.github.io/)

#### The Design

The core idea behind the app is that every list that is created is generated with a UUID which grants the user a unique link that they can share with others to provide access to the same list or for themselves to use indefinitely. In addition, as a user continues to add items to their list, their entries are automatically saved to the database allowing the app to suggest such entries again in future use; this feature also includes an autofill functionality similar to that observed in Google search.

#### The Guts

Developed using React, Babel, gulp, Firebase, and other miscellaneous technologies. Compatibilty with GitHub Pages is made possible by the utilization of Firebase as a database. Interactions with Firebase handled by [re-base](https://github.com/tylermcginnis/re-base)

### Setup and Run:

    npm install
    gulp