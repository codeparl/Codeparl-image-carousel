/**
 * Image Carousel version 1.0 
 * an image carousel is a collection of hidden images in a div element which are shown 
 * one at a time by sliding in the current image and stays for some seconds until the 
 * next image slides in.
 * 
 * what we need to make the carousel work:
 * 1. a list of images (an array of images)
 * 2. a div element - the iamges container
 * 3. indicators 
 * 4. control button - previous and next
 * 
 * The process:
 * 1. hide all images except the current
 * 2.after n seconds, slide in next image with a higher z-index and position:absolute
 * 3. reset all images to  a lower z-index
 */
//-------------------------------+
//-- AUTHOR: HASSAN MUGABO ------+
//-- EMAIL: cybarox@gmail.com ---+
//-------------------------------+

 (function(){

//define the ImageCarousel object  
 if(typeof ImageCarousel == 'undefined')
 window.ImageCarousel = {};

 //these image nameS will be used to create a dynamic image 
 //collection, but feel free to use your own images in your html file, then set 
//autoGenerated to false .
 ImageCarousel.imageNames = [
    'nemo',
    'toystory',
    'up',
    'walle'
];


ImageCarousel.collection = null; //will hold image wrapper divs
ImageCarousel.indicatorButtons = null; //will hold indicators
ImageCarousel.controls = null; //the div that will hold all the controls
ImageCarousel.interval = null; // will hold an interval number for stopping animation
ImageCarousel.prevButton = null;
ImageCarousel.nextButton =  null;

ImageCarousel.active = null; //the next image to slide in
ImageCarousel.previous = null; //the current image
var currentIndex  = 1; //next image index
var prevIndex  = 0; //current image index


//These are the supported  options for the ImageCarousel object
ImageCarousel.options  = {
autoStart: true,  // true/false - start the slide automatically
autoGenerated: true, //true/false - generate images defined in iamgeNames
container: 'carousel', //the id of the main carousel div element
controlsDiv: 'controls', //the id of the  controls div element
imageWrapper: '#carousel .image-wrapper', //a class for the div that will wrap images
duration: 3, // number of seconds to load the next image 
pauseOnHover: true, //true/false - puase the slide on hover
hideControls: false //true/false - hide all the controls 

};

//check user defined options and replace  the default 
ImageCarousel.initialize= function(options){
    if(options && typeof options == 'object' ){
        for (const opt in options) {
            if (options.hasOwnProperty(opt) && this.options.hasOwnProperty(opt) ) {
                const option = options[opt];
                this.options[opt] =  option;
            }
        }//end  loop
    }//end if 

    //make sure to hide all iamges except the current one.
  if(this.options.autoGenerated == false) 
    this.hideAll();
  

  
};

//a helper method to check whether a given element has a given class
//passed in the parameter className
ImageCarousel.hasClass  = function (element,className){
    return element.classList.contains(className);
};


//Will add the labels on the carousel image wrapper divs
ImageCarousel.addOverlayText =  function (text){
    var p =  document.createElement('p');
    p.className = 'overlayText';
    p.textContent =  text;
    return p;
};



    //Reads the imageNames array and creates iamgeWrapope divs based 
    //on the images found in the assets/images folder
ImageCarousel.createImages = function(){

    //Do not create images if autoGenerated == false
    if(this.options.autoGenerated == false) return;

    ImageCarousel.carousel  =  document.getElementById(this.options.container);
    if(this.options.autoGenerated)
    this.carousel.classList.add('autoGenerated');

    //create image collection equal to the number of image names 
    for (let i = 0; i < this.imageNames.length; i++) {
        const name = this.imageNames[i];
        

        //create an (img) tag and set neccessary attributes
        let img  = document.createElement('img');
        img.src = 'assets/images/'+name+'.jpg';
        


    //create an image wrapper element
    let div =  document.createElement('div');
    div.className = 'image-wrapper';
    div.setAttribute('data-index',i);
        //is this the first  image
        if(i === 0){ 
            //show the first image as the current
            div.classList.add('previous');
            ImageCarousel.previous = div;
            ImageCarousel.previous.style.display= 'block';
            ImageCarousel.previous.style.zIndex= 1;
            ImageCarousel.previous.style.position= 'relative';          
                
        }
      
        //add labels 
        let index =i +1;
        div.appendChild(ImageCarousel.addOverlayText(index+"/"+this.imageNames.length));
        //wrap the (img) in this div

        div.appendChild(img);
        this.carousel.appendChild(div);
    }//end loop
   
 this.hideAll();

};

//create carousel control buttons 
ImageCarousel.controlButtons = function(){
    let prevBtn =  document.createElement('button');
    prevBtn.innerHTML = '←';
    prevBtn.className= 'prev controls-button';
    prevBtn.setAttribute('disabled','disabled');

    let nextBtn =  document.createElement('button');
    nextBtn.className= 'next controls-button';
    nextBtn.innerHTML = '→';

   let div =  document.getElementById(this.options.controlsDiv);
   div.appendChild(prevBtn);
   div.appendChild(nextBtn);
   ImageCarousel.prevButton = prevBtn;
   ImageCarousel.nextButton =  nextBtn;
   this.controls = div;

   
    prevBtn.onclick =  function(){

    //stop the slide
    clearInterval(ImageCarousel.interval);

     let activeIndex =ImageCarousel.getCurrentIndex();

     //make sure the controls display images correctly
    if(activeIndex > 0){
        prevIndex = activeIndex ;
        currentIndex = activeIndex - 1;
   
        ImageCarousel.ShowOlnyCurrent();
        nextBtn.removeAttribute('disabled');

        ImageCarousel.previousImage(prevIndex);
        ImageCarousel.nextImage(currentIndex);
    
      ImageCarousel.cycleAll();
    }else{
        this.setAttribute('disabled','disabled');
        ImageCarousel.cycleAll();
    }
     
        
    
   };

   nextBtn.onclick =  function(){
    clearInterval(ImageCarousel.interval);
    
     let activeIndex =ImageCarousel.getCurrentIndex();
     ImageCarousel.ShowOlnyCurrent();
     prevIndex = activeIndex;
     currentIndex = activeIndex+1;
  
     if(currentIndex === (ImageCarousel.collection.length - 1))
        this.setAttribute('disabled','disabled');
 
     prevBtn.removeAttribute('disabled');
     ImageCarousel.previousImage(prevIndex);
     ImageCarousel.nextImage(currentIndex);

    ImageCarousel.cycleAll();
   };

};

//create and manage indicators
ImageCarousel.indicators = function(){
 let len =   this.collection.length;
 let div  =  document.createElement('div');
     div.className = 'indicators';
 for (let i =0; i < len; i++) {
     let span =  document.createElement('span');
     span.setAttribute('data-index',i);
     if(i ==0) span.className = 'current-indicator';

     span.onclick = function(){
         //pause the slideshow
        clearInterval(ImageCarousel.interval);
        let index  =  parseInt(this.dataset.index,10);
        let activeIndex =ImageCarousel.getCurrentIndex();

        if( activeIndex != index){
             ImageCarousel.ShowOlnyCurrent();
             ImageCarousel.previousImage(activeIndex);
             ImageCarousel.nextImage(index);

             if(index < activeIndex ){
                prevIndex =  index;
                currentIndex = activeIndex;
             }else if(index == 0){
                prevIndex =  index;
                currentIndex = index+1;
             }else{
                prevIndex = index;
                currentIndex = index+1;   
             }
             //resume the sildeshow
           ImageCarousel.cycleAll();
        }else{
            ImageCarousel.cycleAll(); 
        }
     };

     
     div.appendChild(span); 
 }

 let divControls =  document.getElementById(this.options.controlsDiv);
 divControls.appendChild(div);
 this.indicatorButtons = document.querySelectorAll('.indicators span');
};

//find the current image index
ImageCarousel.getCurrentIndex = function(){
    let current =  document.querySelector('.previous');
    let active =  document.querySelector('.active-image');
    current = (active == null ? current : active);
    let activeIndex = parseInt(current.dataset.index,10);
    return  activeIndex;
};

//initiates a slideshow 
ImageCarousel.cycleAll =  function(){
    if(ImageCarousel.options.autoStart){
        let imageCount  =  this.collection.length;
        this.interval =  setInterval(function() {
         ImageCarousel.removeSpans();
         if(prevIndex == 0)
             currentIndex = 1;
         
        let next  = currentIndex % imageCount;
        let prev = prevIndex  % imageCount;

        ImageCarousel.ShowOlnyCurrent();
        ImageCarousel.previousImage(prev);
        ImageCarousel.nextImage(next);

        if(currentIndex > ImageCarousel.collection.length - 1){
            prevIndex = currentIndex - 1;
            currentIndex = 0;
        }
        ++currentIndex;
        ++prevIndex;
        
    },(this.options.duration * 1000) + 500);
    }//end if

};

//removes all span elements on hover
ImageCarousel.removeSpans= function(){
    var spans = document.querySelectorAll('.hover-text');
    if(spans != null)
    spans.forEach(span =>{ImageCarousel.carousel.removeChild(span);});
    };

//manage the pause feature 
ImageCarousel.pauseOnHover =  function(){
    ImageCarousel.carousel.onmouseenter =  function(){
        clearInterval(ImageCarousel.interval);
        ImageCarousel.removeSpans();
        this.appendChild(ImageCarousel.addHoverText('Paused'));
    }

    ImageCarousel.carousel.onmouseleave =  function(){
       let span =  document.querySelector('.hover-text');
       span.textContent = 'Resumed';
       span.classList.add('fadeOut');
       ImageCarousel.cycleAll();        
    };

};

//adds text Puased/resumed on the image wrapper
//when it recieves focus
ImageCarousel.addHoverText =  function(text){
   let span  =  document.createElement('span');
   span.className = 'hover-text';
   span.textContent = text;
   let styles = "display:block; position:absolute;z-index:12;top:46%;left:46%;";
   styles += "border-radius:10%;background-color:rgba(134, 131, 131, 0.493);padding:10px;";
   span.setAttribute('style',styles);
   return span;
};

//show the main image that hte next image will slide on
//this image will have a position relative property
ImageCarousel.previousImage =  function(index){
    ImageCarousel.previous  = ImageCarousel.collection[index];
    ImageCarousel.previous.classList.add('previous');
    ImageCarousel.previous.style.display= 'block';
    ImageCarousel.previous.style.zIndex= 1;
    ImageCarousel.previous.style.position= 'relative';
};

//slide in the next image, this image should have 
//position absolute property in order to slide on top of the current one
ImageCarousel.nextImage =  function(index){
    ImageCarousel.active =  ImageCarousel.collection[index];
    ImageCarousel.active.classList.add('active-image');
    ImageCarousel.active.style.display= 'block';     
    ImageCarousel.active.style.zIndex= 10; 
    ImageCarousel.active.style.position= 'absolute';
    ImageCarousel.indicatorButtons[index].classList.add('current-indicator');
    ImageCarousel.disableButtons(index);
  
};


//hide all images except the current and next
ImageCarousel.ShowOlnyCurrent =  function(){
    ImageCarousel.collection.forEach(w => {
        w.classList.remove('active-image');
        w.classList.remove('previous');
        w.style.display= 'none';
        w.style.zIndex= 1;
    });
    ImageCarousel.indicatorButtons.forEach(i =>{
        i.classList.remove('current-indicator');
    });

};

//disable control buttons if the index is not valid
ImageCarousel.disableButtons =  function(currentIndex){
    if(currentIndex > 0)
    ImageCarousel.prevButton.removeAttribute('disabled');
    else 
    ImageCarousel.prevButton.setAttribute('disabled','disabled');

    if(currentIndex <  ImageCarousel.collection.length -1)
    ImageCarousel.nextButton.removeAttribute('disabled');
    else 
    ImageCarousel.nextButton.setAttribute('disabled','disabled');
};

//hide all images except the active image 
ImageCarousel.hideAll  = function() {
    this.collection = document.querySelectorAll(this.options.imageWrapper);
    if(this.collection != null)
    ImageCarousel.collection.forEach(imageWrapper => {
        if(!ImageCarousel.hasClass(imageWrapper,'previous')) {
            imageWrapper.style.display = 'none';
            imageWrapper.classList.remove('previous');
        }        
    });
};


//This method should be called at the bottom 
//before the closing body tag to run the 
//ImageCarousel.run();
 ImageCarousel.run  =  function(options){
     if(options)
     this.initialize(options);
     else 
     this.initialize();
     this.createImages();
     this.cycleAll();
     this.controlButtons();
     this.indicators();

     if(this.options.hideControls)
         this.controls.style.display = 'none';
     
     if(this.options.pauseOnHover && this.options.autoStart)
        this.pauseOnHover();
     
 };


 })();