import LoadResources from "../modules/LoadResources";

export default class LoadScene extends Laya.Scene {

    constructor() { 
        super(); 
        new LoadResources();
    }
}