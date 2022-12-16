const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const port = 3000;
const app = express();

const uri = "mongodb://****/wikiDB";
mongoose.connect(uri, {useNewUrlParser: true});

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static("public"));

const articleSchema = mongoose.Schema(
    {
        title : {
            required: true,
            type: String
        },
        content : {
            required: true,
            type: String
        }
    }
);

const wikiDBModel = mongoose.model('articles', articleSchema);


app.route('/articles')
    .get(function(req, res){
        wikiDBModel.find({}, function(err, results){
            if(err){
                console.log('Error while retriving articles');
                res.send(err);
            }
            else{
                res.send(results);
            }
        });
    })
    .post(function(req, res){
        if(req.body.title.length === 0 || req.body.content.length === 0){
            console.log('Both title and content cant be zero characters, Invalid Input');
            res.status(400).send("Both title and content cant be zero characters, Invalid Input");
        }
        else{
            const newArticle = new wikiDBModel(
                {
                    title : req.body.title,
                    content : req.body.content
                }
            );
            newArticle.save(function(err, result){
                if(err){
                    console.log('Error while saving the article');
                    res.status(400).send("Error while saving article - "+err);
                }
                else{
                    res.status(201).send("Article saved");
                }
            });
        }
    })
    .delete(function(req, res){
        wikiDBModel.deleteMany({}, function(err){
            if(err){
                console.log('Error while deleting all articles');
                res.status(400).send('Error while deleting all articles - '+err);
            }
            else{
                res.status(200).send('Deleted all articles');
            }
        });
    });

app.route('/articles/:articleTitle')
    .get(function(req, res){
        let articleTitle = req.params.articleTitle;
        console.log('test 1 = '+articleTitle);
        errMssg = validateInputArticleTitle(articleTitle);
        if(errMssg.length != 0){
            res.status(400).send(errMssg);
        }
        else{
            wikiDBModel.findOne(
                {title : articleTitle},
                function(err, result){
                    if(err){
                        res.status(400).send("Error while retriving the article record");
                    }
                    else if(result == null || result.length === 0){
                        res.status(404).send("No article found with that title");
                    }
                    else{
                        res.status(200).send(result);
                    }
                }
            );
        }
    })
    .put(function(req, res){
        let articleTitle = req.params.articleTitle;
        errMssg = validateInputArticleTitle(articleTitle);
        if(errMssg.length != 0){
            res.status(400).send(errMssg);
        }
        else{
            if((req.body.title == null || req.body.title.length === 0) || (req.body.content == null || req.body.content.length === 0)){
                console.log('Both title and content cant be null or zero characters, Invalid Input');
                res.status(400).send("Both title and content cant be zero characters, Invalid Input");
            }
            else{
                wikiDBModel.updateOne(
                    {title : articleTitle},
                    {
                        title : req.body.title,
                        content : req.body.content
                    },
                    function(err, results){
                        if(err){
                            res.status(400).send("Error while updating : "+err);
                        }
                        else{
                            res.status(200).send("Successfully updated the article data");
                        }
                    }
                );
            }
        }
    })
    .patch(function(req, res){
        let articleTitle = req.params.articleTitle;
        errMssg = validateInputArticleTitle(articleTitle);
        if(errMssg.length != 0){
            res.status(400).send(errMssg);
        }
        else{
            wikiDBModel.updateOne(
                {title : articleTitle},
                {$set: req.body},
                function(err, result){
                    if(err){                        
                        res.status(400).send("Error while updating: "+err);
                    }
                    else{
                        res.status(200).send("Successfully updated article");
                    }
                }
            );
        } 
    })
    .delete(function(req, res){
        let articleTitle = req.params.articleTitle;
        errMssg = validateInputArticleTitle(articleTitle);
        if(errMssg.length != 0){
            res.status(400).send(errMssg);
        }
        else{
            wikiDBModel.deleteOne(
                {title : articleTitle},
                function(err, result){
                    if(err){
                        res.status(400).send("Error while deleting the article "+err);
                    }
                    else{
                        res.status(200).send("Successfully deleted the article");
                    }
                }
            );
        }
    });

function validateInputArticleTitle(articleTitle){
    if(articleTitle == null || articleTitle.length === 0){
        return "ArticleTitle can't be of zero characters";
    }
    return '';
}

app.listen(port, function(req, res){
    console.log('Hey listening on port 3000');
});