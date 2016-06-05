import svg4everybody from "svg4everybody";

class Icon {
    constructor() {
        if(typeof(svg4everybody) == "function")
            svg4everybody();
    }
}

export { Icon };
export default Icon;
