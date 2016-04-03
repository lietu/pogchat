import {App} from "./app";

var app = new App();
app.start();

(<any>window).app = app;
