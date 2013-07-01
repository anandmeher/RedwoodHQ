
exports.userTagsGet = function(req, res){
    var app =  require('../common');
    GetUserTags(app.getDB(),{},function(data){
        res.contentType('json');
        res.json({
            success: true,
            tags: data
        });
    });
};

exports.userTagsPost = function(req, res){
    var app =  require('../common');
    var data = req.body;
    delete data._id;
    CreateUserTags(app.getDB(),data,function(returnData){
        res.contentType('json');
        res.json({
            success: true,
            tags: returnData
        });
    });
};

function CreateUserTags(db,data,callback){
    db.collection('userTags', function(err, collection) {
        data._id = db.bson_serializer.ObjectID(data._id);
        collection.insert(data, {safe:true},function(err,returnData){
            callback(returnData);
        });
    });
}

function DeleteUserTags(db,data,callback){
    db.collection('userTags', function(err, collection) {
        collection.remove(data,{safe:true},function(err) {
            if (callback != undefined){
                callback(err);
            }
        });
    });

}

function GetUserTags(db,query,callback){
    var tags = [];
    db.collection('userTags', function(err, collection) {
        collection.find(query, {}, function(err, cursor) {
            cursor.each(function(err, tag) {
                if(tag == null) {
                    callback(tags);
                }
                tags.push(tag);
            });
        })
    })
}

exports.CleanUpUserTags = function(){
    var app =  require('../common');
    var db = app.getDB();

    var callback = function(tags){
        db.collection('users', function(err, collection) {
            tags.forEach(function(tag, index, array){
                collection.find({tag:tag.value}).count(function(err,number){
                    if (number == 0){
                        DeleteUserTags(db,{value:tag.value});
                    }
                });
            });
        });
    };
    GetUserTags(db,{},callback);
};