class Slider {
    constructor() {
        let captions = [];
        let slides = [];
        let previousDot = document.querySelector(".o-slider__dot_current");
        let previousSlide = document.querySelector(".c-slide_current");
        let previousCaption = document.querySelector(".o-slider__caption-item_current");

        let slider = document.querySelector(".o-slider");

        Array.prototype.forEach.call(document.querySelectorAll(".js-slider-caption"), function(element){
            captions[parseInt(element.getAttribute("data-index"), 10)] = element;
        });

        Array.prototype.forEach.call(document.querySelectorAll(".js-slider-slide"), function(element){
            slides[parseInt(element.getAttribute("data-index"), 10)] = element;
        });

        Array.prototype.forEach.call(document.querySelectorAll(".js-slider-dot"), function(element){

            let index = parseInt(element.getAttribute("data-index"), 10);
            let currentSlide = slides[index];
            let currentCaption = captions[index];
            let currentDot = element;

            element.addEventListener("click", function(){

                if(currentDot == previousDot) return;

                let dotHandler = function(e){
                    e.target.removeEventListener("webkitTransitionEnd", dotHandler);
                    e.target.removeEventListener("transitionend", dotHandler);
                    currentDot.classList.add("o-slider__dot_current");
                };

                let captionHandler = function(e){
                    e.target.removeEventListener("webkitTransitionEnd", captionHandler);
                    e.target.removeEventListener("transitionend", captionHandler);
                    currentCaption.classList.add("o-slider__caption-item_current");
                };

                let slideHandler = function() {
                    //previousSlide.removeEventListener("webkitTransitionEnd", slideHandler);
                    //previousSlide.removeEventListener("transitionend", slideHandler);
                    currentSlide.classList.add("c-slide_current");
                    slider.style.height = "auto";
                };

                previousDot.addEventListener("webkitTransitionEnd", dotHandler);
                previousDot.addEventListener("transitionend", dotHandler);
                previousCaption.addEventListener("webkitTransitionEnd", captionHandler);
                previousCaption.addEventListener("transitionend", captionHandler);

                previousDot.classList.remove("o-slider__dot_current");
                previousCaption.classList.remove("o-slider__caption-item_current");
                slider.style.height = slider.offsetHeight + "px";
                console.log(slider.style.height);
                previousSlide.classList.remove("c-slide_current");

                setTimeout(slideHandler, 1000);

                previousDot = currentDot;
                previousSlide = currentSlide;
                previousCaption = currentCaption;
            });
        });
    }
}

export { Slider };
export default Slider