Wildfire Frontend
=====================

Development for Wildfire frontend.
Written in React.js.

### Usage
#### Development
```
npm install
npm start
open http://localhost:3000
```

Now edit `scripts/App.js`.  
Your changes will appear without reloading the browser like in [this video](http://vimeo.com/100010922).

#### Build
```
webpack -p
```

This builds a compressed, minified `bundle.js`. 
Not currently in a separate folder, but this, plus `index.html` is all that’s needed for deployment. 

### Online
See [hosted version](http://wildfire-react.s3-website-us-west-2.amazonaws.com/).