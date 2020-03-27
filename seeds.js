var mongoose = require("mongoose");
var Campground = require("./models/campground.js");
var Comment = require("./models/comment.js");

var data = [
    {
        name: "Himalayas.",
        image: "https://images.pexels.com/photos/2609954/pexels-photo-2609954.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
        description: "ausbsacUBJBsuD ugciusBCUG iuSCBsHCiusdhv gcSIUCBSDCHuSHCUSDCs7wsucjdsnzN>HSIDhcusdbvsv vhusHHvsudgvusVBksbvu hcUIHLCSDCHshLCDIHClis shpJihegcugcCHuegvbdnMBCIsh huigSKBCygevbSK<CBuisgvsbvs cgGCBJSKDchsih",
    },
    {
        name: "Nainital.",
        image: "https://images.pexels.com/photos/730426/pexels-photo-730426.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
        description: "blah blah blah",
    },
    {
        name: "Kasol.",
        image: "https://images.pexels.com/photos/2662816/pexels-photo-2662816.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
        description: "blah blah blah",
    }
]

// function seedDB(){
    //..............remove all campgrounds............//
    // Campground.remove({}, function(err){
        // if(err){
        //     console.log(err);
        // } else{
        //     console.log("removed campgrounds!");
        //     //.............add a few campgrounds..............//
        //     data.forEach(function(seed){
        //         Campground.create(seed, function(err, add){
        //             if(err){
        //                 console.log(err);
        //             } else{
        //                 console.log("added a campground");
        //                 Comment.create(
        //                     {
        //                         text: "place is great, but wished it had an internet connection",
        //                         author: "Homer",
        //                     }, function(err, comment){
        //                         if(err){
        //                             console.log(err);
        //                         } else{
        //                             add.comments.push(comment);
        //                             add.save();
        //                             console.log("added a new comment!!");
        //                         }
        //                     }
        //                 )
        //             }
        //         });
        //     });
        // }
//     });

// }
// module.exports = seedDB;