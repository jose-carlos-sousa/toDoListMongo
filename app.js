//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require('mongoose');
const app = express();
const _ =require("lodash")

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect('mongodb+srv://161jmsousa:adminj@cluster0.bmgovzq.mongodb.net/todolistDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const Schema = mongoose.Schema;
const itemSchema = new Schema({
  name: String,
 
});
const Item = mongoose.model('Item', itemSchema);


const ListSchema = new Schema({
  name: String,
  items :[itemSchema]

})
const List =mongoose.model('List',ListSchema)

/* async function deleteAllTasks() {
  try {

    const result = await .deleteMany({});
    console.log(`${result.deletedCount} tasks deleted`);

    // Close the MongoDB connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

deleteAllTasks(); */
async function insertTasks() {
  try {
    const result = await Item.insertMany(defaultItems);
    console.log(`${result.length} tasks inserted`);
  
  } catch (error) {
    console.error('Error inserting tasks:', error);
  }
}
//insertTasks();
async function findTasks() {
  try {
   const results= await Item.find();
   
     
     for (const result of results){
      console.log(result)
     }
     return results
   }
    
  catch (error) {
    console.error('Error finding tasks:', error);
  }
}



app.get("/", async function(req, res) {
  
  try {
    
    const result = await findTasks(); // Wait for the async function to complete
   
    list=[]
    console.log("when loading result is "+ result)
    for(const element of result){
      list.push(element.name)
    }
   
    res.render("list", { listTitle: "Today", newListItems: list });
  } catch (error) {
    // Handle errors here
    res.render("list", { listTitle: "Today", newListItems: list });
    res.status(500).send("An error occurred");
  }
 

 

});
app.get("/:customListName", async (req,res) =>{
  
  const customListName=_.capitalize(req.params.customListName);
  if(customListName==_.capitalize("today")){
    res.redirect("/")
    return; // Return here to prevent further execution
  }
  result= await List.findOne({name:customListName})
  console.log(result)
  if(result){
    //show existing list
    list=[]
    
    for(const element of result.items){
      list.push(element.name)
    }
    res.render("list", { listTitle: customListName, newListItems: list });
  }else{
    //create new list
    const list = new List({
      name: customListName,
      items:[task1,task2,task3]
    })
    list.save()
    res.redirect("/"+customListName)
  
  }
 
})

app.post("/", async function(req, res){

  const itemName = req.body.newItem;
  const listName= req.body.list;

  const item = new Item({
    name: itemName,
    
  });
  if(listName ==="Today"){
    await item.save()  
    await res.redirect("/");
  }else{
    foundList=await List.findOne({name:listName})
    foundList.items.push(item)
    console.log("meti o "+item)
    await foundList.save()
    await res.redirect("/"+listName)
  }
  
  
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.post("/delete",async (req,res)=>{
  const [checkID, listName] = req.body.checkbox.split(',');

  console.log("request index "+checkID+"list name"+listName)

  if(listName==="Today"){
    try {
      let result = await Item.find({});
      let name_=""
      let i=0
      for(const element of result){
        if (i==checkID){
          name_=element.name
        }
        i+=1
        

      }
      console.log("element é"+ name_+"//")
      await Item.findOneAndDelete({name:name_})
      

      await res.redirect("/" + listName);
     
    } catch (error) {
      console.error(error);
      res.status(500).send('Error deleting item.');
    }
  }else{
   
      try {
        let result= await List.findOne({name:listName})
        
        let j=0
        let aux=[]
        let id=""
        for(const element of result.items){
          if(j==checkID){
            
          }else{
            aux.push(element)
          }
          j+=1
        }
        console.log("aux is "+aux)
        result=aux
       
        console.log("result is"+result)
        await List.updateMany({name:listName}, { $set: { items: result} });
        res.redirect("/"+listName)
        
        // Find and delete the item by index/id 
    
       
      } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting item.');
      }
     
    

  }
 
 
})

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
