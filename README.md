# rta_frontend
The web-frontend for FACTs real time analysis.

So far no dev server avaliable. To install dependencies do `npm install .` inside this folder.

## installation for development

Install `node` using your favourite pacakge manager.

Then install some fancy JS stuff

```
npm install -g browserify
npm install -g watchify
```

If you change any JS source file you can compile it into a bundle automagically using 

```
watchify assets/js/main.js -o build_js/bundle.js -v
```
