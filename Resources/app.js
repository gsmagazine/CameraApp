// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#0CC');

//
// create base UI tab and root window
//
var win1 = Ti.UI.createWindow({
    title:          "Camera test",
    height:         Ti.Platform.displayCaps.platformHeight,
    width:          Ti.Platform.displayCaps.platformWidth,
    fullscreen:     true,
    navBarHidden:   true
});

//Set Scrollable View variables
var view1 = Ti.UI.createView({backgroundImage: Titanium.Filesystem.applicationDataDirectory +'overlay0.png', });
var view2 = Ti.UI.createView({backgroundImage: Titanium.Filesystem.applicationDataDirectory +'overlay1.png', });
var view3 = Ti.UI.createView({backgroundImage: Titanium.Filesystem.applicationDataDirectory +'overlay2.png', });
var views = [view1,view2,view3];
var currentView=scrollableView.getCurrentPage() ;
var viewArray=scrollableView.getViews();

//Create ScrollableView
var scrollableView = Ti.UI.createScrollableView({
  views:[view1,view2,view3],
  showPagingControl:true,
      zIndex : 1,
      	touchEnabled: true,
});


//change button background at scrollend
scrollableView.addEventListener('scrollend',function()
{
	                    viewButton.setBackgroundImage(viewArray[scrollableView.getCurrentPage()].getBackgroundImage( ));
	              
});



function replaceView(scrollableView, oldView, newView)
{
  // loop all the views in the scrollable view
  for (var i = 0, newViews = [], l = scrollableView.views.length; i < l; i++)
  {
    // replace the old view with the new one
    if (i == scrollableView.currentPage)
      newViews.push(newView);
    // leave the other views unchanged
    else
      newViews.push(scrollableView.views[i]);
  }
 
  // update the scrollableView's views array with the new one
  scrollableView.views = newViews;
}

//Create a dialog with options
var dialog = Titanium.UI.createOptionDialog({
    //title of dialog
    title: 'Choose an image source...',
    //options
    options: ['Photo Gallery', 'Cancel'],
    //index of cancel button not valid for ipad
    cancel:1
});
 
//add event listener
dialog.addEventListener('click', function(e) {
    //if first option was selected
 if(e.index == 0)
    {
        //obtain an image from the gallery
        Titanium.Media.openPhotoGallery({
            success:function(event)
            {
                //getting media
                var image = event.media; 
                // set image view
                //checking if it is photo
                if(event.mediaType == Ti.Media.MEDIA_TYPE_PHOTO)
                {
                    //we may create image view with contents from image variable
                    //or simply save path to image
                    var view4 = Ti.UI.createView({backgroundImage: image, });
                    //create a replacement view
                    replaceView(scrollableView, views, view4);
                    var parent = Titanium.Filesystem.applicationDataDirectory;
					var f = Titanium.Filesystem.getFile(parent, 'overlay' +scrollableView.getCurrentPage() +'.png');
					f.write(image);
					//set button backround image 
					viewButton.setBackgroundImage(image);
                }   
            },
            cancel:function()
            {
                //user cancelled the action fron within
                //the photo gallery
            }
        });
    }
    else
    {
        //cancel was tapped
        //user opted not to choose a photo
    }
});
 

//Button to open Camera
var btn1 = Ti.UI.createButton({
    top : 10,
    left : 80,
    height : 250,
    width : 250,
    title : 'CAMERA',
    backgroundColor : '#fff',
});

//button to change overlay image
var btn2 = Ti.UI.createButton({
    top : 10,
    right : 80,
    height : 250,
    width : 250,
	zIndex : 2,
    title : 'LOAD IMAGE',
});

//button to change overlay image
var viewButton = Ti.UI.createImageView({
    top : 10,
    right : 80,
    height : 250,
    width : 250,
	zIndex : 1,
    title : 'LOAD IMAGE',
    backgroundImage : Titanium.Filesystem.applicationDataDirectory +'overlay1.png',
});



//Shoot button
var button = Titanium.UI.createButton({
	color:'#fff',
	bottom:20,
	width:301,
	height:57,
	font:{fontSize:20,fontWeight:'bold',fontFamily:'Helvetica Neue'},
	title:'Take Picture',
	zIndex : 2,
});

//Exit button
var exitButton = Titanium.UI.createButton({
	color:'#fff',
	top:20,
	width:301,
	height:57,
	font:{fontSize:20,fontWeight:'bold',fontFamily:'Helvetica Neue'},
	title:'Exit',
	zIndex : 2,
});


//Event to shoot button
button.addEventListener('click',function()
{
	Ti.Media.takePicture();
});

//Add buttons to main window;
win1.add(btn1);
win1.add(btn2);
win1.add(viewButton);



//Create View for Camera hosting
var test = Titanium.UI.createView({
       height: '100%',
    width: '100%',
	});
	
//Add buttons to camera view
test.add(button);
test.add(exitButton);
test.add(scrollableView);

		//bug resize taken photo
		var cameraTransform = Ti.UI.create2DMatrix();
		cameraTransform = cameraTransform.scale(1);
		//end bugfix

		//Create camera imageview 
		var cameraView = Ti.UI.createImageView();


//Exit button
exitButton.addEventListener('click',function()
{
Ti.Media.hideCamera();
});
//Dialog button to change overlay image
btn2.addEventListener('click',function()
{
dialog.show();
});



btn1.addEventListener('click', function() {
Titanium.Media.showCamera({
              success : function(event) {
	            var cropRect = event.cropRect;
    	        var image = event.media;
        	    if (event.mediaType == Ti.Media.MEDIA_TYPE_PHOTO) {
                													//add taken photo to View
                													cameraView.setImage(event.media);              
                													//Add overlay from Scrollableview
                													cameraView.add(viewArray[scrollableView.getCurrentPage() ]);
                									                //Save view to image 
                									                var viewToImage = cameraView.toImage({honorScaleFactor : true}); 
													                //add image to Photo Gallery
													                Titanium.Media.saveToPhotoGallery(viewToImage);
													                cameraView.remove(viewArray[currentView]);
													                win1.remove(cameraView);
														            } else {
														                alert("got the wrong type back =" + event.mediaType);
														            }
														            },
														            cancel:function()
														            {
														                // create alert
														                var a = Titanium.UI.createAlertDialog({title:'Camera'});
														 
														            },
														            error:function(error)
														            {
														                // create alert
														                var a = Titanium.UI.createAlertDialog({title:'Camera'});
														 
														                // set message
														                if (error.code == Titanium.Media.NO_CAMERA)
														                {
														                    a.setMessage('Device does not have video recording capabilities');
														                }
														                else
														                {
														                    a.setMessage('Unexpected error: ' + error.code);
														                }
														 
														                // show alert
														                a.show();
														            },
														           	transform:cameraTransform,
														            showControls : false,
														            overlay: test,
														            saveToPhotoGallery:false,
														            allowImageEditing:false

							});
						});
//Open main Window
win1.open();
  

